import { Uri, TextDocument, TextDocumentChangeEvent, CompletionItem, Hover } from "vscode";
import * as vscode from "vscode";
import * as json from 'jsonc-parser'
import * as path from 'path'
import * as fs from 'fs'
import { parseJson, getPropertyNode, getNodeValue } from './utils/json'
import { ImageHelper } from "./imageHelper";
import { Lexer, LexerErrorCode } from "./browser/lexer";
import { Type, IType, Method, Parameter, Property, ArrayType, UnionType, ObjectType, IntersectionType } from "./browser/type";
import { ExpressionContext, Parser, None, ExpressionNode, LiteralNode, ParseResult, ExpressionErrorLevel } from "./browser/parser";
import Snippets from "./snippets";
import { parse, parseExpressionInObject } from "./browser/template";
import { Schema, validateJsonNode } from "./schema";
import { templateSchema } from "./template_schema";

enum ExpType {
    Void,
    Object,
    Array,
    Number,
    String,
    Boolean,
    Function,
    Lambda,
    Other,
}

function nameOfType(type: ExpType) {
    switch (type) {
        case ExpType.Void: return "void";
        case ExpType.Object: return "object";
        case ExpType.Array: return "array";
        case ExpType.Number: return "number";
        case ExpType.String: return "string";
        case ExpType.Boolean: return "bool";
        case ExpType.Function: return "function";
        case ExpType.Lambda: return "lambda";
        default: return "<unknown>";
    }
}

let MIST_EXP_RE = /\$\{.*?\}/mg;
// let MIST_EXP_PREFIX_RE = /([_a-zA-Z0-9.]+)\.([_a-zA-Z][_a-zA-Z0-9]*)?$/;

class Variable {
    name: string;
    type: IType;
    value: any;
    computed: any;
    description: string;
    incomplete: boolean;
    node: json.Node;
    uri: vscode.Uri;

    static unique(vars: Variable[]) {
        let reversed = [...vars].reverse();
        return vars.filter((v, i) => reversed.findIndex(n => n.name === v.name) === vars.length - i - 1);
    }
    
    constructor(name: string, value: any, description?: string, incomplete: boolean = false) {
        this.name = name;
        let a = [[100, 18], [50, 20], [80, 14], [130, 23], [70, 17], [60, 26], [80, 19], [50, 21], [80, 23], [70, 18], [80, 20]];
        
        if (value instanceof IType) {
            this.type = value;
            this.value = None;
        }
        else {
            this.value = value;
        }
        this.description = description;
        this.incomplete = incomplete;
    }

    setNode(node: json.Node, uri: string = null) {
        this.node = node;
        this.uri = uri ? vscode.Uri.file(uri) : null;
        return this;
    }

}

function findLastIndex<T>(list: T[], predicate: (element: T) => boolean): number {
    for (var i = list.length - 1; i >= 0; i--) {
        if (predicate(list[i])) {
            return i;
        }
    }
    return -1;
}

let BUILTIN_VARS = [
    new Variable("_width_", Type.Number, "屏幕宽度"),
    new Variable("_height_", Type.Number, "屏幕高度"),
    new Variable("_mistitem_", Type.Any, "模版对应的 item 对象"),
    new Variable("system", Type.registerType(new Type('system')).registerPropertys({
        "name": new Property(Type.String, "系统名称"),
        "version": new Property(Type.String, "系统版本"),
        "deviceName": new Property(Type.String, "设备名称")
    }), "系统信息"),
    new Variable("screen", Type.registerType(new Type('screen')).registerPropertys({
        "width": new Property(Type.Number, "屏幕宽度"),
        "height": new Property(Type.Number, "屏幕高度"),
        "scale": new Property(Type.Number, "屏幕像素密度"),
        "statusBarHeight": new Property(Type.Number, "状态栏高度"),
        "isPlus": new Property(Type.Boolean, "是否是大屏（iPhone 6/6s/7/8 Plus）"),
        "isSmall": new Property(Type.Boolean, "是否是小屏（iPhone 4/4s/5/5s/SE）"),
        "isX": new Property(Type.Boolean, "是否是 iPhone X"),
        "safeAera": new Property(Type.registerType(new Type('UIEdgeInsets')), "安全区域"),
    }), "屏幕属性"),
    new Variable("app", Type.registerType(new Type('screen')).registerPropertys({
        "isAlipay": new Property(Type.Boolean, "是否是支付宝客户端"),
        "isKoubei": new Property(Type.Boolean, "是否是口碑客户端"),
    }), "应用属性"),
];

export class JsonStringError {
    description: string;
    offset: number;
    length: number;
    constructor(description: string, offset: number, length: number) {
        this.description = description;
        this.offset = offset;
        this.length = length;
    }
}

export class JsonString {
    source: string;
    parsed: string;
    errors: JsonStringError[];
    escapes: {
        parsedIndex: number,
        sourceIndex: number,
        sourceEnd: number
    }[];

    constructor(source: string) {
        this.source = source;
        this.errors = [];
        this.parse();
    }

    sourceIndex(parsedIndex: number): number {
        if (this.escapes.length === 0) return parsedIndex;
        let i = this.escapes.findIndex(e => e.parsedIndex >= parsedIndex);
        if (i >= 0) return this.escapes[i].sourceIndex - this.escapes[i].parsedIndex + parsedIndex;

        let last = this.escapes[this.escapes.length - 1];
        return parsedIndex - last.parsedIndex - 1 + last.sourceEnd;
    }

    parsedIndex(sourceIndex: number): number {
        if (this.escapes.length === 0) return sourceIndex;
        let i = this.escapes.findIndex(e => e.sourceIndex >= sourceIndex);
        if (i >= 0) return this.escapes[i].parsedIndex - this.escapes[i].sourceIndex + sourceIndex;
        
        let last = this.escapes[this.escapes.length - 1];
        if (sourceIndex < last.sourceEnd) {
            return last.parsedIndex;
        }
        return sourceIndex - last.sourceEnd + last.parsedIndex + 1;
    }

    private parse() {
        let origin = this.source;
        let parsed = '';
        let start = 0;
        this.escapes = [];
        for (let i = 0; i < origin.length;) {
            let c = origin.charAt(i);
            if (c === '\\' && i < origin.length - 1) {
                if (i > start) parsed += origin.substring(start, i);
                c = origin.charAt(i + 1);
                let sourceIndex = i;
                let parsedIndex = parsed.length;
                switch (c) {
                    case '"': parsed += '"'; break;
                    case '\\': parsed += '\\'; break;
                    case '/': parsed += '/'; break;
                    case 'b': parsed += '\b'; break;
                    case 'f': parsed += '\f'; break;
                    case 'n': parsed += '\n'; break;
                    case 'r': parsed += '\r'; break;
                    case 't': parsed += '\t'; break;
                    case 'u':
                        let match = origin.substr(i + 2, 4).match(/^[0-9A-Fa-f]*/);
                        let hex = match[0];
                        if (hex.length !== 4) {
                            this.errors.push(new JsonStringError('Invalid unicode sequence in string', i, 2 + hex.length));
                        }
                        else {
                            parsed += String.fromCharCode(parseInt(hex, 16));
                        }
                        i += hex.length;
                        break;
                    default:
                        this.errors.push(new JsonStringError('Invalid escape character in string', i, 2));
                        break;
                }
                i += 2;
                start = i;
                this.escapes.push({
                    sourceIndex: sourceIndex,
                    sourceEnd: i,
                    parsedIndex: parsedIndex
                });
            }
            else {
                i++;
            }
        }
        if (origin.length > start) parsed += origin.substring(start);
        this.parsed = parsed;
    }
}

