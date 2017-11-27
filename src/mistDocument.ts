import { Uri, TextDocument, TextDocumentChangeEvent, CompletionItem } from "vscode";
import * as vscode from "vscode";
import * as json from 'jsonc-parser'
import * as path from 'path'
import * as fs from 'fs'
import { parseJson, getPropertyNode, getNodeValue } from './utils/json'
import { functions } from './functions';
import { resolve } from "dns";
import { print } from "util";
import { deactivate } from "./mistMain";
import { Properties, PropertyInfo, Event, BasicType } from "./properties";

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

class Property {
    type: string | { [property: string]: Property };
    comment: string;

    constructor(type: string | { [property: string]: Property }, comment: string = null) {
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

let BUILTIN_VARS = {
    "_width_": new Property("CGFloat", "屏幕宽度"),
    "_height_": new Property("CGFloat", "屏幕高度"),
    "_mistitem_": new Property("VZMistItem", "模版对应的 item 对象"),
    "system": {
        "name": new Property("NSString*", "系统名称"),
        "version": new Property("NSString*", "系统版本"),
        "deviceName": new Property("NSString*", "设备名称")
    },
    "screen": {
        "width": new Property("CGFloat", "屏幕宽度"),
        "height": new Property("CGFloat", "屏幕高度"),
        "scale": new Property("CGFloat", "屏幕像素密度"),
        "statusBarHeight": new Property("CGFloat", "状态栏高度"),
        "isPlus": new Property("BOOL", "是否是大屏（iPhone 6/6s/7/8 Plus）"),
        "isSmall": new Property("BOOL", "是否是小屏（iPhone 4/4s/5/5s/SE）"),
        "isX": new Property("BOOL", "是否是 iPhone X"),
        "safeAera": new Property("UIEdgeInsets", "安全区域"),
    },
    "app": {
        "isAlipay": new Property("BOOL", "是否是支付宝客户端"),
        "isKoubei": new Property("BOOL", "是否是口碑客户端"),
    }
};


class MistData {
    template: string;
    file: string;
    data: {};
    description: string;
    start: number;
    end: number;

    static dataMap: { [dir: string]: { [file: string]: MistData[] } } = {};
    
    static openFile(file: string) {
        let dir = path.dirname(file);
        if (!(dir in this.dataMap)) {
            this.dataMap[dir] = {};
        }
        let text = fs.readFileSync(file).toString();
        if (text) {
            let jsonTree = parseJson​​(text);
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
                    let templateKeys = ["blockId", "template", "templateId"];
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
            Object.keys(MistDocument.documents).forEach(k => MistDocument.documents[k].datas = null);
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
                    result = result.concat(found);
                }
            }
        }
        return result;
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
    let braceDict = {'{': '}', '(': ')', '[': ']'};
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
    // return typeof(obj) === 'object' && obj.constructor === Array;
}

function isObject(obj: any) {
    return typeof(obj) === 'object' && obj.constructor === Object;
}

let ID_RE = /^[_a-zA-Z]\w*$/;
function isId(str: string) {
    return ID_RE.test​​(str);
}

export class MistDocument {
    static documents: { [path: string]: MistDocument } = {}

    private document: TextDocument;
    datas: MistData[];
    private rootNode: json.Node;
    private nodeTree: MistNode;
    private template: any;

    constructor(document: TextDocument) {
        this.document = document;
    }

	private getDatas() {
        if (!this.datas) {
            let file = this.document.fileName;
            let dir = path.dirname(file);
            let templateId = path.basename(file, ".mist");
            this.datas = MistData.getData(dir, templateId);
        }
        return this.datas;
	}

