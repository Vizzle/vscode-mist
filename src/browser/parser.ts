import { Lexer, TokenType, LexerErrorCode, Token } from "./lexer";
import { Type, IType, UnionType, ObjectType, ArrayType, LiteralType } from "./type";

export enum ParserErrorCode {
    None,
    LexerError,
    EmptyExpression,
    ExpressionExpected,
    IdentifierExpected,
    ArgumentExpressionExpected,
    ArgumentIdentifierExpected,
    ColonExpected,
    CloseBracketExpected,
    CloseBraceExpected,
    CloseParenExpected,
    UnexpectedComma,
    UnexpectedToken,
    Unknown,
}

let errors = [
    "no error",
    "lexer error",
    "empty expression",
    "expression expected",
    "identifier expected",
    "argument expression expected",
    "argument identifier expected",
    "':' expected",
    "']' expected",
    "'}' expected",
    "')' expected",
    "unexpected ','",
    "unexpected token",
    "unknown error",
]

enum BinaryOp {
    None,
    Add,
    Sub,
    Mul,
    Div,
    Mod,

    And,
    Or,

    Equal,
    NotEqual,

    GreaterThan,
    LessThan,
    GreaterOrEqual,
    LessOrEqual,

    Index,
}

let bin_op_priority: [number, number][] = [
    [0, 0],
    [6, 6], [6, 6], [7, 7], [7, 7], [7, 7],         // +  -  *  /  %
    [2, 2], [1, 1],                                 // &&  ||
    [3, 3], [3, 3], [3, 3], [3, 3], [3, 3], [3, 3], // ==  !=  >  <  >=  <=
];

enum UnaryOp {
    None,
    Negative,
    Not,
}

export class ExpressionContext {
    private table: { [key: string]: any[] };

    constructor() {
        this.table = {};
    }

    push(key: string, value: any) {
        let array = this.table[key];
        if (array === null || array === undefined) {
            array = [];
            this.table[key] = array;
        }
        array.push(value);
    }

    pushDict(dict: { [key: string]: any }) {
        if (dict && dict instanceof Object) {
            Object.keys(dict).forEach(k => this.push(k, dict[k]));
        }
    }

    pop(key: string) {
        let array = this.table[key];
        if (array) {
            array.pop();
        }
    }

    popDict(dict: { [key: string]: any }) {
        if (dict && dict instanceof Object) {
            Object.keys(dict).forEach(k => this.pop(k));
        }
    }

    has(key: string) {
        let array = this.table[key];
        return array && array.length > 0;
    }

    get(key: string): any {
        let array = this.table[key];
        if (array && array.length > 0) {
            return array[array.length - 1];
        }
        return null;
    }

    getAll(): { [key: string]: any } {
        return Object.keys(this.table).filter(k => this.table[k].length > 0).reduce((p, c) => {
            let arr = this.table[c];
            p[c] = arr[arr.length - 1];
            return p;
        }, {});
    }

    set(key: string, value: any) {
        let array = this.table[key];
        if (array && array.length > 0) {
            array[array.length - 1] = value;
        }
    }

    clear() {
        this.table = {};
    }

}

export function boolValue(obj: any): boolean {
    if (obj === null || obj === undefined || obj === 0 || obj === '') {
        return false;
    }
    switch (typeof(obj)) {
        case 'number':
            return obj != 0;
        case 'boolean':
            return obj;
        default:
            return obj !== null && obj !== undefined;
    }
}

function isNull(obj) {
    return obj === null || obj === undefined;
}

function isNumber(obj) {
    return isNull(obj) || typeof(obj) === 'number';
}

function numberValue(obj) {
    if (typeof(obj) === 'number') return obj;
    return 0;
}

function isEqual(a: any, b: any): boolean {
    if (typeof(a) === typeof(b)) {
        return a === b;
    }
    if (isNumber(a) && isNumber(b)) {
        return numberValue(a) === numberValue(b);
    }
    return false;
}

export enum ExpressionErrorLevel {
    Error,
    Warning,
    Info,
}

export class ExpressionError {
    description: string;
    offset: number;
    length: number;
    level: ExpressionErrorLevel;

    constructor(node: ExpressionNode, description: string, level: ExpressionErrorLevel = ExpressionErrorLevel.Error) {
        this.offset = node.offset;
        this.length = node.length;
        this.description = description;
        this.level = level
    }
}

export abstract class ExpressionNode {
    offset: number;
    length: number;

    setRange(offset: number, length: number) {
        this.offset = offset;
        this.length = length;
        return this;
    }

    setRangeWithToken(token: Token) {
        this.offset = token.offset;
        this.length = token.length;
        return this;
    }

    abstract compute(context: ExpressionContext): any;
    abstract computeValue(context: ExpressionContext): any;
    abstract getType(context: ExpressionContext): IType;
    abstract check(context: ExpressionContext): ExpressionError[];
}

export class _None {}
export let None = new _None();

export class LiteralNode extends ExpressionNode {
    value: any;

    constructor(value: any) {
        super();
        this.value = value;
    }

    compute(context: ExpressionContext) {
        return this.value;
    }