export class MistData {
    static dataMap: { [dir: string]: { [file: string]: MistData[] } } = {};
    
    template: string;
    file: string;
    data: {};
    node: json.Node;
    start: number;
    end: number;
    index: number;

    static openFile(file: string) {
        let dir = path.dirname(file);
        if (!(dir in this.dataMap)) {
            this.dataMap[dir] = {};
        }
        let text = fs.readFileSync(file).toString();
        if (text) {
            let jsonTree = parseJson(text);
            var results = [];
            let travelTree = (obj: json.Node) => {
                if (obj.type === 'array') {
                    obj.children.forEach(travelTree);
                }
                else if (obj.type === 'object') {
                    let valueForKey = k => {
                        let node = obj.children.find(c => c.children[0].value === k);
                        return node ? node.children[1] : null;
                    }
                    let templateKeys = ["templateId", "template", "blockId"];
                    let dataNode, key;
                    if ((dataNode = valueForKey('data')) && (key = templateKeys.find(k => !!valueForKey(k)))) {
                        let data = new MistData();
                        let templateId: string = valueForKey(key).value;
                        templateId = templateId.replace(/^\w+@/, '');
                        data.template = templateId;
                        data.file = file;
                        data.start = obj.offset;
                        data.end = obj.offset + obj.length;
                        data.data = getNodeValue(dataNode);
                        data.node = dataNode;
                        results.push(data);
                    }
                    else {
                        obj.children.filter(c => c.children.length >= 2).map(c => c.children[1]).forEach(travelTree);
                    }
                }
            }
            travelTree(jsonTree);
            this.dataMap[dir][file] = results;
            Object.keys(MistDocument.documents).forEach(k => MistDocument.documents[k].clearDatas());
        }
    }

    static openDir(dir: string) {
        if (!(dir in this.dataMap)) {
            this.dataMap[dir] = {};
            fs.readdir(dir, (err, files) => {
                if (err) {
                    vscode.window.showErrorMessage(err.message);
                    return;
                }
                let result = new Array<MistData>();
                files.filter(f => f.endsWith(".json")).map(f => {
                    let file = `${dir}/${f}`;
                    this.openFile(file);
                });
            });
        }
    }

    static getData(dir: string, template: string) {
        let dirDatas = this.dataMap[dir];
        let result = [];
        if (dirDatas) {
            for (let file in dirDatas) {
                let datas = dirDatas[file];
                let found = datas.filter(d => d.template === template);
                if (found && found.length > 0) {
                    if (found.length > 1) {
                        found.forEach((d, i) => d.index = i);
                    }
                    result = result.concat(found);
                }
            }
        }
        return result;
    }

    public description() {
        return `${path.basename(this.file)} ${this.index > 0 ? `#${this.index + 1}` : ''}`.trim();
    }
}

class MistNode {
    node: json.Node;
    children: MistNode[];
    parent: MistNode;

    constructor(node: json.Node) {
        this.node = node;
        let children = getPropertyNode(node, 'children');
        if (children && children.type === 'array') {
            this.children = children.children.map(n => {
                let child = new MistNode(n);
                child.parent = this;
                return child;
            })
        }
    }

    property(key: string) {
        let p = getPropertyNode(this.node, key);
        return p ? getNodeValue(p) : null;
    }

    type() {
        var type = this.property('type');
        if (!type) {
            type = this.property('children') ? 'stack' : 'node';
        }
        else if (typeof(type) === 'string' && type.match(/^\${.+}$/)) {
            type = "exp";
        }
        return type;
    }
}

export function getCurrentExpression(exp: string) {
    var index = exp.length - 1;
    var stop = false;
    var braceCount = {};
    const braceDict = {'{': '}', '(': ')', '[': ']'};
    while (index >= 0) {
        var c = exp[index];
        switch (c) {
            case ',':
            case '?':
            case ':':
            case '+':
            case '-':
            case '*':
            case '/':
            case '%':
            case '&':
            case '|':
            case '!':
            case '>':
            case '<':
            case '=':
                if (Object.keys(braceCount).every(k => braceCount[k] === 0)) {
                    stop = true;
                }
                break;
            case '(':
            case '{':
            case '[':
                c = braceDict[c];
                braceCount[c] = (braceCount[c] || 0) - 1;
                if (braceCount[c] < 0) {
                    stop = true;
                }
                break;
            case '\'':
            case '"':
                let quote = c;
                while (--index >= 0) {
                    c = exp[index];
                    if (c === quote) {
                        break;
                    }
                }
                break;
            case ']':
            case ')':
            case '}':
                braceCount[c] = (braceCount[c] || 0) + 1;
        }
        if (stop) {
            break;
        }
        index--;
    }
    return exp.substr(index + 1).trim();
}

export function getPrefix(exp: string): {prefix: string, function: string} {
    let match = /(.*)\.([_a-zA-Z]\w*)?$/.exec(exp);
    let prefix;
    let func;
    if (match) {
        return {
            prefix: match[1],
            function: match[2]
        };
    }
    else {
        return {
            prefix: null,
            function: exp
        };
    }
}

// (1, xx(2, 3), 3) => 3
export function getFunctionParamsCount(exp: string) {
    var index = 1;
    var stop = false;
    var braceCount = {};
    var commaCount = 0;
    let braceDict = {'}': '{', ')': '(', ']': '['};
    while (index < exp.length) {
        var c = exp[index];
        switch (c) {
            case ',':
                if (Object.keys(braceCount).every(k => braceCount[k] === 0)) {
                    commaCount++;
                }
                break;
            case '(':
            case '{':
            case '[':
                braceCount[c] = (braceCount[c] || 0) + 1;
                break;
            case '\'':
            case '"':
                let quote = c;
                while (--index >= 0) {
                    c = exp[index];
                    if (c === quote) {
                        break;
                    }
                }
                break;
            case ']':
            case ')':
            case '}':
                c = braceDict[c];
                braceCount[c] = (braceCount[c] || 0) - 1;
                if (braceCount[c] < 0) {
                    stop = true;
                }
        }
        if (stop) {
            break;
        }
        index++;
    }

    let paramsCount = commaCount + 1;
    if (exp.substring(1, index).match(/^\s*$/)) {
        paramsCount = 0;
    }
    
    return paramsCount;
}

