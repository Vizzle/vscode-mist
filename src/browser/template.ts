import { ExpressionContext, ExpressionNode, None, LiteralNode, ParseResult, Parser, ExpressionError } from "./parser";
import { IType, Type, Property, Method, Parameter, ArrowType, ArrayType, UnionType } from "./type";
import { functions } from "./functions";

function isObject(obj: any) {
    return obj && typeof(obj) === 'object' && obj.constructor === Object;
}

function getTypeFromString(name: string): IType {
    if (name.endsWith('[]')) {
        return new ArrayType(getTypeFromString(name.slice(0, -2).trim()))
    }

    if (name.indexOf('|') > 0) {
        return new UnionType(...name.split('|').map(s => getTypeFromString(s.trim())))
    }

    const arrowTypeRE = /^\((.*)\)\s*=>\s*(\w+)$/;
    let match = arrowTypeRE.exec(name);
    if (match) {
        let params = match[1].split(',').map(s => {
            let components = s.trim().split(':');
            return new Parameter(components[0].trim(), getTypeFromString(components[1].trim()));
        });
        return new ArrowType(Type.getType(match[2]), params);
    }
    return Type.getType(name);
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
        "bool": "boolean",
        "id": "any",
        "NSArray": "array",
        "NSDictionary": "object"
    }
    let typeName = name => aliases[name.replace('*', '')] || name;
    let getType = name => name ? getTypeFromString(typeName(name)) || Type.registerType(new Type(typeName(name))) : Type.Void;
    Object.keys(functions).forEach(name => {
        let funs = functions[name];
        let typeN = typeName(name);
        let type = getTypeFromString(typeN) as Type;
        if (!type) {
            type = Type.registerType(new Type(typeN));
        }
        Object.keys(funs).forEach(fun => {
            funs[fun].forEach(info => {
                let doc = info.comment;
                if (info.deprecated) {
                    doc = `[Deprecated] ${info.deprecated}\n${doc || ''}`.trim();
                }

                if (info.isProp) {
                    type.registerProperty(fun, new Property(getType(info.return), doc))
                }
                else {
                    type.registerMethod(fun, new Method(getType(info.return), doc, (info.params || []).map(p => new Parameter(p.name, getType(p.type) || Type.Any)), info.js));
                }
            });
        });
    });

    const properties = {
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

export class StringConcatExpressionNode extends ExpressionNode {
    expressions: ExpressionNode[];

    constructor(expressions: ExpressionNode[]) {
        super();
        this.expressions = expressions;
    }

    visitNode(visitor: (node: ExpressionNode) => void) {
        super.visitNode(visitor)
        this.expressions.forEach(n => n.visitNode(visitor))
    }

    compute(context: ExpressionContext): any {
        let computed = this.expressions.map(e => e.compute(context));
        if (computed.some(v => v === None)) return None;
        return computed.join('');
    }

    computeValue(context: ExpressionContext) {
        let computed = this.expressions.map(e => e.computeValue(context)).filter(s => s !== null && s !== undefined);
        return computed.join('');
    }

    getType(context: ExpressionContext): IType {
        return Type.String;
    }

    check(context: ExpressionContext) {
        return this.expressions.reduce((p, c) => p.concat(c.check(context)), []);
    }
}

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

let expCache = new Cache<ParseResult>(200);
export function parse(exp: string): ParseResult {
    let parsed = expCache.get(exp);
    if (!parsed) {
        parsed = Parser.parse(exp);
        expCache.set(exp, parsed);
    }
    return parsed;
}

class ErrorNode extends ExpressionNode {
    compute(context: ExpressionContext) {
        return None;
    }
    computeValue(context: ExpressionContext) {
        return null;
    }
    getType(context: ExpressionContext): IType {
        return Type.Any
    }
    check(context: ExpressionContext): ExpressionError[] {
        return [];
    }
}

function parseExpressionInString(source: string) {
    if (source.startsWith("$:")) {
        let { expression: node, errorMessage: error } = parse(source.substring(2));
        if (error || !node) {
            return new ErrorNode();
        }
        return node;
    }

    const re = /\$\{(.*?)\}/mg;
    re.lastIndex = 0;
    let match: RegExpExecArray;
    let index = 0;
    let parts: ExpressionNode[] = [];
    while (match = re.exec(source)) {
        let exp = match[1];
        let { expression: node, errorMessage: error } = parse(exp);
        if (error || !node) {
            node = new ErrorNode();
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

export function parseExpressionInObject(obj: any) {
    if (typeof(obj) === 'string') {
        let exp = parseExpressionInString(obj);
        if (exp) {
            return exp;
        }
        return obj;
    }
    else if (obj instanceof Array) {
        return obj.map(o => parseExpressionInObject(o));
    }
    else if (obj && obj !== None && typeof(obj) === 'object') {
        return Object.keys(obj).reduce((p, c) => { p[c] = parseExpressionInObject(obj[c]); return p; }, {});
    }
    return obj;
}

export function bindData(template: any, data: any, builtin: any) {
    if (!template) return { layout: {} };
    let parsedTemplate = parseExpressionInObject(template);
    let valueContext = new ExpressionContext();
    let compute = obj => {
        if (obj instanceof ExpressionNode) {
            let value = obj.computeValue(valueContext);
            if (value === None || value === undefined) value = null;
            return value;
        }
        else if (obj instanceof Array) {
            return obj.map(o => compute(o));
        }
        else if (obj && obj !== None && typeof(obj) === 'object') {
            let values = Object.keys(obj).map(k => compute(obj[k]));
            return Object.keys(obj).reduce((p, c, i) => { if (values[i] !== null) p[c] = values[i]; return p; }, {});
        }
        return obj;
    }
    function extract<T = any> (obj: any, defaultValue: T = null, blacklist: string[] = null): T {
        if (blacklist) {
            obj = Object.assign({}, obj);
            blacklist.forEach(k => delete obj[k]);
        }
        let value = compute(obj);
        if (value === null || value === undefined) {
            value = defaultValue;
        }
        return value;
    }
    let styles = extract(parsedTemplate.styles, {}, []);

    valueContext.pushDict(builtin);
    valueContext.pushDict(data);
    valueContext.push('_data_', data);

    if ('data' in parsedTemplate) {
        let tplData = parsedTemplate.data;
        if (tplData && tplData instanceof (Object)) {
            let computed = extract(tplData);
            valueContext.pushDict(computed);
            data = {...data, ...computed};
            valueContext.push('_data_', data);
        }
    }
    if ('state' in parsedTemplate) {
        let state = parsedTemplate.state;
        if (state && state instanceof (Object)) {
            let computed = extract(state);
            valueContext.push('state', computed);
        }
    }
    let rootNode = parsedTemplate.layout;
    let computeNode = (node: any, index) => {
        if (!node) return null;

        node['node-index'] = index;

        let vars: any[] = node.vars;
        if (isObject(vars)) {
            vars = [vars];
        }
        let pushed: any[] = [];
        let popAll = () => pushed.forEach(k => valueContext.pop(k));
        if (vars instanceof Array) {
            vars.forEach(vs => {
                valueContext.pushDict(extract(vs));
                pushed.push(...Object.keys(vs));
            });
        }

        if (extract(node.gone)) {
            popAll();
            return null;
        }

        let classes = extract(node.class, '').split(' ').filter(s => s.length > 0);
        if (classes.length > 0) {
            let style = classes.map(c => styles[c]).filter(c => c).reduce((p, c) => { return { ...p, ...c } }, {});
            node.style = { ...style, ...node.style };
        }

        let children = node.children;
        node = extract(node, null, ['vars', 'gone', 'class', 'repeat', 'children']);
        if (children instanceof Array) {
            let list = [];
            children.forEach((c, nodeIndex) => {
                if (c instanceof ExpressionNode) {
                    c = extract(c);
                }
                if (typeof(c) === 'object') {
                    if (c.repeat) {
                        let repeat = extract(c.repeat);
                        let count = 1;
                        let items: any[];
                        if (typeof(repeat) === 'number') {
                            count = repeat;
                        }
                        else if (repeat instanceof Array) {
                            count = repeat.length;
                            items = repeat;
                        }

                        for (var i = 0; i < count; i++) {
                            valueContext.push('_index_', i);
                            valueContext.push('_item_', items ? items[i] : null);
                            list.push(computeNode({...c}, (index ? index + ',' : '') + nodeIndex));
                            valueContext.pop('_index_');
                            valueContext.pop('_item_');
                        }
                    }
                    else {
                        list.push(computeNode(c, (index ? index + ',' : '') + nodeIndex));
                    }
                }
            });
            node.children = list.filter(c => c);
        }
        popAll();
        return node;
    };

    let node = computeNode(rootNode, "");
    return { layout: node };
}