    computeValue(context: ExpressionContext) {
        return this.value;
    }

    getType(context: ExpressionContext): IType {
        // return IType.typeof(this.value);
        return new LiteralType(this.value);
    }

    check(context: ExpressionContext) {
        return [];
    }
}

class IdentifierNode extends ExpressionNode {
    identifier: string;
    
    constructor(identifier: string) {
        super();
        this.identifier = identifier;
    }

    compute(context: ExpressionContext) {
        if (!context.has(this.identifier)) {
            return None;
        }
        let value = context.get(this.identifier);
        return value instanceof IType ? None : value;
    }

    computeValue(context: ExpressionContext) {
        if (!context.has(this.identifier)) {
            return null;
        }
        let value = context.get(this.identifier);
        return value instanceof IType ? null : value;
    }

    getType(context: ExpressionContext): IType {
        let type = IType.typeof(context.get(this.identifier)) || Type.Any;
        if (type === Type.Null) {
            type = Type.Any;
        }
        return type;
    }
    
    check(context: ExpressionContext) {
        if (context.get(this.identifier) === Type.Null) {
            return [new ExpressionError(this, `当前范围不存在符号 \`${this.identifier}\``)];
        }
        return [];
    }
}

class ArrayExpressionNode extends ExpressionNode {
    list: ExpressionNode[];

    constructor(list: ExpressionNode[]) {
        super();
        this.list = list;
    }

    compute(context: ExpressionContext) {
        let list = this.list.map(v => v.compute(context));
        return list.every(i => i !== None) ? list : None;
    }

    computeValue(context: ExpressionContext) {
        let list = this.list.map(v => v.computeValue(context));
        return list.filter(i => i !== null);
    }

    getType(context: ExpressionContext): IType {
        return ArrayType.tuple(this.list.map(v => v.getType(context)));
        // return new ArrayType(UnionType.type(this.list.map(v => v.getType(context))));
    }

    check(context: ExpressionContext) {
        return this.list.map(i => i.check(context)).reduce((p, c) => p.concat(c), []);
    }
}

class ObjectExpressionNode extends ExpressionNode {
    list: [ExpressionNode, ExpressionNode][];

    constructor(list: [ExpressionNode, ExpressionNode][]) {
        super();
        this.list = list;
    }

    compute(context: ExpressionContext) {
        let computed = this.list.map(t => [t[0].compute(context), t[1].compute(context)]);
        if (computed.some(l => l.some(i => i === None))) {
            return None;
        }
        return computed.reduce((p, c) => {p[c[0]] = c[1]; return p;}, {});
    }

    computeValue(context: ExpressionContext) {
        let computed = this.list.map(t => [t[0].computeValue(context), t[1].computeValue(context)]);
        return computed.reduce((p, c) => {
            var key = c[0];
            if (key) {
                p[key] = c[1];
            }
            return p;
        }, {});
    }

    getType(context: ExpressionContext): IType {
        return new ObjectType(this.list.filter(t => t[0] instanceof LiteralNode).map(t => [t[0].compute(context) as string, t[1].getType(context)]).reduce((p, c) => {p[c[0] as string] = c[1]; return p;}, {}));
    }

    check(context: ExpressionContext) {
        return this.list.map(i => {
            let errors: ExpressionError[] = [];
            if (i[0] instanceof LiteralNode) {
                let type = typeof((<LiteralNode>i[0]).value);
                if (type !== 'string' && type !== 'number') {
                    errors.push(new ExpressionError(i[0], '字典的 key 必须是 `string` 或 `number` 类型'));
                }
            }
            else {
                errors.push(new ExpressionError(i[0], '字典的 key 必须是字面值'));
            }
            return errors.concat(i[1].check(context));
        }).reduce((p, c) => p.concat(c), []);
    }
}

class ConditionalExpressionNode extends ExpressionNode {
    condition: ExpressionNode;
    truePart?: ExpressionNode;
    falsePart: ExpressionNode;

    private static isNull(exp: ExpressionNode) {
        return exp instanceof LiteralNode && exp.value === null;
    }

    constructor(condition: ExpressionNode, truePart: ExpressionNode, falsePart: ExpressionNode) {
        super();
        this.condition = condition;
        this.truePart = truePart;
        this.falsePart = falsePart;
    }
    
    compute(context: ExpressionContext) {
        let r = this.condition.compute(context);
        if (r === None) {
            return None;
        }
        return r ? (this.truePart ? this.truePart.compute(context) : r) : this.falsePart.compute(context);
    }

    computeValue(context: ExpressionContext) {
        let r = this.condition.computeValue(context);
        return r ? (this.truePart ? this.truePart.computeValue(context) : r) : this.falsePart.computeValue(context);
    }

    getType(context: ExpressionContext): IType {
        let truePart = this.truePart || this.condition;
        if (ConditionalExpressionNode.isNull(truePart)) {
            return this.falsePart.getType(context);
        }
        if (ConditionalExpressionNode.isNull(this.falsePart)) {
            return truePart.getType(context);
        }
        return UnionType.type([truePart.getType(context), this.falsePart.getType(context)]);
    }