export function getSignatureInfo(exp: string) {
    var index = exp.length - 1;
    var stop = false;
    var braceCount = {};
    var commaCount = 0;
    let braceDict = {'{': '}', '(': ')', '[': ']'};
    while (index >= 0) {
        var c = exp[index];
        switch (c) {
            case ',':
                if (Object.keys(braceCount).every(k => braceCount[k] === 0)) {
                    commaCount++;
                }
                break;
            case '(':
            case '{':
            case '[':
                c = braceDict[c];
                braceCount[c] = (braceCount[c] || 0) - 1;
                if (braceCount[c] < 0) {
                    stop = true;
                }
                break;
            case '\'':
            case '"':
                let quote = c;
                while (--index >= 0) {
                    c = exp[index];
                    if (c === quote) {
                        break;
                    }
                }
                break;
            case ']':
            case ')':
            case '}':
                braceCount[c] = (braceCount[c] || 0) + 1;
        }
        if (stop) {
            break;
        }
        index--;
    }
    if (stop) {
        exp = exp.substr(0, index).trim();
        exp = getCurrentExpression(exp);
        return {
            ...getPrefix(exp),
            paramIndex: commaCount
        };
    }
    
    return null;
}

function isArray(obj: any) {
    return obj instanceof Array;
}

function isObject(obj: any) {
    return obj && typeof(obj) === 'object' && obj.constructor === Object;
}

let ID_RE = /^[_a-zA-Z]\w*$/;
function isId(str: string) {
    return ID_RE.test(str);
}

class TrackExpressionContext extends ExpressionContext {
    private accessed: { [key: string]: boolean[] };

    constructor() {
        super();
        this.accessed = {};
    }

    get(key: string) {
        let list = this.accessed[key];
        if (list && list.length > 0) {
            list[list.length - 1] = true;
        }
        return super.get(key);
    }

    push(key: string, value: any) {
        let list = this.accessed[key];
        if (!list) {
            list = [];
            this.accessed[key] = list;
        }
        list.push(false);
        super.push(key, value);
    }

    pop(key: string) {
        let list = this.accessed[key];
        list.pop();
        return super.get(key);
    }

    isAccessed(key: string): boolean {
        let list = this.accessed[key];
        if (list && list.length > 0) {
            return list[list.length - 1];
        }
        return true;
    }
}

export class MistDocument {
    static documents: { [path: string]: MistDocument } = {}

    public readonly document: TextDocument;
    private datas: MistData[];
    private dataFile: string;
    private dataIndex: number = 0;
    private rootNode: json.Node;
    private nodeTree: MistNode;
    private template: any;

    public static getDocumentByUri(uri: Uri) {
        return MistDocument.documents[uri.toString()];
    }

    public static initialize() {
        vscode.workspace.textDocuments.forEach(d => MistDocument.onDidOpenTextDocument(d));
        if (vscode.workspace.rootPath) {
            MistData.openDir(vscode.workspace.rootPath);
        }
    }

    public static onDidOpenTextDocument(document: TextDocument) {
        if (document.languageId === 'mist') {
            MistDocument.documents[document.uri.toString()] = new MistDocument(document);
            if (document.fileName) {
                MistData.openDir(path.dirname(document.fileName));
            }
        }
    }

    public static onDidCloseTextDocument(document: TextDocument) {
        if (document.languageId === 'mist') {
            MistDocument.documents[document.uri.toString()] = null;
        }
    }

    public static onDidSaveTextDocument(document: TextDocument) {
        if (document.languageId === 'mist') {
            
        }
        else if (document.fileName.endsWith('.json')) {
            MistData.openFile(document.fileName);
        }
    }

    public static onDidChangeTextDocument(event: TextDocumentChangeEvent) {
        if (event.document.languageId === 'mist') {
            let mistDocument = MistDocument.getDocumentByUri(event.document.uri);
            mistDocument.onDidChangeTextDocument(event);
        }
    }
    
    constructor(document: TextDocument) {
        this.document = document;
    }

    public clearDatas() {
        this.datas = null;
    }

    public getRootNode(): json.Node {
        return this.rootNode;
    }

    public getTemplate() {
        this.parseTemplate();
        return this.template;
    }

    public getDatas() {
        if (!this.datas) {
            let file = this.document.fileName;
            let dir = path.dirname(file);
            let templateId = path.basename(file, ".mist");
            this.datas = MistData.getData(dir, templateId);
        }
        return this.datas;
    }

    public setData(file: string, index: number) {
        this.dataFile = file;
        this.dataIndex = index;
    }

    public getData() {
        let datas = this.getDatas();
        if (datas && datas.length > 0) {
            if (this.dataFile == null) {
                this.dataFile = datas[0].file;
            }
            let filterdDatas = datas.filter(d => d.file === this.dataFile);
            if (this.dataIndex < filterdDatas.length) {
                return filterdDatas[this.dataIndex];
            }
        }
        return null;
    }

    public dir() {
        if (this.document.fileName) {
            return path.dirname(this.document.fileName);
        }
        return vscode.workspace.rootPath;
    }

    private valueType(value: any) {
        if (value === null) return 'null';
        if (value instanceof Array) return 'array';
        return typeof(value);
    }

    private schemaType(s: Schema): string {
        if (s && typeof(s) === 'object') {
            if (s.type) return s.type;
            if (s.enum) {
                let set = [...new Set(s.enum.map(e => this.valueType(e)))];
                if (set.length === 1) {
                    return set[0];
                }
                return null;
            }
            if (s.oneOf) {
                let set = [...new Set(s.oneOf.filter(s => s && typeof(s) === 'object' && !s.deprecatedMessage).map(s => this.schemaType(s)))];
                if (set.length === 1) {
                    return set[0];
                }
                return null;
            }
        }
        return null;
    }

    private schemaEnums(s: Schema): [any, string, vscode.CompletionItemKind][] {
        if (s && typeof(s) === 'object') {
            if (s.enum) {
                let enums = s.enum;
                enums = enums.map((e, i) => [e, s.enumDescriptions ? s.enumDescriptions[i] : null, vscode.CompletionItemKind.EnumMember]);
                if (s.type) {
                    enums = enums.filter(e => this.valueType(e[0]) === s.type);
                }
                return enums;
            }
            else if (s.type) {
                switch (s.type) {
                    case 'boolean': return [[true, null, vscode.CompletionItemKind.Constant], [false, null, vscode.CompletionItemKind.Constant]];
                    case 'null': return [[null, null, vscode.CompletionItemKind.Constant]];
                }
            }
            else if (s.oneOf) {
                return s.oneOf.filter(s => s && typeof(s) === 'object' && !s.deprecatedMessage).map(s => this.schemaEnums(s)).reduce((p, c) => {p.push(...c); return p;}, []);
            }
        }
        return [];
    }