    public static getDocumentByUri(uri: Uri) {
        let path = uri.fsPath;
        let document = MistDocument.documents[path];
        // if (!document) {
        //     document = new MistDocument(path);
        //     MistDocument.documents[path] = document;
        // }
        return document;
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
                    return match[0].substring(2, pos - match.index);
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

    private varsAtLocation(location: json.Location) {
        let path = [...location.path];
        let node = this.nodeAtPath(path);
        let vars = {};
        if (path.length == 0) {
            return vars;
        }
        while (node) {
            let nodeVars = node.property('vars');
            if (nodeVars) {
                if (isArray(nodeVars)) {
                    var count = nodeVars.length;
                    if (path.length >= 2 && path[0] === 'vars' && typeof(path[1]) === 'number') {
                        count = path[1] as number;
                    }
                    for (var i = 0; i < count; i++) {
                        vars = {...vars, ...nodeVars[i]};
                    }
                }
                else if (isObject(nodeVars) && path[0] != 'vars') {
                    vars = {...nodeVars, ...vars};
                }
            }
            if (node.property('repeat') && path[0] != 'repeat') {
                vars = {'_index_': new Property('NSUInteger', '当前 `repeat` 元素索引'), '_item_': new Property('unknown', '当前 `repeat` 元素'), ...vars};
            }
            node = node.parent;
        }
        return vars;
    }

    private allVariables(location: json.Location) {
        // styles 里暂时不能使用data和state
        if (location.path[0] === 'styles') {
            return {};
        }

        let datas = this.getDatas();
        let data = datas && datas.length > 0 ? (datas[0].data || {}) : {};
        if (location.path[0] !== 'data' && this.template.data instanceof Object) {
            data = {...data, ...this.template.data};
        }
        let vars: any = {...BUILTIN_VARS, ...data, '_data_': data};
        if (location.path[0] !== 'data' && location.path[0] !== 'state') {
            vars = {...vars, 'state': this.template.state || {}};
        }
        return {...vars, ...this.varsAtLocation(location)};
    }

    private getObject(keyPath: string[], datas: {}[]) {
        if (keyPath.length == 0) {
            return datas;
        }

        let key = keyPath[0];
        return this.getObject(keyPath.slice(1), datas.map(data => data[key]).filter(d => d instanceof Object));
    }

    private completionItemForDatas(datas: {}[]) {
        let keys = datas.map(data => Object.keys(data)).reduce((p, c, i, a) => p.concat(c), []);
        return keys.map(k => {
            return new vscode.CompletionItem(k, vscode.CompletionItemKind.Value);
        });
    }

    private functionName(name: string, info: any) {
        return `${info.return || 'void'} ${name}(${(info.params || []).map(p => `${p.type} ${p.name}`).join(', ')})`
    }

    private functionDoc(info: any) {
        var doc = info.comment || '';
        if (info.deprecated) {
            doc = `[Deprecated] ${info.deprecated}\n${doc}`;
        }
        return doc;
    }

    private completionItemForFunctions(functions: {}) {
        return Object.keys(functions).map(s => {
            let item = new vscode.CompletionItem(s, vscode.CompletionItemKind.Function);
            let funInfo = functions[s][0];
            let params = funInfo.params || [];
            let noParams = params.length == 0 && functions[s].length == 1;
            item.insertText = new vscode.SnippetString(s + (noParams ? '()' : '($0)'));
            if (!noParams) {
                item.command = {
                    title: 'Trigger Signature Help',
                    command: "editor.action.triggerParameterHints"
                };
            }
            item.documentation = this.functionDoc(funInfo);
            item.detail = this.functionName(s, funInfo);
            if (functions[s].length > 1) {
                item.detail += ` (+${functions[s].length - 1} overload${functions[s].length > 2 ? 's' : ''})`
            }
            return item;
        });
    }

    private completionItemForProperties(properties: {}) {
        return Object.keys(properties).map(s => {
            let item = new vscode.CompletionItem(s, vscode.CompletionItemKind.Property);
            let info = properties[s];
            item.documentation = info.comment || '';
            item.detail = `${info.type} ${s}`;
            return item;
        });
    }

    private objectType(obj: any) {
        const typeMap = {
            "string": "NSString",
            "number": "NSNumber",
            "object": "NSDictionary",
            "array": "NSArray"
        };
        let type: string;
        if (obj instanceof Property) {
            type = obj.getType().replace('*', '');
        }
        else if (isArray(obj)) {
            type = "NSArray";
        }
        else if (isObject(obj)) {
            type = "NSDictionary";
        }
        else {
            type = typeof(obj);
        }

        return typeMap[type] || type || 'unknown';
    }

    private functionsForObject(obj: any) {
        return functions[this.objectType(obj)] || {};
    }

    private propertiesForObject(obj: any) {
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
                "tplController": new Property("VZMistTemplateController", "模版关联的 template controller")
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
        
        return properties[this.objectType(obj)] || {};
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
        // console.log(location);
        // console.log(this.nodePath(location));

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

    private getExpressionReturnType(exp: string, vars: any) {
        if (exp) {
            let keys = exp.split('.');
            for (let key of keys) {
                if (vars instanceof Property) {
                    if (isObject(vars.type)) {
                        vars = vars.type[key];
                    }
                    else {
                        vars = null;
                        break;
                    }
                }
                else {
                    if (isObject(vars)) {
                        vars = vars[key];
                    }
                    else {
                        vars = null;
                        break;
                    }
                }
                
                if (!(vars instanceof Object)) {
                    break;
                }
            }
        }
        return vars;
    }

    public provideCompletionItems(position: vscode.Position, token: vscode.CancellationToken) {
        let document = this.document;
        let location = json.getLocation(document.getText(), document.offsetAt(position));
        this.parseTemplate();

        let expression = this.getExpressionAtLocation(location, position);
        if (expression !== null) {
            let obj = this.allVariables(location);
            var items = []
            let exp = getCurrentExpression(expression);
            let {prefix: prefix, function: func} = getPrefix(exp);
            if (prefix) {
                obj = this.getExpressionReturnType(prefix, obj);
            }
            else {
                if (document.getText(new vscode.Range(position.translate(0,-1), position)) == '.') {
                    return [];
                }
                items = items.concat(['true', 'false', 'null', 'nil'].map(s => new CompletionItem(s, vscode.CompletionItemKind.Keyword)));
                items = items.concat(this.completionItemForFunctions(functions.global));
            }
            if (obj === null) {
                return [];
            }
            
            items = items.concat(this.completionItemForFunctions(this.functionsForObject(obj)));
            items = items.concat(this.completionItemForProperties(this.propertiesForObject(obj)));
            if (isObject(obj)) {
                items = items.concat(Object.keys(obj).filter(isId).map(s => {
                    let item = new vscode.CompletionItem(s, vscode.CompletionItemKind.Variable);
                    let value = obj[s];
                    if (value instanceof Property) {
                        item.detail = `${value.getType()} ${s}`;
                        item.documentation = value.comment;
                    }
                    else {
                        item.documentation = JSON.stringify(obj[s], (k, v) => (v instanceof Property) ? v.comment : v, '\t');
                    }
                    
                    // if (!isId(s)) {
                    //     let wordRange = document.getWordRangeAtPosition(position);
                    //     let start = wordRange ? wordRange.start : position;
                    //     item.range = new vscode.Range(start.translate(0, -1), position.translate(0, 1));
                    //     item.insertText = `['${s}']`;
                    // }
                    return item;
                }));
            }
            return items;
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
        let location = json.getLocation(document.getText(), document.offsetAt(position));
        this.parseTemplate();
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
                let funs;
                if (signatureInfo.prefix) {
                    let obj = this.allVariables(location);
                    let keys = signatureInfo.prefix.split('.');
                    for (let key of keys) {
                        if (isObject(obj)) {
                            obj = obj[key];
                        }
                        else {
                            obj = null;
                            break;
                        }
                        
                        if (!obj) {
                            break;
                        }
                    }
                    funs = this.functionsForObject(obj);
                }
                else {
                    funs = functions.global;
                }
                let fun;
                if (funs) {
                    fun = funs[signatureInfo.function];
                }
                if (fun) {
                    let signatureHelp = new vscode.SignatureHelp();
                    signatureHelp.signatures = fun.map(f => {
                        let signature = new vscode.SignatureInformation(this.functionName(signatureInfo.function, f) , "documentation");
                        signature.parameters = (f.params || []).map(p => new vscode.ParameterInformation(`${p.type} ${p.name}`));
                        signature.documentation = this.functionDoc(f);
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
}