    check(context: ExpressionContext) {
        let errors = this.condition.check(context);
        if (this.truePart) errors = errors.concat(this.truePart.check(context));
        errors = errors.concat(this.falsePart.check(context));
        return errors;
    }
}

class UnaryExpressionNode extends ExpressionNode {
    operator: UnaryOp;
    oprand: ExpressionNode;

    constructor(operator: UnaryOp, oprand: ExpressionNode) {
        super();
        this.operator = operator;
        this.oprand = oprand;
    }

    compute(context: ExpressionContext) {
        let r = this.oprand.compute(context);
        if (r === None) {
            return None;
        }
        switch (this.operator) {
            case UnaryOp.Not:
                return !boolValue(r);
            case UnaryOp.Negative:
            {
                if (isNumber(r)) {
                    return -numberValue(r);
                } 
                // unary operator '-' only supports on number type
                return None;
            }
            default:
                // unknown unary operator
                return None;
        }
    }

    computeValue(context: ExpressionContext) {
        let r = this.oprand.computeValue(context);
        switch (this.operator) {
            case UnaryOp.Not:
                return !boolValue(r);
            case UnaryOp.Negative:
            {
                if (isNumber(r)) {
                    return -numberValue(r);
                } 
                // unary operator '-' only supports on number type
                return null;
            }
            default:
                // unknown unary operator
                return null;
        }
    }

    getType(context: ExpressionContext): IType {
        switch (this.operator) {
            case UnaryOp.Not:
                return Type.Boolean;
            case UnaryOp.Negative:
                return Type.Number;
            default:
                // unknown unary operator
                return null;
        }
    }

    check(context: ExpressionContext) {
        let errors = this.oprand.check(context);
        switch (this.operator) {
            case UnaryOp.Not:
                break;
            case UnaryOp.Negative:
                let type = this.oprand.getType(context);
                if (!type.kindof(Type.Number)) {
                    errors.push(new ExpressionError(this, '`-` 运算符只能用于 `number` 类型'));
                }
                break;
            default:
                // unknown unary operator
                break;
        }
        return errors;
    }
}

class BinaryExpressionNode extends ExpressionNode {
    operator: BinaryOp;
    oprand1: ExpressionNode;
    oprand2: ExpressionNode;

    constructor(operator: BinaryOp, oprand1: ExpressionNode, oprand2: ExpressionNode) {
        super();
        this.operator = operator;
        this.oprand1 = oprand1;
        this.oprand2 = oprand2;
    }

    compute(context: ExpressionContext) {
        let value1 = this.oprand1.compute(context);
        let value2 = this.oprand2.compute(context);

        if (value1 === None || value2 === None) {
            if (BinaryOp.And === this.operator) {
                if (value1 === false || value2 === false) {
                    return false;
                }
            }
            else if (BinaryOp.Or === this.operator) {
                if (value1 === true || value2 === true) {
                    return true;
                }
            }
            return None;
        }
    
        // subscript operation
        if (BinaryOp.Index === this.operator) {
            if (!value1) {
                return null;
            } else if (value1 instanceof Array) {
                if (typeof(value2) !== 'number') {
                    // only numbers are allowed to access an array
                    return None;
                }
                return value2 < value1.length ? value1[value2] : None;
            } else if (value1 && value1 instanceof Object) {
                return value1[value2];
            } else if (typeof(value1) === 'string') {
                return value1[value2];
            } else {
                // [] operator can not be used on value1
                return None;
            }
        }
    
        // comparision operation
        if (BinaryOp.Equal === this.operator) {
            return isEqual(value1, value2);
        } else if (BinaryOp.NotEqual === this.operator) {
            return !isEqual(value1, value2);
        }
    
        // string operation
        if (BinaryOp.Add === this.operator && (typeof(value1 === 'string') || typeof(value2 === 'string'))) {
            if (isNull(value1)) value1 = "";
            if (isNull(value2)) value2 = "";
            return value1 + value2;
        }
    
        // logical operation
        else if (BinaryOp.And === this.operator) {
            return boolValue(value1) && boolValue(value2);
        } else if (BinaryOp.Or === this.operator) {
            return boolValue(value1) || boolValue(value2);
        }
    
        if ((value1 && typeof(value1) !== 'number') || (value2 && typeof(value2) !== 'number')) {
            // invalid operands
            return null;
        }
    
        value1 = numberValue(value1);
        value2 = numberValue(value2);

        switch (this.operator) {
            case BinaryOp.Add:
                return value1 + value2;
            case BinaryOp.Sub:
                return value1 - value2;
            case BinaryOp.Mul:
                return value1 * value2;
            case BinaryOp.Div:
                return value1 / value2;
            case BinaryOp.Mod:
            {
                if (value2 == 0) {
                    // should not mod with zero
                    return 0;
                }
                return Math.floor(value1) % Math.floor(value2);
            }
            case BinaryOp.GreaterThan:
                return value1 > value2;
            case BinaryOp.LessThan:
                return value1 < value2;
            case BinaryOp.GreaterOrEqual:
                return value1 >= value2;
            case BinaryOp.LessOrEqual:
                return value1 <= value2;
            default:
                // unknown binary operator
                return null;
        }
    }

