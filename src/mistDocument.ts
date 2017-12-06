import { Uri, TextDocument, TextDocumentChangeEvent, CompletionItem, Hover } from "vscode";
import * as vscode from "vscode";
import * as json from 'jsonc-parser'
import * as path from 'path'
import * as fs from 'fs'
import { parseJson, getPropertyNode, getNodeValue } from './utils/json'
import { functions } from './functions';
import { Properties, PropertyInfo, Event, BasicType } from "./properties";
import { ImageHelper } from "./imageHelper";
import { Lexer, LexerErrorCode } from "./lexer";
import { Type, IType, Method, Parameter, Property, ArrayType, UnionType, ObjectType, IntersectionType } from "./type";
import { ExpressionContext, Parser, None, ExpressionNode, LiteralNode } from "./parser";

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

class Property1 {
    type: string | { [property: string]: Property1 };
    comment: string;

    constructor(type: string | { [property: string]: Property1 }, comment: string = null) {
        this.type = type;
        this.comment = comment;
    }

    getType() {
        if (typeof(this.type) === 'string') {
            return this.type;
        }
        else {
            return 'NSDictionary*';
        }
    }
}

class Variable {
    name: string;
    type: IType;
    value: any;
    computed: any;
    description: string;

    constructor(name: string, value: any, description?: string) {
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
    }

    static unique(vars: Variable[]) {
        let reversed = [...vars].reverse();
        return vars.filter((v, i) => reversed.findIndex(n => n.name === v.name) === vars.length - i - 1);
    }
}

class StringConcatExpressionNode extends ExpressionNode {
    expressions: ExpressionNode[];

    constructor(expressions: ExpressionNode[]) {
        super();
        this.expressions = expressions;
    }

    compute(context: ExpressionContext) {
        let computed = this.expressions.map(e => e.compute(context));
        if (computed.some(v => v === None)) return None;
        return computed.join('');
    }

    getType(context: ExpressionContext): IType {
        return Type.String;
    }

    check(context: ExpressionContext) {
        return this.expressions.reduce((p, c) => p.concat(c.check(context)), []);
    }
}