    public provideCompletionItems(position: vscode.Position, token: vscode.CancellationToken) {
        let document = this.document;
        let location = json.getLocation(document.getText(), document.offsetAt(position));
        this.parseTemplate();

        // expression suggestions
        var items: CompletionItem[] = [];
        if (!location.isAtPropertyKey) {
            let expression = this.getExpressionAtLocation(location, position);
            if (expression !== null) {
                let { lexerError: error } = parse(expression);
                if (error === LexerErrorCode.UnclosedString) {
                    return [];
                }
                let exp = getCurrentExpression(expression);
                let {prefix: prefix, function: func} = getPrefix(exp);
                let type: IType;
                let ctx = this.contextAtLocation(location);        
                if (prefix) {
                    type = this.expressionTypeWithContext(prefix, ctx.typeContext);
                }
                else {
                    if (document.getText(new vscode.Range(position.translate(0, -1), position)) === '.') {
                        return [];
                    }
                    type = Type.Global;
                    items = items.concat(['true', 'false', 'null', 'nil'].map(s => new CompletionItem(s, vscode.CompletionItemKind.Keyword)));

                    ctx.vars.forEach(v => {
                        let item = new CompletionItem(v.name, vscode.CompletionItemKind.Field);
                        item.detail = v.value !== None ? `"${v.name}": ${JSON.stringify(v.value, null, '\t')}` : `${v.name}: ${v.type.getName()}`;
                        let doc = [];
                        if (v.computed !== None) {
                            doc.push(JSON.stringify(v.computed, null, '\t'));
                        }
                        else if (v.type && v.value === None) {
                            doc.push(v.type.getName());
                        }
                        if (v.description) {
                            doc.push(v.description);
                        }
                        item.documentation = doc.join('\n\n');
                        items.push(item);
                    })
                }
                if (type) {
                    let properties = type.getAllProperties();
                    let methods = type.getAllMethods();
                    items = items.concat(Object.keys(properties).filter(isId).map(k => {
                        let p = properties[k];
                        let item = new vscode.CompletionItem(k, type === Type.Global ? vscode.CompletionItemKind.Constant : vscode.CompletionItemKind.Property);
                        if (p.description) {
                            item.documentation = p.description;
                        }
                        if (p.type) {
                            item.detail = this.propertyName(k, p);
                        }
                        return item;
                    }));
                    items = items.concat(Object.keys(methods).map(k => {
                        let m = methods[k];
                        let item = new vscode.CompletionItem(k, vscode.CompletionItemKind.Method);
                        let funInfo = m[0];
                        let params = funInfo.params || [];
                        let noParams = params.length === 0 && m.length === 1;
                        item.insertText = new vscode.SnippetString(k + (noParams ? '()' : '($0)'));
                        if (!noParams) {
                            item.command = {
                                title: 'Trigger Signature Help',
                                command: "editor.action.triggerParameterHints"
                            };
                        }
                        if (m[0].description) {
                            item.documentation = m[0].description;
                        }
                        item.detail = this.methodName(k, m[0], m.length);
                        return item;
                    }));
                    return items;
                }
                return items;
            }
            else {
                let nodePath = this.nodePath(location.path);
                if (nodePath && nodePath.length >= 2 && nodePath[0] === 'style' && (nodePath[1] === 'image' || nodePath[1] === 'error-image' || nodePath[1] === 'background-image')) {
                    return ImageHelper.provideCompletionItems(this, token);
                }
            }
        }

        // property suggestions
        let node = this.rootNode;
        let matchingSchemas: Schema[] = [];
        let offset = document.offsetAt(position);
        if (!location.isAtPropertyKey && !location.previousNode) {
            // 用 key 的 offset，否则找不到对应的 schema
            let name = location.path[location.path.length - 1];
            let parentNode = json.findNodeAtLocation(node, location.path.slice(0, -1));
            let propNode = parentNode.children.find(n => n.children[0].value === name);
            if (propNode) {
                offset = propNode.children[0].offset;
            }
        }
        validateJsonNode(node, templateSchema, offset, matchingSchemas);
        if (matchingSchemas.length > 0) {
            for (let s of matchingSchemas) {
                if (location.isAtPropertyKey && s && typeof(s) === 'object') {
                    if (s.properties) {
                        let notDeprecated = (s: Schema) => !(s && typeof(s) === 'object' && s.deprecatedMessage);
                        let s1 = s;
                        let existsProperties = json.findNodeAtLocation(node, location.path.slice(0, -1)).children.map(c => c.children[0].value);
                        items.push(...Object.keys(s.properties)
                            .filter(k => notDeprecated(s1.properties[k]))
                            .filter(k => existsProperties.indexOf(k) < 0)
                            .map(k => {
                                let s = s1.properties[k];
                                let item = new CompletionItem(k, vscode.CompletionItemKind.Property);
    
                                if (s && typeof(s) === 'object') {
                                    switch (s.format) {
                                        case 'event': item.kind = vscode.CompletionItemKind.Event; break;
                                    }
                                    if (s.description) {
                                        item.detail = s.description;
                                    }
                                }
    
                                let valueText = () => {
                                    if (!location.isAtPropertyKey) {
                                        return '';
                                    }
                    
                                    let valueText = '';
                                    let comma = false;
                                    if (document.lineAt(position.line).text.substr(position.character + 1).match(/^\s*"/)) {
                                        comma = true;
                                    }
                                    else if (position.line + 1 < document.lineCount && document.lineAt(position.line + 1).text.match(/^\s*"/)) {
                                        comma = true;
                                    }
                                    let value = '$0';
                                    let type = this.schemaType(s);
                                    switch (type) {
                                        case 'string': value = '"$0"'; break;
                                        case 'object': value = '{$0}'; break;
                                        case 'array': value = '[$0]'; break;
                                        case 'null': value = '${0:null}'; break;
                                    }
                                    valueText += `: ${value}`;
                                    if (comma) {
                                        valueText += ',';
                                    }
                                    
                                    return valueText;
                                }
    
                                if (location.previousNode) {
                                    let offset = document.offsetAt(position);
                                    let delta = offset - location.previousNode.offset;
                                    let inQuote = delta > 0 && delta < location.previousNode.length;
                                    if (inQuote) {
                                        item.insertText = new vscode.SnippetString(`${k}"${valueText()}`);
                                        item.range = new vscode.Range(document.positionAt(location.previousNode.offset + 1), document.positionAt(location.previousNode.offset + location.previousNode.length));
                                    }
                                    else {
                                        item.insertText = `"${k}"`;
                                        item.range = new vscode.Range(document.positionAt(location.previousNode.offset), document.positionAt(location.previousNode.offset + location.previousNode.length));
                                    }
                                } else {
                                    item.insertText = new vscode.SnippetString(`"${k}"${valueText()}`);
                                }
                                return item;
                            }));
                    }
                }
                else if (!location.isAtPropertyKey && s && typeof(s) === 'object') {
                    let enums = this.schemaEnums(s);
                    if (location.previousNode) {
                        enums = enums.filter(s => typeof(s[0]) === 'string');
                        items.push(...enums.map(e => {
                            let item = new CompletionItem(e[0], e[2]);
                            if (e[1]) {
                                item.detail = e[1];
                            }
                            item.command = {
                                title: "Move To Line End",
                                command: "mist.moveToLineEnd"
                            };
                            return item;
                        })); 
                    }
                    else {
                        items.push(...enums.map(e => {
                            let item = new CompletionItem(JSON.stringify(e[0]), e[2]);
                            if (e[1]) {
                                item.detail = e[1];
                            }
                            return item;
                        })); 
                    }
                }
            }
        }

        // snippets
        if (!location.previousNode) {
            let nodePath = this.nodePath(location.path);
            let snippets: any = Snippets.nodeSnippets;
            if (nodePath && nodePath.length === 0) {
                let trialingText = this.document.getText(new vscode.Range(position, position.translate(3, 0)));
                let needTrialingComma = trialingText.trim().startsWith('{');
                snippets = Object.keys(snippets).reduce((p, c) => {
                    p[c] = '{\n  ' + snippets[c].replace(/\n/mg, '\n  ') + '\n}';
                    if (needTrialingComma) p[c] += ',';
                    return p;
                }, {});
            }
            else if (nodePath && nodePath.length === 1 && location.isAtPropertyKey) {
                let node = this.nodeAtPath(location.path);
                if (node.node.children.length > 0) {
                    return items;
                }
            }
            else {
                return items;
            }
            items.push(...Object.keys(snippets).map(name => {
                let item = new CompletionItem(name, vscode.CompletionItemKind.Snippet);
                item.insertText = new vscode.SnippetString(snippets[name]);
                return item;
            }));
        }

        return items;
    }

    public provideHover(position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        function findNodeAtLocation(root: json.Node, path: json.JSONPath): json.Node {
            if (!root) {
                return void 0;
            }
            let node = root;
            for (let segment of path) {
                if (typeof segment === 'string') {
                    if (node.type !== 'object') {
                        return void 0;
                    }
                    let found = false;
                    for (let propertyNode of node.children) {
                        if (propertyNode.children[0].value === segment) {
                            if (propertyNode.children.length >= 2) {
                                node = propertyNode.children[1];
                            }
                            else {
                                node = propertyNode;
                            }
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        return void 0;
                    }
                } else {
                    let index = <number>segment;
                    if (node.type !== 'array' || index < 0 || index >= node.children.length) {
                        return void 0;
                    }
                    node = node.children[index];
                }
            }
            return node;
        }
        
        let document = this.document;
        let wordRange = document.getWordRangeAtPosition(position);
        if (wordRange == null || wordRange.start === wordRange.end) {
            return;
        }
        let location = json.getLocation(document.getText(), document.offsetAt(position));
        this.parseTemplate();

        let expression = this.getExpressionAtLocation(location, wordRange.end);
        if (expression != null) {
            expression = getCurrentExpression(expression);
            let isFunction = document.getText(new vscode.Range(wordRange.end, wordRange.end.translate(0, 1))) === '(';
            let contents: vscode.MarkedString[] = [];
            let ctx = this.contextAtLocation(location);
            let {prefix: prefix, function: func} = getPrefix(expression);
            let type: IType;
            if (prefix) {
                type = this.expressionTypeWithContext(prefix, ctx.typeContext);
            }
            else if (!isFunction) {
                let v = ctx.vars.find(v => v.name === func);
                if (v) {
                    if (v.value !== None) {
                        contents.push({ language: 'mist', value: `"${v.name}": ${JSON.stringify(v.value, null, '\t')}` });
                    }
                    if (v.computed !== None) {
                        contents.push({ language: 'json', value: JSON.stringify(v.computed, null, '\t') });
                    }
                    if (v.type) {
                        contents.push({ language: 'typescript', value: v.type.getName() });
                    }
                    if (v.description) {
                        contents.push(v.description);
                    }
                }
            }
            else {
                type = Type.Global;
            }
            if (type) {
                if (isFunction) {
                    let fun = type.getMethods(func);
                    if (fun && fun.length > 0) {
                        let current;
                        if (fun.length > 1) {
                            let paramsCount = getFunctionParamsCount(this.getTrailingExpressionAtLocation(location, wordRange.end));
                            current = fun.find(f => f.params.length === paramsCount);
                        }
                        contents.push({language: 'typescript', value: this.methodName(func, current || fun[0], fun.length)});
                    }
                    else {
                        let prop = type.getProperty(func);
                        if (prop) {
                            contents.push({language: 'typescript', value: this.propertyName(func, prop)});
                        }
                    }
                }
                else {
                    let value = this.expressionValueWithContext(expression, ctx.valueContext);
                    if (value !== None && value !== undefined) {
                        contents.push({ language: 'json', value: JSON.stringify(value, null, '\t') });
                    }
                    let prop = type.getProperty(func);
                    if (prop) {
                        contents.push({language: 'typescript', value: this.propertyName(func, prop)});
                    }
                    else {
                        let fun = type.getMethod(func, 0);
                        if (fun && fun.type && fun.type !== Type.Void) {
                            contents.push({language: 'typescript', value: this.methodName(func, fun, type.getMethods(func).length)});
                        }
                    }
                }
                
            }
            
            return new Hover(contents);
        }
        
        let node = this.rootNode;
        let matchingSchemas: Schema[] = [];
        let range = new vscode.Range(
            document.positionAt(location.previousNode.offset),
            document.positionAt(location.previousNode.offset + location.previousNode.length)
        );
        let offset = document.offsetAt(position);
        validateJsonNode(node, templateSchema, offset, matchingSchemas);
        if (matchingSchemas.length > 0) {
            let s = matchingSchemas[matchingSchemas.length - 1];
            if (location.isAtPropertyKey && s && typeof(s) === 'object') {
                if (s.properties) {
                    s = s.properties[location.previousNode.value];
                }
                else if (s.patternProperties) {
                    s = s.patternProperties;
                }
                else if (typeof(s.additionalProperties) === 'object') {
                    s = s.additionalProperties;
                }
            }
            else if (!location.isAtPropertyKey && s && typeof(s) === 'object') {
                if (s.enum && s.enumDescriptions) {
                    let value = getNodeValue(json.findNodeAtLocation(node, location.path));
                    let index = s.enum.indexOf(value);
                    if (index >= 0) {
                        return new Hover(s.enumDescriptions[index], range);
                    }
                }
            }
            if (s && typeof(s) === 'object' && s.description) {
                return new Hover(s.description, range);
            }
        }
        return null;
    }

    public provideDefinition(position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition> {
        let document = this.document;
        let wordRange = document.getWordRangeAtPosition(position);
        if (wordRange == null || wordRange.start === wordRange.end) {
            return null;
        }
        let location = json.getLocation(document.getText(), document.offsetAt(position));
        this.parseTemplate();

        let expression = this.getExpressionAtLocation(location, wordRange.end);
        if (!expression) {
            return null;
        }
        expression = getCurrentExpression(expression);
        let {prefix: prefix, function: name} = getPrefix(expression);
        if (prefix) {
            return null;
        }
        let isFunction = document.getText(new vscode.Range(wordRange.end, wordRange.end.translate(0, 1))) === '(';
        if (isFunction) {
            return null;
        }
        let ctx = this.contextAtLocation(location);
        let index = findLastIndex(ctx.vars, v => v.name === name);
        if (index >= 0) {
            let v = ctx.vars[index];
            if (v.node) {
                let uri = v.uri || this.document.uri;
                return vscode.workspace.openTextDocument(uri).then(doc => {
                    return new vscode.Location(uri, new vscode.Range(doc.positionAt(v.node.offset), doc.positionAt(v.node.offset + v.node.length)));
                });
            }
        }
        return null;
    }

    public provideSignatureHelp(position: vscode.Position, token: vscode.CancellationToken): vscode.SignatureHelp | Thenable<vscode.SignatureHelp> {
        let document = this.document;
        let location = json.getLocation(document.getText(), document.offsetAt(position));
        this.parseTemplate();

        let expression = this.getExpressionAtLocation(location, position);
        if (expression) {
            let signatureInfo = getSignatureInfo(expression);
            if (signatureInfo) {
                let type: IType;
                if (signatureInfo.prefix) {
                    let ctx = this.contextAtLocation(location);
                    type = this.expressionTypeWithContext(signatureInfo.prefix, ctx.typeContext);
                }
                else {
                    type = Type.Global;
                }
                if (!type) {
                    return null;
                }

                let fun = type.getMethods(signatureInfo.function);
                if (fun && fun.length > 0) {
                    let signatureHelp = new vscode.SignatureHelp();
                    signatureHelp.signatures = fun.map(f => {
                        let signature = new vscode.SignatureInformation(this.methodName(signatureInfo.function, f, fun.length));
                        signature.parameters = (f.params || []).map(p => new vscode.ParameterInformation(`${p.name}: ${p.type.getName()}`));
                        signature.documentation = f.description;
                        return signature;
                    });
                    signatureHelp.activeSignature = 0;
                    signatureHelp.activeParameter = signatureInfo.paramIndex;
                    return signatureHelp;
                }
            }
        }

        return null;
    }

    public validate(): vscode.Diagnostic[] {
        this.parseTemplate();
        if (!this.template) return [];
        let vars: Variable[] = [];
        let typeContext = new TrackExpressionContext();
        let valueContext = new ExpressionContext();

        let diagnostics = [];

        let pushVariable = (v: Variable) => {
            vars.push(v);
            let isExp = false;
            let parsed = parseExpressionInObject(v.value);
            if (this.hasExpression(parsed)) {
                isExp = true;
                v.computed = this.computeExpressionValueInObject(parsed, valueContext);

                if (!v.type) {
                    v.type = this.computeExpressionTypeInObject(parsed, typeContext);
                }
            }
            valueContext.push(v.name, isExp ? v.computed : v.value);
            if (!v.type) {
                v.type = Type.typeof(v.value) || Type.Any;
            }
            if (v.incomplete && v.type instanceof ObjectType) {
                v.type.setIndexType();
            }
            typeContext.push(v.name, v.type);
        };
        let push = (key, value) => pushVariable(new Variable(key, value));
        let pop = key => {
            let index = findLastIndex(vars, v => v.name === key);
            if (index >= 0) {
                if (!typeContext.isAccessed(key)) {
                    let v = vars[index];
                    if (v.node && !v.uri) {
                        let node = v.node.children[0];
                        diagnostics.push(new vscode.Diagnostic(nodeRange(node), `未引用的变量 \`${key}\``, vscode.DiagnosticSeverity.Warning));
                    }
                }
                vars.splice(index, 1);
            }
            typeContext.pop(key);
            valueContext.pop(key);
        };
        let pushDict = dict => Object.keys(dict).forEach(key => push(key, dict[key]));
        let pushVarsDict = (node: json.Node) => {
            let pushed = [];
            node.children.forEach(c => {
                if (c.children.length === 2) {
                    let key = c.children[0].value;
                    pushVariable(new Variable(key, getNodeValue(c.children[1])).setNode(c));
                    pushed.push(key);
                }
            });
            return pushed;
        }

        let range = (offset, length) => {
            let start = this.document.positionAt(offset);
            let end = this.document.positionAt(offset + length);
            return new vscode.Range(start, end);
        }
        let nodeRange = (node: json.Node) => {
            return range(node.offset, node.length);
        }

        let validate = (node: json.Node) => {
            if (!node) return;
            if (node.type === 'object') {
                node.children.forEach(child => {
                    if (child.children.length >= 2) {
                        validate(child.children[1]);
                    }
                });
            }
            else if (node.type === 'array') {
                node.children.forEach(validate);
            }
            else if (node.type === 'string') {
                let expressions = this.findExpressionsInString(node);
                expressions.forEach(exp => {
                    if (exp.string.errors.length > 0) {
                        return;
                    }
                    let { expression: expNode, errorMessage: error, errorOffset: offset, errorLength: length } = parse(exp.string.parsed);
                    if (error) {
                        let start = exp.string.sourceIndex(offset);
                        let end = exp.string.sourceIndex(offset + length);
                        diagnostics.push(new vscode.Diagnostic(range(start + exp.offset + node.offset, end - start), error, vscode.DiagnosticSeverity.Error));
                    }
                    else {
                        let errors = expNode.check(typeContext);
                        if (errors && errors.length > 0) {
                            diagnostics.push(...errors.map(e => {
                                let start = exp.string.sourceIndex(e.offset);
                                let end = exp.string.sourceIndex(e.offset + e.length);
                                return new vscode.Diagnostic(range(start + exp.offset + node.offset, end - start), e.description, 
                                    e.level === ExpressionErrorLevel.Info ? vscode.DiagnosticSeverity.Information :
                                    e.level === ExpressionErrorLevel.Warning ? vscode.DiagnosticSeverity.Warning :
                                    vscode.DiagnosticSeverity.Error);
                            }));
                        }
                    }
                });
            }
        }

        let assertNoExp = (node: json.Node) => {
            if (node && node.type === 'string') {
                let expressions = this.findExpressionsInString(node);
                if (expressions.length > 0) {
                    diagnostics.push(new vscode.Diagnostic(nodeRange(node), '该属性不支持使用表达式', vscode.DiagnosticSeverity.Error));
                }
            }
        }
        
        ['controller', 'identifier', 'async-display', 'cell-height-animation', 'reuse-identifier'].forEach(p => assertNoExp(json.findNodeAtLocation(this.rootNode, [p])));
        
        BUILTIN_VARS.forEach(pushVariable);

        let data = this.getData() ? this.getData().data : {};

        pushDict(data);
        pushVariable(new Variable('_data_', data, '模版关联的数据', true));

        if (this.template.data instanceof Object) {
            validate(json.findNodeAtLocation(this.rootNode, ['data']));
            data = {...data, ...this.template.data};
        }
        pushDict(data);

        pushVariable(new Variable('_data_', data, '模版关联的数据', true));

        pushDict({
            '_item_': Type.Null,
            '_index_': Type.Null,
        });

        validate(json.findNodeAtLocation(this.rootNode, ['state']));
        pushVariable(new Variable('state', this.template.state || null, '模版状态', true));
        
        let validateNode = (node: MistNode) => {
            if (!node) return;
            if (node.node.type === 'string') {
                let expressions = this.findExpressionsInString(node.node);
                if (expressions.length === 1 && expressions[0].offset === 3 && expressions[0].string.source.length === node.node.length - 5) {
                    
                }
                else {
                    diagnostics.push(new vscode.Diagnostic(nodeRange(node.node), '`node` 必须为 `object` 类型', vscode.DiagnosticSeverity.Error));
                    return;
                }
                validate(node.node);
                return;
            }
            else if (node.node.type !== 'object') {
                diagnostics.push(new vscode.Diagnostic(nodeRange(node.node), '`node` 必须为 `object` 类型', vscode.DiagnosticSeverity.Error));
                return;
            }
            let pushed = [];
            let repeatNode = getPropertyNode(node.node, 'repeat');
            if (repeatNode) {
                validate(repeatNode);
                pushVariable(new Variable('_index_', Type.Number, '当前 `repeat` 元素索引'));
                let repeat = parseExpressionInObject(json.getNodeValue(repeatNode));
                let repeatType = this.computeExpressionTypeInObject(repeat, typeContext);
                let valueType = repeatType instanceof ArrayType ? repeatType.getElementsType()
                    : repeatType === Type.Number ? Type.Null : Type.Any; 
                pushVariable(new Variable('_item_', valueType, '当前 `repeat` 元素'));
                pushed.push('_item_', '_index_');
            }
            let varsNode = getPropertyNode(node.node, 'vars');
            if (varsNode) {
                if (varsNode.type === 'array') {
                    varsNode.children.forEach(c => {
                        if (c.type !== 'object') {
                            diagnostics.push(new vscode.Diagnostic(nodeRange(c), '必须为 `object` 类型', vscode.DiagnosticSeverity.Error));
                            return;
                        }
                        validate(c);
                        pushed.push(...pushVarsDict(c));
                    });
                }
                else if (varsNode.type === 'object') {
                    validate(varsNode);
                    pushed.push(...pushVarsDict(varsNode));
                }
                else {
                    diagnostics.push(new vscode.Diagnostic(nodeRange(varsNode), '`vars` 属性只能为 `object` 或 `array`', vscode.DiagnosticSeverity.Error));
                }
            }
            const list = ['repeat', 'vars', 'children'];
            let otherNodes = node.node.children.filter(n => n.children.length === 2 && list.indexOf(n.children[0].value) < 0).map(n => n.children[1]);
            otherNodes.forEach(validate);

            if (node.children) {
                node.children.forEach(validateNode);
            }
            pushed.forEach(pop);
        };

        validateNode(this.nodeTree);
        
        return diagnostics;
    }

    private onDidChangeTextDocument(event: TextDocumentChangeEvent) {
        this.template = null;
        this.rootNode = null;
    }

    private parseTemplate() {
        if (!this.rootNode || !this.template) {
            this.rootNode = parseJson(this.document.getText());
            if (this.rootNode) {
                this.template = getNodeValue(this.rootNode);
                let layoutNode = getPropertyNode(this.rootNode, "layout");
                if (layoutNode) {
                    this.nodeTree = new MistNode(layoutNode);
                }
            }
        }
    }

    // "abc ${expression1} ${a + max(a, b.c|) + d} xxx" -> ") + d"
    private getTrailingExpressionAtLocation(location: json.Location, position: vscode.Position) {
        let document = this.document;
        if (!location.isAtPropertyKey && location.previousNode.type === 'string') {
            let start = location.previousNode.offset + 1;
            let end = location.previousNode.offset + location.previousNode.length - 1;
            let str = document.getText(new vscode.Range(document.positionAt(start), document.positionAt(end)));
            let pos = document.offsetAt(position) - start;
            let match;
            MIST_EXP_RE.lastIndex = 0;
            while (match = MIST_EXP_RE.exec(str)) {
                if (pos >= match.index + 2 && pos <= match.index + match[0].length - 1) {
                    let str = match[0].slice(pos - match.index, -1);
                    return json.parse(`"${str}"`);
                }
            }
        }
        return null;
    }

    // "abc ${expression1} ${a + max(a, b.c|) + d} xxx" -> "a + max(a, b.c"
    private getExpressionAtLocation(location: json.Location, position: vscode.Position) {
        let document = this.document;
        if (!location.isAtPropertyKey && location.previousNode && location.previousNode.type === 'string') {
            let start = location.previousNode.offset + 1;
            let end = location.previousNode.offset + location.previousNode.length - 1;
            let str = document.getText(new vscode.Range(document.positionAt(start), document.positionAt(end)));
            let pos = document.offsetAt(position) - start;
            let match;
            MIST_EXP_RE.lastIndex = 0;
            while (match = MIST_EXP_RE.exec(str)) {
                if (pos >= match.index + 2 && pos <= match.index + match[0].length - 1) {
                    let str = match[0].substring(2, pos - match.index);
                    return json.parse(`"${str}"`);
                }
            }
        }
        return null;
    }

    private nodeAtOffset(node: MistNode, offset: number) {
        if (offset > node.node.offset && offset < node.node.offset + node.node.length) {
            if (node.children) {
                for (let child of node.children) {
                    let node = this.nodeAtOffset(child, offset);
                    if (node) {
                        return node;
                    }
                }
            }
            return node;
        }
        return null;
    }

    private nodePath(path: json.Segment[]): json.Segment[] {
        if (path.length > 0 && path[0] === "layout") {
            let start = 1;
            while (start + 1 < path.length && path[start] === "children" && path[start + 1] as number !== undefined) {
                start += 2;
            }
            return path.slice(start);
        }
        
        return null;
    }

    private nodeAtPath(path: json.Segment[]) {
        if (!(path.length >= 1 && path[0] === 'layout')) {
            return null;
        }
        path.splice(0, 1);
        let node = this.nodeTree;
        while (path.length >= 2 && path[0] === 'children' && typeof(path[1]) === 'number') {
            node = node.children[path[1]];
            path.splice(0, 2);
        }
        return node;
    }

    private computeExpressionValueInObject(obj: any, context: ExpressionContext) {
        if (obj instanceof ExpressionNode) {
            return obj.compute(context);
        }
        else if (obj instanceof Array) {
            let list = obj.map(o => this.computeExpressionValueInObject(o, context));
            return list.some(v => v === None) ? None : list;
        }
        else if (obj && obj !== None && typeof(obj) === 'object') {
            let values = Object.keys(obj).map(k => this.computeExpressionValueInObject(obj[k], context));
            if (values.some(v => v === None)) return None;
            return Object.keys(obj).reduce((p, c, i) => { p[c] = values[i]; return p; }, {});
        }
        return obj;
    }

    private computeExpressionTypeInObject(obj: any, context: ExpressionContext) {
        if (obj instanceof ExpressionNode) {
            return obj.getType(context);
        }
        else if (obj instanceof Array) {
            return new ArrayType(IntersectionType.type(obj.map(o => this.computeExpressionTypeInObject(o, context))));
        }
        else if (obj && obj !== None && typeof(obj) === 'object') {
            return new ObjectType(Object.keys(obj).reduce((p, c) => { p[c] = this.computeExpressionTypeInObject(obj[c], context); return p; }, {}));
        }
        return Type.typeof(obj);
    }

    private hasExpression(obj: any) {
        if (obj instanceof ExpressionNode) {
            return true;
        }
        else if (obj instanceof Array) {
            return obj.some(o => this.hasExpression(o));
        }
        else if (obj && obj !== None && typeof(obj) === 'object') {
            return Object.keys(obj).some(k => this.hasExpression(obj[k]));
        }
        return false;
    }

    private contextAtLocation(location: json.Location): {
        vars: Variable[],
        valueContext: ExpressionContext,
        typeContext: ExpressionContext
    } {
        let vars: Variable[] = [];
        let typeContext = new ExpressionContext();
        let valueContext = new ExpressionContext();

        let pushVariable = (v: Variable) => {
            vars.push(v);
            let isExp = false;
            let parsed = parseExpressionInObject(v.value);
            if (this.hasExpression(parsed)) {
                isExp = true;
                v.computed = this.computeExpressionValueInObject(parsed, valueContext);

                if (!v.type) {
                    v.type = this.computeExpressionTypeInObject(parsed, typeContext);
                }
            }
            valueContext.push(v.name, isExp ? v.computed : v.value);
            if (!v.type) {
                v.type = Type.typeof(v.value) || Type.Any;
            }
            if (v.incomplete && v.type instanceof ObjectType) {
                v.type.setIndexType();
            }
            typeContext.push(v.name, v.type);
        };
        let push = (key, value) => pushVariable(new Variable(key, value));
        let pushDict = dict => Object.keys(dict).forEach(key => push(key, dict[key]));
        let pushVarsDict = (node: json.Node) => {
            if (!node) return [];
            let pushed = [];
            node.children.forEach(c => {
                if (c.children.length === 2) {
                    let key = c.children[0].value;
                    pushVariable(new Variable(key, getNodeValue(c.children[1])).setNode(c));
                    pushed.push(key);
                }
            });
            return pushed;
        }
        
        BUILTIN_VARS.forEach(pushVariable);
        
        let data = this.getData();
        let dataDict = data ? data.data : {};

        if (data) {
            data.node.children.forEach(c => {
                if (c.children.length === 2) {
                    let key = c.children[0].value;
                    pushVariable(new Variable(key, getNodeValue(c.children[1])).setNode(c, data.file));
                }
            });
        }
        
        pushVariable(new Variable('_data_', dataDict, '模版关联的数据', true));

        if (this.template.data instanceof Object) {
            dataDict = {...dataDict, ...this.template.data};
        }
        pushVarsDict(json.findNodeAtLocation(this.rootNode, ['data']));

        pushVariable(new Variable('_data_', dataDict, '模版关联的数据', true));

        if (location.path[0] !== 'data' && location.path[0] !== 'state') {
            pushVariable(new Variable('state', this.template.state || null, '模版状态', true));
        }
        
        let path = [...location.path];
        let node = this.nodeAtPath(path);
        let inVars = path.length > 0 && path[0] === 'vars';
        let inRepeat = path.length > 0 && path[0] === 'repeat';
        let nodeStack = [];
        while (node) {
            nodeStack.push(node);
            node = node.parent;
        }
        while (nodeStack.length > 0) {
            let node = nodeStack.pop();
            if (!(inRepeat && nodeStack.length === 0)) {
                let repeatNode = getPropertyNode(node.node, 'repeat');
                if (repeatNode) {
                    pushVariable(new Variable('_index_', Type.Number, '当前 `repeat` 元素索引'));
                    let repeat = parseExpressionInObject(json.getNodeValue(repeatNode));
                    let repeatType = this.computeExpressionTypeInObject(repeat, typeContext);
                    let valueType = repeatType instanceof ArrayType ? repeatType.getElementsType()
                        : repeatType === Type.Number ? Type.Null : Type.Any; 
                    pushVariable(new Variable('_item_', valueType, '当前 `repeat` 元素'));
                }
                let varsNode = getPropertyNode(node.node, 'vars');
                if (varsNode) {
                    if (varsNode.type === 'array') {
                        var count = varsNode.children.length;
                        if (path.length >= 2 && path[0] === 'vars' && typeof(path[1]) === 'number') {
                            count = path[1] as number;
                        }
                        for (var i = 0; i < count; i++) {
                            pushVarsDict(varsNode.children[i]);
                        }
                    }
                    else if (varsNode.type === 'object') {
                        pushVarsDict(varsNode);
                    }
                }
            }
        }

        return {
            vars: Variable.unique(vars),
            valueContext: valueContext,
            typeContext: typeContext   
        };
    }

    private expressionTypeWithContext(expression: string, context: ExpressionContext) {
        let { expression: node, errorMessage: error } = parse(expression);
        if (error || !node) {
            return null;
        }
        else {
            return node.getType(context);
        }
    }

    private expressionValueWithContext(expression: string, context: ExpressionContext) {
        let { expression: node, errorMessage: error } = parse(expression);
        if (error || !node) {
            return null;
        }
        else {
            return node.compute(context);
        }
    }

    private propertyName(name: string, property: Property) {
        return `${property.ownerType !== Type.Global ? '(property) ' : ''}${property.ownerType && property.ownerType !== Type.Global ? property.ownerType.getName() + '.' : ''}${name}: ${property.type.getName()}`;
    }

    private methodName(name: string, method: Method, count: number) {
        let returnType = method.type ? method.type.getName() : 'void';
        return `${method.ownerType !== Type.Global ? '(method) ' : ''}${method.ownerType && method.ownerType !== Type.Global ? method.ownerType.getName() + '.' : ''}${name}(${(method.params || []).map(p => `${p.name}: ${p.type.getName()}`).join(', ')}): ${returnType}${count > 1 ? ` (+${count - 1} overload${count > 2 ? 's' : ''})` : ''}`
    }

    private findExpressionsInString(stringNode: json.Node): {
        string: JsonString,
        offset: number
    }[] {
        let position = this.document.positionAt(stringNode.offset);
        let rawString = this.document.getText(new vscode.Range(position, position.translate(0, stringNode.length)));
        const re = /\$\{(.*?)\}/mg;
        re.lastIndex = 0;
        let results = [];
        let match: RegExpExecArray;
        while (match = re.exec(rawString)) {
            results.push({
                string: new JsonString(match[1]),
                offset: match.index + 2
            });
        }
        return results;
    }

}