    computeValue(context: ExpressionContext) {
        let value1 = this.oprand1.computeValue(context);
        let value2 = this.oprand2.computeValue(context);

        // subscript operation
        if (BinaryOp.Index === this.operator) {
            if (!value1) {
                return null;
            } else if (value1 instanceof Array) {
                if (typeof(value2) !== 'number') {
                    // only numbers are allowed to access an array
                    return null;
                }
                return value2 < value1.length ? value1[value2] : null;
            } else if (value1 && value1 instanceof Object) {
                return value1[value2];
            } else if (typeof(value1) === 'string') {
                return value1[value2];
            } else {
                // [] operator can not be used on value1
                return null;
            }
        }
    
        // comparision operation
        if (BinaryOp.Equal === this.operator) {
            return isEqual(value1, value2);
        } else if (BinaryOp.NotEqual === this.operator) {
            return !isEqual(value1, value2);
        }
    
        // string operation
        if (BinaryOp.Add === this.operator && (typeof(value1 === 'string') || typeof(value2 === 'string'))) {
            if (isNull(value1)) value1 = "";
            if (isNull(value2)) value2 = "";
            return value1 + value2;
        }
    
        // logical operation
        else if (BinaryOp.And === this.operator) {
            return boolValue(value1) && boolValue(value2);
        } else if (BinaryOp.Or === this.operator) {
            return boolValue(value1) || boolValue(value2);
        }
    
        if ((value1 && typeof(value1) !== 'number') || (value2 && typeof(value2) !== 'number')) {
            // invalid operands
            return null;
        }
    
        value1 = numberValue(value1);
        value2 = numberValue(value2);

        switch (this.operator) {
            case BinaryOp.Add:
                return value1 + value2;
            case BinaryOp.Sub:
                return value1 - value2;
            case BinaryOp.Mul:
                return value1 * value2;
            case BinaryOp.Div:
                return value1 / value2;
            case BinaryOp.Mod:
            {
                if (value2 == 0) {
                    // should not mod with zero
                    return 0;
                }
                return Math.floor(value1) % Math.floor(value2);
            }
            case BinaryOp.GreaterThan:
                return value1 > value2;
            case BinaryOp.LessThan:
                return value1 < value2;
            case BinaryOp.GreaterOrEqual:
                return value1 >= value2;
            case BinaryOp.LessOrEqual:
                return value1 <= value2;
            default:
                // unknown binary operator
                return null;
        }
    }

    getType(context: ExpressionContext): IType {
        let type1 = this.oprand1.getType(context);
        let type2 = this.oprand2.getType(context);
        switch (this.operator) {
            case BinaryOp.And:
            case BinaryOp.Or:
            case BinaryOp.GreaterThan:
            case BinaryOp.GreaterOrEqual:
            case BinaryOp.LessThan:
            case BinaryOp.LessOrEqual:
            case BinaryOp.Equal:
            case BinaryOp.NotEqual:
                return Type.Boolean;
            case BinaryOp.Sub:
            case BinaryOp.Mul:
            case BinaryOp.Div:
            case BinaryOp.Mod:
                return Type.Number;
            case BinaryOp.Add:
                if (type1.kindof(Type.Number, true) && type2.kindof(Type.Number, true)) {
                    return Type.Number;
                }
                if (type1.kindof(Type.String, true) || type2.kindof(Type.String, true)) {
                    return Type.String;
                }
                return Type.Any;
            case BinaryOp.Index:
                if (type1 instanceof ObjectType) {
                    if (this.oprand2 instanceof LiteralNode) {
                        let p = type1.getProperty(this.oprand2.value);
                        return p ? p.type : Type.Any;
                    }
                    return Type.Any;
                }
                return type1.getTypeAtIndex(type2);
            default:
                return Type.Any;
        }
    }

    operatorName() {
        switch (this.operator) {
            case BinaryOp.Add: return '+';
            case BinaryOp.Sub: return '-';
            case BinaryOp.Mul: return '*';
            case BinaryOp.Div: return '/';
            case BinaryOp.Mod: return '%';
            case BinaryOp.And: return '&&';
            case BinaryOp.Or: return '||';
            case BinaryOp.Equal: return '==';
            case BinaryOp.NotEqual: return '!=';
            case BinaryOp.GreaterThan: return '>';
            case BinaryOp.LessThan: return '<';
            case BinaryOp.GreaterOrEqual: return '>=';
            case BinaryOp.LessOrEqual: return '<=';
            case BinaryOp.Index: return '[]';
        }
    }