let BUILTIN_VARS = [
    new Variable("_width_", Type.Number, "屏幕宽度"),
    new Variable("_height_", Type.Number, "屏幕高度"),
    new Variable("_mistitem_", Type.registerType(new Type('VZMistItem')), "模版对应的 item 对象"),
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
            if (c == '\\' && i < origin.length - 1) {
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

class MistData {
    template: string;
    file: string;
    data: {};
    start: number;
    end: number;
    index: number;

    static dataMap: { [dir: string]: { [file: string]: MistData[] } } = {};
    
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
                        let node = obj.children.find(c => c.children[0].value == k);
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
        if (children && children.type == 'array') {
            this.children = children.children.map(n => {
                let child = new MistNode(n);
                child.parent = this;
                return child;
            })
        }
    }

    property(key: string) {
        let p = getPropertyNode(this.node, key);
        return p ? json.getNodeValue(p) : null;
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
                if (Object.keys(braceCount).every(k => braceCount[k] == 0)) {
                    stop = true;
                }
                break;
            case '(':
            case '{':
            case '[':
                c = braceDict[c];
                braceCount[c] = (braceCount[c]||0) - 1;
                if (braceCount[c] < 0) {
                    stop = true;
                }
                break;
            case '\'':
            case '"':
                let quote = c;
                while (--index >= 0) {
                    c = exp[index];
                    if (c == quote) {
                        break;
                    }
                }
                break;
            case ']':
            case ')':
            case '}':
                braceCount[c] = (braceCount[c]||0) + 1;
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
                if (Object.keys(braceCount).every(k => braceCount[k] == 0)) {
                    commaCount++;
                }
                break;
            case '(':
            case '{':
            case '[':
                braceCount[c] = (braceCount[c]||0) + 1;
                break;
            case '\'':
            case '"':
                let quote = c;
                while (--index >= 0) {
                    c = exp[index];
                    if (c == quote) {
                        break;
                    }
                }
                break;
            case ']':
            case ')':
            case '}':
                c = braceDict[c];
                braceCount[c] = (braceCount[c]||0) - 1;
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
                if (Object.keys(braceCount).every(k => braceCount[k] == 0)) {
                    commaCount++;
                }
                break;
            case '(':
            case '{':
            case '[':
                c = braceDict[c];
                braceCount[c] = (braceCount[c]||0) - 1;
                if (braceCount[c] < 0) {
                    stop = true;
                }
                break;
            case '\'':
            case '"':
                let quote = c;
                while (--index >= 0) {
                    c = exp[index];
                    if (c == quote) {
                        break;
                    }
                }
                break;
            case ']':
            case ')':
            case '}':
                braceCount[c] = (braceCount[c]||0) + 1;
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

function registerTypes() {
    const aliases = {
        "NSString": "string",
        "NSNumber": "number",
        "CGFloat": "number",
        "float": "number",
        "double": "number",
        "int": "number",
        "uint": "number",
        "NSInteger": "number",
        "NSUInteger": "number",
        "BOOL": "boolean",
        "id": "any",
        "NSArray": "array",
        "NSDictionary": "object"
    }
    let typeName = name => aliases[name.replace('*', '')] || name;
    let getType = name => name ? Type.getType(typeName(name)) || Type.registerType(new Type(typeName(name))) : Type.Void;
    Object.keys(functions).forEach(name => {
        let funs = functions[name];
        let typeN = typeName(name);
        let type = Type.getType(typeN);
        if (!type) {
            type = Type.registerType(new Type(typeN));
        }
        Object.keys(funs).forEach(fun => {
            funs[fun].forEach(info => {
                let doc = info.comment;
                if (info.deprecated) {
                    doc = `[Deprecated] ${info.deprecated}\n${doc || ''}`.trim();
                }
                type.registerMethod(fun, new Method(getType(info.return), doc, (info.params || []).map(p => new Parameter(p.name, getType(p.type) || Type.Any))));
            });
        });
    });

    const properties = {
        "NSString": {
            "length": {
                "type": "NSUInteger",
                "comment": "字符串长度"
            }
        },
        "NSArray": {
            "count": {
                "type": "NSUInteger",
                "comment": "数组元素数量"
            }
        },
        "NSDictionary": {
            "count": {
                "type": "NSUInteger",
                "comment": "字典元素数量"
            }
        },
        "VZMistItem": {
            "tplController": {
                "type": "VZMistTemplateController", 
                "comment": "模版关联的 template controller"
            }
        },
        "CGPoint": {
            "x": {
                "type": "CGFloat"
            },
            "y": {
                "type": "CGFloat"
            }
        },
        "CGSize": {
            "width": {
                "type": "CGFloat"
            },
            "height": {
                "type": "CGFloat"
            }
        },
        "CGRect": {
            "origin": {
                "type": "CGPoint"
            },
            "size": {
                "type": "CGSize"
            },
            "x": {
                "type": "CGFloat"
            },
            "y": {
                "type": "CGFloat"
            },
            "width": {
                "type": "CGFloat"
            },
            "height": {
                "type": "CGFloat"
            }
        },
        "UIEdgeInsets": {
            "top": {
                "type": "CGFloat"
            },
            "left": {
                "type": "CGFloat"
            },
            "bottom": {
                "type": "CGFloat"
            },
            "right": {
                "type": "CGFloat"
            }
        },
        "NSRange": {
            "location": {
                "type": "NSUInteger"
            },
            "length": {
                "type": "NSUInteger"
            }
        },
        "CGVector": {
            "dx": {
                "type": "CGFloat"
            },
            "dy": {
                "type": "CGFloat"
            }
        },
        "UIOffset": {
            "horizontal": {
                "type": "CGFloat"
            },
            "vertical": {
                "type": "CGFloat"
            }
        },
    };

    Object.keys(properties).forEach(name => {
        let props = properties[name];
        name = typeName(name);
        let type = Type.getType(name);
        if (!type) {
            console.error(`type '${name}' not found`);
            return;
        }
        Object.keys(props).forEach(prop => {
            let info = props[prop];
            let propType: IType;
            let comment: string;
            if (typeof(info.type) === 'string') {
                propType = getType(info.type);
                comment = info.comment;
            }
            else if (typeof(info) === 'object') {
                propType = Type.typeof(info);
            }
            type.registerProperty(prop, new Property(propType, comment));
        })
    });
}

registerTypes();

class Cache<T> {
    private maxCount: number;
    private dict: { [key: string]: T };
    private keys: string[];

    constructor(maxCount: number) {
        this.maxCount = maxCount;
        this.dict = {};
        this.keys = [];
    }

    get(key: string): T {
        if (key in this.dict) {
            let index = this.keys.indexOf(key);
            this.keys.splice(index, 1);
            this.keys.push(key);
            return this.dict[key];
        }
        
        return null;
    }

    set(key: string, value: T) {
        if (!(key in this.dict)) {
            this.keys.push(key);
            if (this.keys.length > this.maxCount) {
                this.keys.splice(0, 1);
            }
        }
        this.dict[key] = value;
    }
}

export class MistDocument {
    static documents: { [path: string]: MistDocument } = {}

    private document: TextDocument;
    private datas: MistData[];
    private dataFile: string;
    private dataIndex: number = 0;
    private rootNode: json.Node;
    private nodeTree: MistNode;
    private template: any;
    private expCache: Cache<any>;

    constructor(document: TextDocument) {
        this.document = document;
        this.expCache = new Cache(200);
    }

    public clearDatas() {
        this.datas = null;
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

    public static getDocumentByUri(uri: Uri) {
        let path = uri.fsPath;
        return MistDocument.documents[path];
    }

    public static initialize() {
        vscode.workspace.textDocuments.forEach(d => MistDocument.onDidOpenTextDocument(d));
        if (vscode.workspace.rootPath) {
            MistData.openDir(vscode.workspace.rootPath);
        }
    }

    public static onDidOpenTextDocument(document: TextDocument) {
        if (document.languageId === 'mist') {
            MistDocument.documents[document.uri.fsPath] = new MistDocument(document);
            if (document.fileName) {
                MistData.openDir(path.dirname(document.fileName));
            }
        }
    }

    public static onDidCloseTextDocument(document: TextDocument) {
        if (document.languageId === 'mist') {
            let path = document.uri.fsPath;
            MistDocument.documents[path] = null;
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
    
    private onDidChangeTextDocument(event: TextDocumentChangeEvent) {
        this.template = null;
        this.rootNode = null;
    }

    public dir() {
        if (this.document.fileName) {
            return path.dirname(this.document.fileName);
        }
        return vscode.workspace.rootPath;
    }

    private parseTemplate() {
        if (!this.rootNode || !this.template) {
            this.rootNode = parseJson(this.document.getText());
            this.template = getNodeValue(this.rootNode);
            let layoutNode = getPropertyNode(this.rootNode, "layout");
            if (layoutNode) {
                this.nodeTree = new MistNode(layoutNode);
            }
        }
    }

    // "abc ${expression1} ${a + max(a, b.c|) + d} xxx" -> ") + d"
    private getTrailingExpressionAtLocation(location: json.Location, position: vscode.Position) {
        let document = this.document;
        if (!location.isAtPropertyKey && location.previousNode.type == 'string') {
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
        if (!location.isAtPropertyKey && location.previousNode.type == 'string') {
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
        if (path.length > 0 && path[0] == "layout") {
            let start = 1;
            while (start + 1 < path.length && path[start] == "children" && path[start + 1] as number != undefined) {
                start += 2;
            }
            return path.slice(start);
        }
        
        return [];
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

    private parse(exp: string) {
        let parsed = this.expCache.get(exp);
        if (!parsed) {
            parsed = Parser.parse(exp);
            this.expCache.set(exp, parsed);
        }
        return parsed;
    }

    private parseExpressionInString(source: string) {
        const re = /\$\{(.*?)\}/mg;
        re.lastIndex = 0;
        let match: RegExpExecArray;
        let index = 0;
        let parts: ExpressionNode[] = [];
        while (match = re.exec(source)) {
            let exp = match[1];
            let { expression: node, errorMessage: error } = this.parse(exp);
            if (error || !node) {
                node = new LiteralNode(None);
            }
            if (match.index === 0 && re.lastIndex === source.length) {
                return node;
            }
            else {
                if (match.index > index) {
                    parts.push(new LiteralNode(source.slice(index, match.index)));
                }
                parts.push(node);
                index = re.lastIndex;
            }
        }
        if (parts.length === 0) {
            return null;
        }
        if (index < source.length) {
            parts.push(new LiteralNode(source.slice(index)));
        }
        return new StringConcatExpressionNode(parts);
    }

    private parseExpressionInObject(obj: any) {
        if (typeof(obj) === 'string') {
            let exp = this.parseExpressionInString(obj);
            if (exp) {
                return exp;
            }
            return obj;
        }
        else if (obj instanceof Array) {
            return obj.map(o => this.parseExpressionInObject(o));
        }
        else if (obj && obj !== None && typeof(obj) === 'object') {
            return Object.keys(obj).reduce((p, c) => { p[c] = this.parseExpressionInObject(obj[c]); return p; }, {});
        }
        return obj;
    }

    private computeExpressionValueInObject(obj: any, context: ExpressionContext) {
        if (obj instanceof ExpressionNode) {
            return obj.compute(context);
        }
        else if (obj instanceof Array) {
            return obj.map(o => this.computeExpressionValueInObject(o, context));
        }
        else if (obj && obj !== None && typeof(obj) === 'object') {
            return Object.keys(obj).reduce((p, c) => { p[c] = this.computeExpressionValueInObject(obj[c], context); return p; }, {});
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

        let pushVariable = v => {
            vars.push(v);
            let isExp = false;
            let parsed = this.parseExpressionInObject(v.value);
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
            typeContext.push(v.name, v.type);
        };
        let push = (key, value) => pushVariable(new Variable(key, value));
        let pushDict = dict => Object.keys(dict).forEach(key => push(key, dict[key]));
        
        BUILTIN_VARS.forEach(pushVariable);
        
        let data = this.getData() ? this.getData().data : {};

        pushDict(data);
        pushVariable(new Variable('_data_', Object.keys(data).length === 0 ? Type.Object : data, '模版关联的数据'));

        if (this.template.data instanceof Object) {
            data = {...data, ...this.template.data};
        }
        pushDict(data);

        pushVariable(new Variable('_data_', Object.keys(data).length === 0 ? Type.Object : data, '模版关联的数据'));

        if (location.path[0] !== 'data' && location.path[0] !== 'state') {
            pushVariable(new Variable('state', this.template.state || Type.Object, '模版状态'));
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
            let nodeVars = node.property('vars');
            if (node.property('repeat') && !(inRepeat && nodeStack.length == 0)) {
                pushVariable(new Variable('_index_', Type.Number, '当前 `repeat` 元素索引'));
                let repeat = this.parseExpressionInObject(node.property('repeat'));
                let repeatType = this.computeExpressionTypeInObject(repeat, typeContext);
                let valueType = repeatType instanceof ArrayType ? repeatType.getElementsType()
                    : repeatType === Type.Number ? Type.Null : Type.Any; 
                pushVariable(new Variable('_item_', valueType, '当前 `repeat` 元素'));
            }
            if (nodeVars) {
                if (isArray(nodeVars)) {
                    var count = nodeVars.length;
                    if (path.length >= 2 && path[0] === 'vars' && typeof(path[1]) === 'number') {
                        count = path[1] as number;
                    }
                    for (var i = 0; i < count; i++) {
                        pushDict(nodeVars[i]);
                    }
                }
                else if (isObject(nodeVars) && !(inVars && nodeStack.length == 0)) {
                    pushDict(nodeVars);
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
        let { expression: node, errorMessage: error } = this.parse(expression);
        if (error || !node) {
            return null;
        }
        else {
            return node.getType(context);
        }
    }

    private expressionValueWithContext(expression: string, context: ExpressionContext) {
        let { expression: node, errorMessage: error } = this.parse(expression);
        if (error || !node) {
            return null;
        }
        else {
            return node.compute(context);
        }
    }

    private getPropertiesWithPath(properties, path: json.Segment[]) {
        if (path.length == 1) {
            return properties instanceof Object ? properties : {};
        }
        else if (path.length > 1) {
            let key = path[0];
            if (typeof key === "string" && key.startsWith("on-") && key.endsWith("-once")) {
                key = key.substring(0, key.length - 5);
                if (!(properties[key] instanceof PropertyInfo && properties[key].type === Event)) {
                    return {};
                }
            }
            let info = properties[key];
            if (info) {
                return this.getPropertiesWithPath(info.type, path.slice(1));
            }
        }
        return {};
    }

    private getProperties(rootNode: json.Node, location: json.Location) {
        let properties = {};
        let currentPath = location.path.length > 0 ? location.path[location.path.length - 1] : '';

        if (location.path.length == 0) {
            return null;
        }
        else if (location.path.length == 1) {
            properties = Object.assign(properties, Properties.templateProperties);
        }
        else if (location.path[0] == 'styles' && location.path.length >= 3) {
            let propertiesMap = {};
            propertiesMap = Object.assign(propertiesMap, {'node': Properties.baseProperties});
            propertiesMap = Object.assign(propertiesMap, Properties.nodeProperties);

            let allProperties = {};
            let path = [<json.Segment>'style'].concat(location.path.slice(2));
            Object.keys(propertiesMap).forEach(type => {
                let typeProperties = this.getPropertiesWithPath(propertiesMap[type], path);
                Object.keys(typeProperties).forEach(key => {
                    if (!(key in allProperties)) {
                        allProperties[key] = {};
                    }
                    allProperties[key][type] = typeProperties[key];
                })
            });

            Object.keys(allProperties).forEach(key => {
                let value = allProperties[key];
                let types = Object.keys(value);
                let desc = types.map(k => {
                    let info = value[k];
                    return `<${k}> ` + (info instanceof PropertyInfo ? info.desc || 'no description' : 'no description');
                }).join('\n\n');
                let firstInfo = value[types[0]];
                allProperties[key] = new PropertyInfo(firstInfo instanceof PropertyInfo ? firstInfo.type : BasicType.Other, desc);
            });
            properties = allProperties;
        }
        else if (location.path[0] == 'layout') {
            let path = [...location.path];
            let node = this.nodeAtPath(path);
            if (!node) {
                return [];
            }
            let type = node.type();
            let nodeProperties = Properties.nodeProperties[type] || {};

            properties = Object.assign(properties, this.getPropertiesWithPath(Properties.baseProperties, path));
            properties = Object.assign(properties, this.getPropertiesWithPath(nodeProperties, path));
        }

        let keys = Object.keys(properties);
        keys.forEach(key => {
            if (key.startsWith("on-")) {
                let info: PropertyInfo = properties[key];
                if (info.type === Event) {
                    let once = new PropertyInfo(info.type, `${info.desc || ""}（只触发一次）`, info.defaultValue);
                    properties[`${key}-once`] = once;
                }
            }
        })

        if (location.isAtPropertyKey) {
            let node = json.findNodeAtLocation(rootNode, location.path.slice(0, location.path.length - 1));
            if (node) {
                let existsProperties = node.children.map(p => p.children[0].value);
                if (existsProperties) {
                    var index = existsProperties.indexOf(currentPath as string, 0);
                    if (index >= 0) {
                        existsProperties.splice(index, 1);
                    }
                    existsProperties.forEach(p => {
                        delete properties[p];
                    });
                }
            }
        }
        else {
            let info: PropertyInfo = properties[currentPath];
            properties = {};
            if (info.isEnumProperty()) {
                let propertyType = info.type === Properties.colors ? BasicType.Color : BasicType.Enum;
                if (info.type instanceof Array) {
                    (<Array<string>>info.type).forEach(v => properties[v] = new PropertyInfo(propertyType, ""));
                }
                else {
                    Object.keys(info.type).forEach(k => properties[k] = new PropertyInfo(propertyType, info.type[k]));
                }
            }
        }

        return properties;
    }

    public provideCompletionItems(position: vscode.Position, token: vscode.CancellationToken) {
        let document = this.document;
        let location = json.getLocation(document.getText(), document.offsetAt(position));
        this.parseTemplate();

        if (!location.isAtPropertyKey) {
            let expression = this.getExpressionAtLocation(location, position);
            if (expression !== null) {
                let { lexerError: error } = this.parse(expression);
                if (error === LexerErrorCode.UnclosedString) {
                    return [];
                }
                var items = []
                let exp = getCurrentExpression(expression);
                let {prefix: prefix, function: func} = getPrefix(exp);
                let type: IType;
                let ctx = this.contextAtLocation(location);        
                if (prefix) {
                    type = this.expressionTypeWithContext(prefix, ctx.typeContext);
                }
                else {
                    if (document.getText(new vscode.Range(position.translate(0,-1), position)) == '.') {
                        return [];
                    }
                    type = Type.Global;
                    items = items.concat(['true', 'false', 'null', 'nil'].map(s => new CompletionItem(s, vscode.CompletionItemKind.Keyword)));

                    ctx.vars.forEach(v => {
                        let item = new CompletionItem(v.name, vscode.CompletionItemKind.Field);
                        item.detail = v.value !== None ? `"${v.name}": ${JSON.stringify(v.value,null,'\t')}` : `${v.name}: ${v.type.getName()}`;
                        let doc = [];
                        if (v.computed != None) {
                            doc.push(JSON.stringify(v.computed,null,'\t'));
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
                        let noParams = params.length == 0 && m.length == 1;
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
                if (nodePath.length >= 2 && nodePath[0] === 'style' && (nodePath[1] === 'image' || nodePath[1] === 'error-image' || nodePath[1] === 'background-image')) {
                    return ImageHelper.provideCompletionItems(this, token);
                }
            }
        }

        let properties = this.getProperties(this.rootNode, location);
        
        return Object.keys(properties).map(p => {
            let info: PropertyInfo = properties[p];
            let kind;
            if (info.type === BasicType.Enum) {
                kind = vscode.CompletionItemKind.EnumMember;
            }
            else if (info.type === BasicType.Color) {
                kind = vscode.CompletionItemKind.Color;
            }
            else if (info.type === Event) {
                kind = vscode.CompletionItemKind.Event;
            }
            else {
                kind = vscode.CompletionItemKind.Property;
            }
            let item = new vscode.CompletionItem(p, kind);
            item.documentation = info.desc;
            
            function valueText() {
                if (!location.isAtPropertyKey) {
                    return '';
                }

                let valueText = '';
                let comma = false;
                if (document.lineAt(position.line).text.substr(position.character+1).match(/^\s*"/)) {
                    comma = true;
                }
                else if (position.line + 1 < document.lineCount && document.lineAt(position.line + 1).text.match(/^\s*"/)) {
                    comma = true;
                }
                valueText += `: ${info.defaultValue}`;
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
                    item.insertText = new vscode.SnippetString(`${p}"${valueText()}`);
                    item.range = new vscode.Range(document.positionAt(location.previousNode.offset + 1), document.positionAt(location.previousNode.offset + location.previousNode.length));
                }
                else {
                    item.insertText = `"${p}"`;
                    item.range = new vscode.Range(document.positionAt(location.previousNode.offset), document.positionAt(location.previousNode.offset + location.previousNode.length));
                }
            } else {
                item.insertText = new vscode.SnippetString(`"${p}"${valueText()}`);
            }
            return item;
        });
    }

    private propertyName(name: string, property: Property) {
        return `${property.ownerType !== Type.Global ? '(property) ' : ''}${property.ownerType && property.ownerType !== Type.Global ? property.ownerType.getName() + '.' : ''}${name}: ${property.type.getName()}`;
    }

    private methodName(name: string, method: Method, count: number) {
        let returnType = method.type ? method.type.getName() : 'void';
        return `${method.ownerType !== Type.Global ? '(method) ' : ''}${method.ownerType && method.ownerType !== Type.Global ? method.ownerType.getName() + '.' : ''}${name}(${(method.params || []).map(p => `${p.name}: ${p.type.getName()}`).join(', ')}): ${returnType}${count > 1 ? ` (+${count - 1} overload${count > 2 ? 's' : ''})` : ''}`
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
        if (wordRange == null || wordRange.start == wordRange.end) {
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
                        contents.push({ language: 'mist', value: `"${v.name}": ${JSON.stringify(v.value,null,'\t')}` });
                    }
                    if (v.computed !== None) {
                        contents.push({ language: 'json', value: JSON.stringify(v.computed,null,'\t') });
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
                        contents.push({ language: 'json', value: JSON.stringify(value,null,'\t') });
                    }
                    let prop = type.getProperty(func);
                    if (prop) {
                        contents.push({language: 'typescript', value: this.propertyName(func, prop)});
                    }
                    else {
                        let fun = type.getMethod(func, 0);
                        if (fun && fun.type && fun.type != Type.Void) {
                            contents.push({language: 'typescript', value: this.methodName(func, fun, type.getMethods(func).length)});
                        }
                    }
                }
                
            }
            
            return new Hover(contents);
        }
        
        let properties = this.getProperties(this.rootNode, location);
        let node = findNodeAtLocation(this.rootNode, location.path);
        if (location.isAtPropertyKey) {
            if (node.type === 'property') {
                node = node.children[0];
            }
            else if (node.parent.type === 'property') {
                node = node.parent.children[0];
            }
        }
        
        let key = node.value;
        let info: PropertyInfo = properties[key];
        if (!info) {
            return null;
        }
        if (info.desc) {
            let hover = new vscode.Hover(info.desc);
            hover.range = new vscode.Range(document.positionAt(node.offset), document.positionAt(node.offset + node.length));
            return hover;
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

    public validate(): vscode.Diagnostic[] {
        this.parseTemplate();
        let vars: Variable[] = [];
        let typeContext = new ExpressionContext();
        let valueContext = new ExpressionContext();

        let diagnostics = [];

        let pushVariable = v => {
            vars.push(v);
            let isExp = false;
            let parsed = this.parseExpressionInObject(v.value);
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
            typeContext.push(v.name, v.type);
        };
        let push = (key, value) => pushVariable(new Variable(key, value));
        let pop = key => {
            typeContext.pop(key);
            valueContext.pop(key);
        };
        let pushDict = dict => Object.keys(dict).forEach(key => push(key, dict[key]));

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
                    let { expression: expNode, errorMessage: error, errorOffset: offset, errorLength: length } = this.parse(exp.string.parsed);
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
                                return new vscode.Diagnostic(range(start + exp.offset + node.offset, end - start), e.description, vscode.DiagnosticSeverity.Warning);
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
        pushVariable(new Variable('_data_', Object.keys(data).length === 0 ? Type.Object : data, '模版关联的数据'));

        if (this.template.data instanceof Object) {
            validate(json.findNodeAtLocation(this.rootNode, ['data']));
            data = {...data, ...this.template.data};
        }
        pushDict(data);

        pushVariable(new Variable('_data_', Object.keys(data).length === 0 ? Type.Object : data, '模版关联的数据'));

        validate(json.findNodeAtLocation(this.rootNode, ['state']));
        pushVariable(new Variable('state', this.template.state || Type.Object, '模版状态'));
        
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
                let repeat = this.parseExpressionInObject(json.getNodeValue(repeatNode));
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
                        let vars = json.getNodeValue(c);
                        pushDict(vars);
                        pushed.push(...Object.keys(vars));
                    });
                }
                else if (varsNode.type === 'object') {
                    let vars = json.getNodeValue(varsNode);
                    validate(varsNode);
                    pushDict(vars);
                    pushed.push(...Object.keys(vars));
                }
                else {
                    diagnostics.push(new vscode.Diagnostic(nodeRange(varsNode), '`vars` 属性只能为 `object` 或 `array`', vscode.DiagnosticSeverity.Error));
                }
            }
            const list = ['repeat', 'vars', 'children'];
            let otherNodes = node.node.children.filter(n => n.children.length == 2 && list.indexOf(n.children[0].value) < 0).map(n => n.children[1]);
            otherNodes.forEach(validate);

            if (node.children) {
                node.children.forEach(validateNode);
            }
            pushed.forEach(pop);
        };

        validateNode(this.nodeTree);
        
        return diagnostics;
    }
}