    check(context: ExpressionContext) {
        const StringOrNumberType = UnionType.type([Type.String, Type.Number]);
        let errors = this.oprand1.check(context).concat(this.oprand2.check(context));
        let type1 = this.oprand1.getType(context);
        let type2 = this.oprand2.getType(context);
        switch (this.operator) {
            case BinaryOp.And:
            case BinaryOp.Or:
            case BinaryOp.Equal:
            case BinaryOp.NotEqual:
                break;
            case BinaryOp.GreaterThan:
            case BinaryOp.GreaterOrEqual:
            case BinaryOp.LessThan:
            case BinaryOp.LessOrEqual:
            case BinaryOp.Sub:
            case BinaryOp.Mul:
            case BinaryOp.Div:
            case BinaryOp.Mod:
                if (!type1.kindof(Type.Number) || !type2.kindof(Type.Number)) {
                    errors.push(new ExpressionError(this, `\`${this.operatorName()}\` 运算符只能用于 \`number\` 类型`));
                }
                break;
            case BinaryOp.Add:
                if (!type1.kindof(StringOrNumberType) || !type2.kindof(StringOrNumberType)) {
                    errors.push(new ExpressionError(this, `\`+\` 运算符只能用于 \`number\` 或 \`string\` 类型`));
                }
                break;
            case BinaryOp.Index:
                if (type1 instanceof ObjectType || type1 === Type.Object || type1 === Type.Any) {
                    if (!type2.kindof(StringOrNumberType)) {
                        errors.push(new ExpressionError(this.oprand2, `索引类型只能为 \`string\` 或 \`number\` 类型`));
                    }
                }
                else if (type1.kindof(new ArrayType(Type.Any)) || type1 === Type.Array || type1.kindof(Type.String)) {
                    if (!type2.kindof(Type.Number)) {
                        errors.push(new ExpressionError(this.oprand2, `索引类型只能为 \`number\` 类型`));
                    }
                }
                else {
                    errors.push(new ExpressionError(this.oprand1, `类型 \`${type1.getName()}\` 不能被索引`));
                }
                break;
        }
        return errors;
    }
}

class FunctionExpressionNode extends ExpressionNode {
    target: ExpressionNode;
    action: IdentifierNode;
    parameters: ExpressionNode[];

    constructor(target: ExpressionNode, action: IdentifierNode, parameters: ExpressionNode[]) {
        super();
        this.target = target;
        this.action = action;
        this.parameters = parameters;
    }
    
    compute(context: ExpressionContext) {
        let target = this.target ? this.target.compute(context) : Type.Global;
        if (target === None) {
            return None;
        }
    
        if (!this.parameters) {
            let type = Type.typeof(target);
            if (type instanceof ObjectType) {
                return target[this.action.identifier];
            }
            else {
                let prop = type.getProperty(this.action.identifier);
                if (prop && prop.jsEquivalent) {
                    return prop.jsEquivalent(target);
                }
            }
        }
        else {
            let type = Type.typeof(target);
            let method = type.getMethod(this.action.identifier, this.parameters.length);
            if (method && method.jsEquivalent) {
                let params = this.parameters.map(p => p.compute(context));
                if (params.some(p => p === None)) return None;

                if (target === Type.Global) {
                    if (this.action.identifier === 'eval') {
                        return None;
                    }
                    return method.jsEquivalent(...params);
                }
                else {
                    return method.jsEquivalent(target, ...params);
                }
            }
        }
        
        return None;
    }

    computeValue(context: ExpressionContext) {
        let target = this.target ? this.target.computeValue(context) : Type.Global;
        if (target === null || target === undefined) {
            return null;
        }
    
        if (!this.parameters) {
            let type = Type.typeof(target);
            if (type instanceof ObjectType) {
                return target[this.action.identifier];
            }
            else {
                let prop = type.getProperty(this.action.identifier);
                if (prop && prop.jsEquivalent) {
                    return prop.jsEquivalent(target);
                }
            }
        }
        else {
            let type = Type.typeof(target);
            let method = type.getMethod(this.action.identifier, this.parameters.length);
            if (method && method.jsEquivalent) {
                let params = this.parameters.map(p => p.computeValue(context));
                if (target === Type.Global) {
                    if (this.action.identifier === 'eval') {
                        params.push(context);
                    }
                    return method.jsEquivalent(...params);
                }
                else {
                    return method.jsEquivalent(target, ...params);
                }
            }
            if (this.parameters.length === 0) {
                let prop = type.getProperty(this.action.identifier);
                if (prop && prop.jsEquivalent) {
                    return prop.jsEquivalent(target);
                }
            }
        }
        
        return null;
    }

    getType(context: ExpressionContext): IType {
        let targetType: IType;
        if (this.target) {
            targetType = this.target.getType(context);
        }
        else if (this.parameters) {
            targetType = Type.Global;
        }
        else {
            return Type.Any;
        }
        if (this.parameters) {
            let method = targetType.getMethod(this.action.identifier, this.parameters.length);
            if (method) {
                return method.type;
            }
            if (this.parameters.length === 0) {
                let prop = targetType.getProperty(this.action.identifier);
                if (prop) {
                    return prop.type;
                }
            }
            return Type.Any;
        }
        else {
            let p = targetType.getProperty(this.action.identifier);
            if (p) {
                return p.type;
            }
            let method = targetType.getMethod(this.action.identifier, 0);
            if (method) {
                return method.type;
            }
            return Type.Any;
        }
    }

    check(context: ExpressionContext) {
        let errors: ExpressionError[] = [];
        if (this.parameters) {
            this.parameters.forEach(p => errors.push(...p.check(context)));
        }

        let targetType: IType;
        if (this.target) {
            errors.push(...this.target.check(context));
            targetType = this.target.getType(context);
        }
        else if (this.parameters) {
            targetType = Type.Global;
        }
        else {
            return errors;
        }

        if (targetType === Type.Any) {
            return errors;
        }

        if (this.parameters) {
            let method = targetType.getMethod(this.action.identifier, this.parameters.length);
            if (!method) {
                let prop = targetType.getProperty(this.action.identifier);
                if (this.parameters.length > 0 || !prop) {
                    let methods = targetType.getMethods(this.action.identifier);
                    if ((!methods || methods.length === 0) && !prop) {
                        errors.push(new ExpressionError(this.action, `${targetType === Type.Global ? '' : `类型 \`${targetType.getName()}\` 上`}不存在方法 \`${this.action.identifier}\``));
                    }
                    else {
                        errors.push(new ExpressionError(this, `方法 \`${this.action.identifier}\` 参数数量不匹配`));
                    }
                }
            }
            else {
                method.params.forEach((p, i) => {
                    let type = this.parameters[i].getType(context);
                    if (!type.kindof(p.type)) {
                        errors.push(new ExpressionError(this.parameters[i], `类型 \`${type.getName()}\` 的参数不能赋给类型 \`${p.type.getName()}\` 的参数 \`${p.name}\``));
                    }
                });
            }
        }
        else {
            let p = targetType.getProperty(this.action.identifier);
            if (!p && !targetType.getMethod(this.action.identifier, 0)) {
                errors.push(new ExpressionError(this.action, `${targetType === Type.Global ? '' : `类型 \`${targetType.getName()}\` 上`}不存在属性 \`${this.action.identifier}\``, ExpressionErrorLevel.Warning));
            }
        }

        return errors;
    }
}

class LambdaExpressionNode extends ExpressionNode {
    parameter: IdentifierNode;
    expression: ExpressionNode;

    constructor(parameter: IdentifierNode, expression: ExpressionNode) {
        super();
        this.parameter = parameter;
        this.expression = expression;
    }
    
    compute(context: ExpressionContext) {
        return None;
    }

    getType(context: ExpressionContext): IType {
        // return Type.getType('id(^)(id)');
        return Type.Any;
    }

    computeValue(context: ExpressionContext) {
        return param => {
            context.push(this.parameter.identifier, param);
            let value = this.expression.computeValue(context);
            context.pop(this.parameter.identifier);
            return value;   
        };
    }

    check(context: ExpressionContext) {
        return this.expression.check(context);
    }
}

export type ParseResult = {
    expression?: ExpressionNode,
    parserError?: ParserErrorCode,
    lexerError?: LexerErrorCode,
    errorMessage?: string,
    errorOffset?: number,
    errorLength?: number,
};

export class Parser {
    private lexer: Lexer;
    private error: ParserErrorCode;

    private constructor(code: string) {
        this.lexer = new Lexer(code);
        this.lexer.next();
        if (this.lexer.token.type) {
            this.error = ParserErrorCode.None;
        }
        else {
            this.error = ParserErrorCode.EmptyExpression;
        }
    }

    private parse(): ExpressionNode {
        if (this.error) {
            return null;
        }
        let exp = this.parseExpression();
        if (this.lexer.error) {
            this.error = ParserErrorCode.LexerError;
            exp = null;
        }
        if (!this.error && this.lexer.token.type) {
            this.error = ParserErrorCode.UnexpectedToken;
            exp = null;
        }
        if (!this.error && !exp) {
            this.error = ParserErrorCode.Unknown;
        }
        return exp;
    }

    private parseExpression() {
        return this.parseConditionalExpression();
    }

    private parseOperator(op: TokenType) {
        if (this.lexer.token.type == op) {
            let token = this.lexer.token;
            this.lexer.next();
            return token;
        }
        return null;
    }

    private requireOperator(op: TokenType, err: ParserErrorCode) {
        let result = this.parseOperator(op);
        if (!result) {
            this.error = err;
        }
        return result;
    }

    private requireExpression() {
        let expression = this.parseExpression();
        if (!expression) {
            this.error = ParserErrorCode.ExpressionExpected;
        }
        return expression;
    }

    private parseConditionalExpression() {
        let expression = this.parseSubExpression();
        if (expression) {
            if (this.lexer.token.type == TokenType.Question) {
                this.lexer.next();
                let trueExpression = null;
                if (!this.parseOperator(TokenType.Colon)) {
                    if (!(trueExpression = this.requireExpression())) return null;
                    if (!this.requireOperator(TokenType.Colon, ParserErrorCode.ColonExpected)) return null;
                }
                let falseExpression = this.parseConditionalExpression();
                if (!falseExpression) {
                    if (!this.error) this.error = ParserErrorCode.ExpressionExpected;
                    return null;
                }
                return new ConditionalExpressionNode(expression, trueExpression, falseExpression).setRange(expression.offset, falseExpression.offset + falseExpression.length - expression.offset);
            }
            return expression;
        }
        return null;
    }

    private getUnaryOp(type: TokenType): UnaryOp {
        switch (type) {
            case TokenType.Sub:
                return UnaryOp.Negative;
            case TokenType.Not:
                return UnaryOp.Not;
            default:
                return UnaryOp.None;
        }
    }

    private getBinaryOp(type: TokenType): BinaryOp {
        switch (type) {
            case TokenType.Add:
                return BinaryOp.Add;
            case TokenType.Sub:
                return BinaryOp.Sub;
            case TokenType.Mul:
                return BinaryOp.Mul;
            case TokenType.Div:
                return BinaryOp.Div;
            case TokenType.Mod:
                return BinaryOp.Mod;
            case TokenType.And:
                return BinaryOp.And;
            case TokenType.Or:
                return BinaryOp.Or;
            case TokenType.Equal:
                return BinaryOp.Equal;
            case TokenType.NotEqual:
                return BinaryOp.NotEqual;
            case TokenType.GreaterThan:
                return BinaryOp.GreaterThan;
            case TokenType.LessThan:
                return BinaryOp.LessThan;
            case TokenType.GreaterOrEqual:
                return BinaryOp.GreaterOrEqual;
            case TokenType.LessOrEqual:
                return BinaryOp.LessOrEqual;
            default:
                return BinaryOp.None;
        }
    }
    
    private parseSubExpression(priorityLimit: number = 0) {
        let binOp: BinaryOp;
        let unOp: UnaryOp;
        
        let exp: ExpressionNode;
        let type = this.lexer.token.type;
        unOp = this.getUnaryOp(type);
        if (unOp != UnaryOp.None) {
            let start = this.lexer.token.offset;
            this.lexer.next();
            exp = this.parseSubExpression(8);
            if (!exp) {
                return null;
            }
            exp = new UnaryExpressionNode(unOp, exp).setRange(start, exp.offset + exp.length - start);
        }
        else {
            exp = this.parsePostfixExpression();
        }
        if (!exp) {
            return null;
        }
        
        type = this.lexer.token.type;
        binOp = this.getBinaryOp(type);
        while (binOp && bin_op_priority[binOp][0] > priorityLimit) {
            this.lexer.next();
            let subexp = this.parseSubExpression(bin_op_priority[binOp][1]);
            if (!subexp) {
                if (!this.error) {
                    this.error = ParserErrorCode.ExpressionExpected;
                }
                return null;
            }
            exp = new BinaryExpressionNode(binOp, exp, subexp).setRange(exp.offset, subexp.offset + subexp.length - exp.offset);
            type = this.lexer.token.type;
            binOp = this.getBinaryOp(type);
        }
        return exp;
    }

    private parsePostfixExpression() {
        let expression = this.parsePrimaryExpression();
        if (!expression) return null;
        return this.parsePostfixExpression2(expression);
    }

    private parsePostfixExpression2(operand1: ExpressionNode) {
        if (this.parseOperator(TokenType.OpenBracket)) {
            let operand2;
            if (!(operand2 = this.requireExpression())) return null;
            let op = this.requireOperator(TokenType.CloseBracket, ParserErrorCode.CloseBracketExpected);
            if (!op) return null;
            let binaryExpression = new BinaryExpressionNode(BinaryOp.Index, operand1, operand2).setRange(operand1.offset, op.offset + op.length - operand1.offset);
            return this.parsePostfixExpression2(binaryExpression);
        } else if (this.parseOperator(TokenType.Dot)) {
            let action = this.parseIdentifier();
            if (!action) {
                if (!this.error) {
                    this.error = ParserErrorCode.IdentifierExpected;
                }
                return null;
            }
            let parameters = null;
            let closeParen: Token;
            if (this.parseOperator(TokenType.OpenParen)) {
                parameters = this.parseExpressionList();
                if (!parameters) return null;
                closeParen = this.requireOperator(TokenType.CloseParen, ParserErrorCode.CloseParenExpected);
                if (!closeParen) return null;
            }
            let length = closeParen ? closeParen.offset + closeParen.length - operand1.offset : (action.offset + action.length - operand1.offset);
            let fun = new FunctionExpressionNode(operand1, action, parameters).setRange(operand1.offset, length);
            return this.parsePostfixExpression2(fun);
        }
        return operand1;
    }

    private parseExpressionList(): ExpressionNode[] {
        if (this.lexer.token.type == TokenType.Comma) {
            this.error = ParserErrorCode.UnexpectedComma;
            return null;
        }
        
        let list: ExpressionNode[] = [];
        let expression = this.parseExpression();
        if (expression) {
            list.push(expression);
        } else {
            if (this.error) {
                return null;
            }
            return list;
        }
        return this.parseExpressionList2(list);
    }

    private parseExpressionList2(list: ExpressionNode[]): ExpressionNode[] {
        if (this.parseOperator(TokenType.Comma)) {
            let expression;
            if (!(expression = this.requireExpression())) return null;
            list.push(expression);
            return this.parseExpressionList2(list);
        }
        return list;
    }

    private parseKeyValueList() {
        if (this.lexer.token.type == TokenType.Comma) {
            this.error = ParserErrorCode.UnexpectedComma;
            return null;
        }
        
        let list: [ExpressionNode, ExpressionNode][] = [];
        let key = this.parseExpression();
        if (!key) return list;
        if (!this.requireOperator(TokenType.Colon, ParserErrorCode.ColonExpected)) return null;
        let value;
        if (!(value = this.requireExpression())) return null;
        list.push([key, value]);
        return this.parseKeyValueList2(list);
    }

    private parseKeyValueList2(list: [ExpressionNode, ExpressionNode][]) {
        if (this.parseOperator(TokenType.Comma)) {
            let key;
            if (!(key = this.requireExpression())) return null;
            if (!this.requireOperator(TokenType.Colon, ParserErrorCode.ColonExpected)) return null;
            let value;
            if (!(value = this.requireExpression())) return null;
            list.push([key, value]);
            return this.parseKeyValueList2(list);
        }
        return list;
    }

    private parsePrimaryExpression() {
        let expression: ExpressionNode;
        let type = this.lexer.token.type;
        switch (type) {
            case TokenType.String:
            case TokenType.Number:
            case TokenType.Boolean:
            case TokenType.Null:
            {
                let node = new LiteralNode(this.lexer.token.value).setRangeWithToken(this.lexer.token);
                this.lexer.next();
                return node;
            }
            case TokenType.OpenParen:
                this.lexer.next();
                if (!(expression = this.requireExpression())) return null;
                if (!this.requireOperator(TokenType.CloseParen, ParserErrorCode.CloseParenExpected)) return null;
                return expression;
            case TokenType.OpenBracket:
            {
                let open = this.lexer.token;
                this.lexer.next();
                let list = this.parseExpressionList();
                if (!list) {
                    if (!this.error) this.error = ParserErrorCode.ExpressionExpected;
                }
                let close = this.requireOperator(TokenType.CloseBracket, ParserErrorCode.CloseBracketExpected);
                if (!close) return null;
                return new ArrayExpressionNode(list).setRange(open.offset, close.offset + close.length - open.offset);
            }
            case TokenType.OpenBrace:
            {
                let open = this.lexer.token;
                this.lexer.next();
                let list = this.parseKeyValueList();
                if (!list) {
                    if (!this.error) this.error = ParserErrorCode.ExpressionExpected;
                }
                let close = this.requireOperator(TokenType.CloseBrace, ParserErrorCode.CloseBraceExpected);
                if (!close) return null;
                return new ObjectExpressionNode(list).setRange(open.offset, close.offset + close.length - open.offset);
            }
            case TokenType.Id:
            {
                let identifier = this.parseIdentifier();
                if (this.parseOperator(TokenType.OpenParen)) {
                    let list = this.parseExpressionList();
                    if (!list) {
                        if (!this.error) this.error = ParserErrorCode.ExpressionExpected;
                    }
                    if (this.lexer.token.type === TokenType.Comma && !this.error) {
                        this.error = ParserErrorCode.ArgumentExpressionExpected;
                        return null;
                    }
                    let closeParen = this.requireOperator(TokenType.CloseParen, ParserErrorCode.CloseParenExpected);
                    if (!closeParen) return null;
                    return new FunctionExpressionNode(null, identifier, list).setRange(identifier.offset, closeParen.offset + closeParen.length - identifier.offset);
                }
                else if (this.parseOperator(TokenType.Arrow)) {
                    if (!(expression = this.requireExpression())) return null;
                    return new LambdaExpressionNode(identifier, expression).setRange(identifier.offset, expression.offset + expression.length - identifier.offset);
                }
                return identifier;
            }
            case TokenType.Arrow:
            {
                this.error = ParserErrorCode.ArgumentIdentifierExpected;
                return null;
            }
            case TokenType.None:
                return null;
            case TokenType.Add:
            case TokenType.Sub:
            case TokenType.Mul:
            case TokenType.Div:
            case TokenType.Mod:
            case TokenType.LessThan:
            case TokenType.GreaterThan:
            case TokenType.LessOrEqual:
            case TokenType.GreaterOrEqual:
            case TokenType.Equal:
            case TokenType.NotEqual:
            case TokenType.Add:
            case TokenType.Or:
            case TokenType.Comma:
            {
                this.error = ParserErrorCode.ExpressionExpected;
                return null;
            }
        }
        
        return null;
    }

    private parseIdentifier() {
        if (this.lexer.token.type == TokenType.Id) {
            let token = this.lexer.token;
            this.lexer.next();
            return new IdentifierNode(token.value).setRangeWithToken(token);
        }
        return null;
    }

    public static parse(code: string): ParseResult {
        if (code === null || code === undefined) {
            code = '';
        }
        let parser = new Parser(code);
        let expression = parser.parse();
        if (parser.error) {
            let result = { parserError: parser.error, lexerError: parser.lexer.error };
            let message = result.lexerError ? Lexer.errorMessage(result.lexerError) : this.errorMessage(result.parserError);
            return { ...result, errorMessage: message, errorOffset: parser.lexer.token.offset, errorLength: parser.lexer.token.length };
        }
        else {
            return { expression: expression };
        }
    }

    public static errorMessage(errorCode: ParserErrorCode) {
        return errors[errorCode];
    }
}