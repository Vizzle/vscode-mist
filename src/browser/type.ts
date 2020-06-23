export class Parameter{
    name: string;
    type: IType;
    description?: string;

    constructor(name: string, type: IType, description?: string) {
        this.name = name;
        this.type = type;
        this.description = description;
    }
}

export class Method {
    type?: IType;
    ownerType?: Type;
    description?: string;
    params: Parameter[];
    jsEquivalent: (...params) => any;

    public static isSame(a: Method, b: Method) {
        return IType.isSame(a.type, b.type) && a.params.length === b.params.length && a.params.every((p, i) => IType.isSame(p.type, b.params[i].type));
    }

    public constructor(type: IType, description?: string, params: Parameter[] = [], jsEquivalent?: (...params) => any) {
        this.type = type;
        this.description = description;
        this.params = params;
        this.jsEquivalent = jsEquivalent;
    }

    registerToType(type: Type) {
        this.ownerType = type;
    }
}

export class Property {
    type: IType;
    ownerType?: Type;
    description?: string;
    readonly: boolean;
    jsEquivalent: (...params) => any;

    public constructor(type: IType, description?: string, readonly?: boolean, jsEquivalent?: (...params) => any) {
        this.type = type;
        this.description = description;
        this.readonly = readonly;
        this.jsEquivalent = jsEquivalent;
    }

    registerToType(type: Type) {
        this.ownerType = type;
    }
}

export abstract class IType {
    public static isSame(a: IType, b: IType) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        if (a.constructor !== b.constructor) {
            return false;
        }
        if (a instanceof CombinedType && b instanceof CombinedType) {
            return CombinedType.isSame(a, b);
        }
        if (a instanceof ArrayType && b instanceof ArrayType) {
            return ArrayType.isSame(a, b);
        }
        if (a instanceof ObjectType && b instanceof ObjectType) {
            return ObjectType.isSame(a, b);
        }
        if (a instanceof LiteralType && b instanceof LiteralType) {
            return LiteralType.isSame(a, b);
        }
        if (a instanceof ArrowType && b instanceof ArrowType) {
            return ArrowType.isSame(a, b);
        }
        return false;
    }
    public static typeof(obj: any, isConst: boolean = false): IType {
        if (obj instanceof IType) {
            return obj;
        }
        if (obj === undefined || obj === null) {
            if (isConst && obj === null) return new LiteralType(null);
            return Type.Any;
        }
        let type = typeof(obj);
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return isConst ? new LiteralType(obj) : Type.getType(type);
        }
        if (obj instanceof Array) {
            let types = obj.map(o => this.typeof(o, isConst));
            return isConst && obj.length > 0 ? ArrayType.tuple(types) : new ArrayType(UnionType.type(types));
        }
        return new ObjectType(Object.keys(obj).reduce((ret, k) => {ret[k] = this.typeof(obj[k], isConst); return ret}, {}));
    }
    private static isArrayType(type: IType) {
        return type === Type.Array || type instanceof ArrayType
    }
    private static getArrayElementType(type: IType) {
        if (type === Type.Array) {
            return Type.Any
        }
        else if (type instanceof ArrayType) {
            return type.getElementsType()
        }
        throw new Error('can not get element type with non-array type')
    }
    private static isTuple(type: IType): type is ArrayType {
        return type instanceof ArrayType && type.isTuple()
    }

    public abstract getName(): string;
    public abstract getAllProperties(): { [name: string]: Property };
    public abstract getProperty(name: string): Property;
    public abstract getAllMethods(): { [name: string]: Method[] };
    public abstract getMethods(name: string): Method[];
    public getTypeAtIndex(index: IType): IType {
        return Type.Any;
    }
    public kindof(type: IType, unionCheck: boolean = false): boolean {
        // everything kindof array
        if (type === Type.Any) {
            return true;
        }
        else if (this instanceof Type && this === Type.Any) {
            return !unionCheck;
        }
        else if (IType.isSame(this, type)) {
            return true;
        }
        // T kindof T1 & T2 if T kindof T1 and T kindof T2
        else if (type instanceof IntersectionType) {
            return type.getTypes().every(t => this.kindof(t, unionCheck));
        }
        // T1 & T2 kindof T if T1 kindof T or T2 kindof T
        else if (this instanceof IntersectionType) {
            return this.getTypes().some(t => t.kindof(type, unionCheck));
        }
        // T1 | T2 kindof T if T1 kindof T and T2 kindof T
        else if (this instanceof UnionType) {
            return this.getTypes().every(t => t.kindof(type, unionCheck));
        }
        // T kindof T1 | T2 if T kindof T1 or T kindof T2
        else if (type instanceof UnionType) {
            return type.getTypes().some(t => this.kindof(t, unionCheck));
        }
        else if (this instanceof LiteralType) {
            // currently all types accept the null value
            if (this.getValue() === null) return true;
            return this.getType().kindof(type, unionCheck);
        }
        else if (IType.isArrayType(this) && IType.isArrayType(type)) {
            if (IType.isTuple(type)) {
                if (IType.isTuple(this) && this.getElementsType().kindof(type.getElementsType(), unionCheck)) {
                    let thisTupleTypes = this.getTupleTypes();
                    let tupleTypes = type.getTupleTypes();
                    return thisTupleTypes.length >= tupleTypes.length && tupleTypes.every((t, i) => thisTupleTypes[i].kindof(t));
                }
                return false;
            }
            else {
                return IType.getArrayElementType(this).kindof(IType.getArrayElementType(type), unionCheck);
            }
        }
        else if (this instanceof ObjectType && type instanceof ObjectType) {
            let t = this;
            let required = type.getRequiredProperties();
            return Object.keys(type.getMap()).every(k => {
                let thisKeyType = t.getMap()[k];
                if (thisKeyType) {
                    return thisKeyType.kindof(type.getMap()[k], unionCheck);
                }
                else {
                    return required.indexOf(k) < 0;
                }
            });
        }
        else if (this instanceof ArrowType && type instanceof ArrowType) {
            return this.returnType.kindof(type.returnType)
                && this.params.length === type.params.length
                && this.params.every((t, i) => t.type.kindof(type.params[i].type));
        }
        return false;
    }
    public getMethod(name: string, paramsCount: number): Method {
        let methods = this.getMethods(name);
        if (methods) {
            return methods.find(m => m.params.length === paramsCount);
        }
        return null;
    }
}

export class Type extends IType {
    static readonly types: { [name: string]: Type } = {};

    public static registerType(type: Type) {
        this.types[type.name] = type;
        return this.types[type.name];
    }

    public registerProperty(name: string, property: Property) {
        this.properties[name] = property;
        property.registerToType(this);
        return this;
    }

    public registerPropertys(properties: { [name: string]: Property }) {
        Object.keys(properties).forEach(k => this.registerProperty(k, properties[k]));
        return this;
    }

    public registerMethod(name: string, method: Method | Method[]) {
        let methods = this.methods[name];
        let methodsToRegister = method instanceof Method ? [method] : method;
        methodsToRegister.forEach(m => {
            if (!methods) {
                methods = [];
                this.methods[name] = methods;
            }
            methods.push(m);
            m.registerToType(this);
        });
        return this;
    }

    public registerMethods(methods: { [name: string]: Method | Method[] }) {
        Object.keys(methods).forEach(k => this.registerMethod(k, methods[k]));
        return this;
    }

    public static Boolean = Type.registerType(new Type('boolean'));
    public static Number = Type.registerType(new Type('number'));
    public static String = Type.registerType(new Type('string'));
    private static _dummy = Type.Number.registerPropertys({
        "intValue": new Property(Type.Number, "数字的整数值", true, n => Math.floor(n)),
        "doubleValue": new Property(Type.Number, "数字的浮点数值", true, n => n),
        "floatValue": new Property(Type.Number, "数字的浮点数值", true, n => n),
        "boolValue": new Property(Type.Boolean, "数字的布尔值", true, n => n !== 0),
    }).registerMethods({
        "toFixed": new Method(Type.String, '返回数字的定点数表示形式', [new Parameter('fractionDigits', Type.Number, '保留小数位数')], (n: number, fractionDigits) => n.toFixed(fractionDigits)),
        "toPrecision": new Method(Type.String, '返回数字的浮点数表示，指定有效数字', [new Parameter('precision', Type.Number, '有效数字位数')], (n: number, precision) => n.toPrecision(precision)),
    });
    private static _dummy2 = Type.String.registerPropertys({
        "length": new Property(Type.Number, "字符串长度", true, str => str.length),
        "intValue": new Property(Type.Number, "字符串的整数值", true, str => parseInt(str)),
        "doubleValue": new Property(Type.Number, "字符串的浮点数值", true, str => parseFloat(str)),
        "floatValue": new Property(Type.Number, "字符串的浮点数值", true, str => parseFloat(str)),
        "boolValue": new Property(Type.Boolean, "字符串的布尔值", true, (s: string) => /^\s*[TtYy1-9]/.test(s)),
    });
    public static Any = Type.registerType(new Type('any'));
    public static Null = Type.registerType(new Type('null'));
    public static Void = Type.registerType(new Type('void'));
    public static Global = Type.registerType(new Type('global'));
    public static Array = Type.registerType(new Type('array')).registerPropertys({
        "count": new Property(Type.Number, "数组元素数量", true, list => list.length),
    });
    public static Object = Type.registerType(new Type('object')).registerPropertys({
        "count": new Property(Type.Number, "字典元素数量", true, obj => Object.keys(obj).length),
    });

    private name: string;
    private description?: string;
    private properties: { [name: string]: Property };
    private methods: { [name: string]: Method[] };
    private classMethods: { [name: string]: Method[] };

    public static getType(name: string) {
        return this.types[name];
    }

    public constructor(name: string, description?: string) {
        super();
        this.name = name;
        this.description = description;
        this.properties = {};
        this.methods = {};
        this.classMethods = {};
    }

    public getName(): string {
        return this.name;
    }

    public getAllProperties(): { [name: string]: Property } {
        return this.properties;
    }

    public getAllMethods(): { [name: string]: Method[] } {
        return this.methods;
    }

    public getProperty(name: string) {
        return this.properties[name];
    }

    public getMethods(name: string) {
        return this.methods[name];
    }

    public getMethod(name: string, paramsCount: number) {
        let methods = this.methods[name];
        if (!methods) return null;
        return methods.find(m => m.params.length === paramsCount);
    }

    public getClassMethods(name: string) {
        return this.classMethods[name];
    }

    public getClassMethod(name: string, paramsCount: number) {
        return this.classMethods[name].find(m => m.params.length === paramsCount);
    }

    public getTypeAtIndex(index: IType): IType {
        if (this === Type.String) {
            return Type.String;
        }
        return super.getTypeAtIndex(index);
    }
}

export class LiteralType extends IType {
    public static isSame(a: LiteralType, b: LiteralType) {
        return a.value === b.value;
    }
    public constructor (private value, private discription?: string) {
        super();
    }
    public getValue(): any {
        return this.value;
    }
    public getType(): IType {
        if (this.value === null) return Type.Null;
        return IType.typeof(this.value);
    }
    public getName(): string {
        return JSON.stringify(this.value);
    }
    public getAllProperties(): { [name: string]: Property; } {
        return Type.typeof(this.value).getAllProperties();
    }
    public getProperty(name: string): Property {
        return Type.typeof(this.value).getProperty(name);
    }
    public getAllMethods(): { [name: string]: Method[]; } {
        return Type.typeof(this.value).getAllMethods();
    }
    public getMethods(name: string): Method[] {
        return Type.typeof(this.value).getMethods(name);
    }
}

export abstract class CombinedType extends IType {
    protected types: IType[];
    public static isSame(a: CombinedType, b: CombinedType) {
        return a.types.length === b.types.length && a.types.every(t => b.types.indexOf(t) >= 0);
    }
    public constructor(...types: IType[]) {
        super();
        this.types = types;
    }
    public getTypes(): IType[] {
        return this.types;
    }
}

export class IntersectionType extends CombinedType {

    public static type(types: IType[]) {
        if (types.length === 0) {
            return Type.Any;
        }
        let ts = types.map(t => t instanceof IntersectionType ? t.types : [t]).reduce((p, c) => p.concat(c), []);
        if (ts.indexOf(Type.Any) >= 0) {
            return Type.Any;
        }
        ts = [...new Set(ts)];
        ts = ts.filter((t, i) => ts.findIndex(s => IType.isSame(t, s)) === i);
        let objectTypes: ObjectType[] = ts.filter(t => t instanceof ObjectType) as ObjectType[];
        if (objectTypes.length >= 2) {
            let newObjectType = new ObjectType(objectTypes.reduce((p, c) => {
                let map = c.getMap();
                Object.keys(map).forEach(k => {
                    if (k in p) {
                        p[k] = IntersectionType.type([p[k], map[k]]);
                    }
                    else {
                        p[k] = map[k];
                    }
                });
                return p;
            }, {}));
            ts = ts.filter(t => !(t instanceof ObjectType));
            ts.push(newObjectType);
        }
        let arrayTypes: ArrayType[] = ts.filter(t => t instanceof ArrayType) as ArrayType[];
        if (arrayTypes.length >= 2) {
            let newArrayType = new ArrayType(IntersectionType.type(arrayTypes.map(t => t.getElementsType())));
            ts = ts.filter(t => !(t instanceof ArrayType));
            ts.push(newArrayType);
        }
        if (ts.length === 0) {
            return Type.Any;
        }
        else if (ts.length === 1) {
            return ts[0];
        }
        else {
            return new IntersectionType(...ts);
        }
    }

    public constructor(...types: IType[]) {
        super(...types);
    }

    public getName(): string {
        return this.types.map(t => t.getName()).join(' & ');
    }

    public getAllProperties(): { [name: string]: Property } {
        let propertiesList = this.types.map(t => t.getAllProperties());
        let names = [...new Set(propertiesList.map(ps => Object.keys(ps)).reduce((p, c) => p.concat(c), []))];
        let properties = {};
        names.forEach(n => {
            let ps = propertiesList.map(ps => ps[n]).filter(p => p);
            let p: Property;
            if (ps.length === 0) {
                p = null;
            }
            else if (ps.length === 1) {
                p = ps[0];
            }
            else {
                p = new Property(IntersectionType.type(ps.map(p => p.type)), ps[0].description, ps.every(p => p.readonly));
            }
            if (p) {
                properties[n] = p;
            }
        });
        return properties;
    }

    public getProperty(name: string): Property {
        let ps = this.types.map(t => t.getProperty(name)).filter(p => p);
        if (ps.length === 0) {
            return null;
        }
        else if (ps.length === 1) {
            return ps[0];
        }
        else {
            return new Property(IntersectionType.type(ps.map(p => p.type)), ps[0].description, ps.every(p => p.readonly));
        }
    }

    public getAllMethods(): { [name: string]: Method[] } {
        let methodsList = this.types.map(t => t.getAllMethods());
        let names = [...new Set(methodsList.map(ms => Object.keys(ms)).reduce((p, c) => p.concat(c), []))];
        let methods = {};
        names.forEach(name => {
            let ms = methodsList.map(ms => ms[name]).filter(p => p).reduce((p, c) => p.concat(c), []);
            ms = ms.reduce((p, c) => {
                let index = p.findIndex(n => Method.isSame(c, n));
                if (index >= 0) {
                    let m = p[index];
                    p[index] = new Method(m.type, m.description, m.params, m.jsEquivalent);
                }
                else {
                    p.push(c);
                }
                return p;
            }, <Method[]>[]);
            // let ms = this.getMethods(name);
            if (ms.length > 0) {
                methods[name] = ms;
            }
        });
        return methods;
    }

    public getMethods(name: string): Method[] {
        let ms = this.types.map(t => t.getMethods(name)).filter(p => p).reduce((p, c) => p.concat(c), []);
        ms = ms.reduce((p, c) => {
            let index = p.findIndex(name => Method.isSame(c, name));
            if (index >= 0) {
                let m = p[index];
                p[index] = new Method(m.type, m.description, m.params, m.jsEquivalent);
            }
            else {
                p.push(c);
            }
            return p;
        }, <Method[]>[]);
        return ms;
    }
}

export class UnionType extends CombinedType {

    public static type(types: IType[]) {
        if (types.length === 0) {
            return Type.Any;
        }
        let ts = types.map(t => t instanceof UnionType ? t.types : [t]).reduce((p, c) => p.concat(c), []);
        if (ts.indexOf(Type.Any) >= 0) {
            return Type.Any;
        }
        ts = [...new Set(ts)];

        // 去掉多余的类型，比如 'abc' | string => string
        for (var i = 0; i < ts.length; i++) {
            for (var j = i + 1; j < ts.length; j++) {
                if (ts[i].kindof(ts[j], true)) {
                    ts.splice(i, 1);
                    i--;
                    break;
                }
                else if (ts[j].kindof(ts[i], true)) {
                    ts.splice(j, 1);
                    break;
                }
            }
        }

        if (ts.length === 0) {
            return Type.Any;
        }
        else if (ts.length === 1) {
            return ts[0];
        }
        else {
            return new UnionType(...ts);
        }
    }

    public constructor(...types: IType[]) {
        super(...types);
    }

    public getName(): string {
        return this.types.map(t => t.getName()).join(' | ');
    }

    public getAllProperties(): { [name: string]: Property } {
        let propertiesList = this.types.map(t => t.getAllProperties());
        let names = [...new Set(propertiesList.map(ps => Object.keys(ps)).reduce((p, c) => p.concat(c), []))];
        let properties = {};
        names.forEach(n => {
            let ps = propertiesList.map(ps => ps[n]).filter(p => p);
            let p: Property;
            if (ps.length === this.types.length) {
                p = new Property(UnionType.type(ps.map(p => p.type)), ps[0].description, ps.every(p => p.readonly));
            }
            else {
                p = null;
            }
            if (p) {
                properties[n] = p;
            }
        });
        return properties;
    }

    public getProperty(name: string): Property {
        let ps = this.types.map(t => t.getProperty(name)).filter(p => p);
        if (ps.length === this.types.length) {
            return new Property(UnionType.type(ps.map(p => p.type)), ps[0].description, ps.every(p => p.readonly));
        }
        else {
            return null;
        }
    }

    public getAllMethods(): { [name: string]: Method[] } {
        let methodsList = this.types.map(t => t.getAllMethods());
        let names = methodsList.map(ms => Object.keys(ms)).reduce((p, c) => p.filter(m => c.indexOf(m) >= 0, []));
        let methods = {};
        names.forEach(name => {
            let msList = methodsList.map(ms => ms[name]).filter(p => p);
            let ms = msList.slice(1).reduce((p, c) => {
                let ret = [];
                p.forEach((v, i) => {
                    let method = c.find(m => v.params.length === m.params.length && v.params.every((p, i) => IType.isSame(p.type, m.params[i].type)));
                    if (method) {
                        ret.push(new Method(UnionType.type([v.type, method.type]), v.description, v.params, v.jsEquivalent));
                    }
                });
                return ret;
            }, [...msList[0]]);
            // let ms = this.getMethods(name);
            if (ms.length > 0) {
                methods[name] = ms;
            }
        });
        return methods;
    }

    public getMethods(name: string): Method[] {
        let msList = this.types.map(t => t.getMethods(name)).filter(p => p);
        if (msList.length === 0) return [];
        let ms = msList.slice(1).reduce((p, c) => {
            let ret = [];
            p.forEach((v, i) => {
                let method = c.find(m => v.params.length === m.params.length && v.params.every((p, i) => IType.isSame(p.type, m.params[i].type)));
                if (method) {
                    ret.push(new Method(UnionType.type([v.type, method.type]), v.description, v.params, v.jsEquivalent));
                }
            });
            return ret;
        }, [...msList[0]]);
        return ms;
    }

    public getTypeAtIndex(index: IType): IType {
        return UnionType.type(this.types.map(t => t.getTypeAtIndex(index)));
    }
}

export class ArrayType extends IType {
    private elementsType: IType;
    private tupleTypes: IType[];

    public static tuple(types: IType[]) {
        let type = new ArrayType(UnionType.type(types));
        type.tupleTypes = types;
        return type;
    }

    public static isSame(a: ArrayType, b: ArrayType) {
        return IType.isSame(a.elementsType, b.elementsType);
    }

    public constructor(elementsType: IType) {
        super();
        this.elementsType = elementsType;
    }

    public getName(): string {
        const getTypeName = (t: IType) => t instanceof UnionType || t instanceof IntersectionType ? `(${t.getName()})` : t.getName();
        return this.tupleTypes ? `[${this.tupleTypes.map(t => t.getName()).join(', ')}]` : (getTypeName(this.elementsType) + '[]');
    }

    public getElementsType(): IType {
        return this.elementsType;
    }

    public getTupleTypes(): IType[] {
        return this.tupleTypes;
    }

    public isTuple(): boolean {
        return !!this.tupleTypes;
    }

    public getAllProperties(): { [name: string]: Property; } {
        return Type.getType('array').getAllProperties();
    }

    public getProperty(name: string): Property {
        return Type.getType('array').getProperty(name);
    }

    public getAllMethods(): { [name: string]: Method[]; } {
        return Type.getType('array').getAllMethods();
    }

    public getMethods(name: string): Method[] {
        return Type.getType('array').getMethods(name);
    }

    public getTypeAtIndex(index: IType): IType {
        if (!index.kindof(Type.Number)) {
            return Type.Any;
        }
        if (index instanceof LiteralType && this.isTuple()) {
            let i = index.getValue();
            let tupleTypes = this.getTupleTypes();
            if (i < tupleTypes.length) {
                return tupleTypes[i];
            }
        }
        return this.getElementsType();
    }
}

export class ObjectType extends IType {
    private map: { [key: string]: IType };
    private required: string[];
    private indexType: { name: string, type: IType };

    public static isSame(a: ObjectType, b: ObjectType) {
        let keysA = Object.keys(a.map);
        let keysB = Object.keys(b.map);
        let indexTypeA = a.indexType ? a.indexType.type : null;
        let indexTypeB = b.indexType ? b.indexType.type : null;
        return indexTypeA === indexTypeB && keysA.length === keysB.length && keysA.every(k => IType.isSame(a.map[k], b.map[k]));
    }

    public constructor(map: { [key: string]: IType }, requiredProperties?: string[], indexType?: { name: string, type: IType }) {
        super();
        this.map = map;
        this.indexType = indexType;
        this.required = requiredProperties || [];
    }

    public setIndexType(name: string = 'key', type: IType = Type.Any) {
        this.indexType = { name: name, type: type };
        return this;
    }

    public getMap(): { [key: string]: IType } {
        return this.map;
    }

    public getName(): string {
        let keys = Object.keys(this.map);
        if (keys.length === 0 && !this.indexType) {
            return '{}';
        }
        let props = keys.map(k => `"${k}"${this.required.indexOf(k) >= 0 ? '!' : ''}: ${this.map[k].getName()};`);
        if (this.indexType) {
            props.splice(0, 0, `[${this.indexType.name}: string]: ${this.indexType.type.getName()};`);
        }

        return `{
    ${props.join('\n').replace(/\n/mg, '\n    ')}
}`;
    }

    public getAllProperties(): { [name: string]: Property; } {
        const commonProperties = Type.getType('object').getAllProperties();
        const thisProperties = Object.keys(this.map).reduce((p, c) => { p[c] = new Property(this.map[c]); return p; }, {});
        return { ...commonProperties, ...thisProperties }
    }

    public getRequiredProperties() {
        return this.required;
    }

    public getProperty(name: string): Property {
        if (name in this.map) {
            return new Property(this.map[name]);
        }

        const prop = Type.getType('object').getProperty(name)
        if (prop) {
            return prop
        }

        if (this.indexType) {
            return new Property(this.indexType.type);
        }
        return null;
    }

    public getAllMethods(): { [name: string]: Method[]; } {
        return Type.getType('object').getAllMethods();
    }

    public getMethods(name: string): Method[] {
        return Type.getType('object').getMethods(name);
    }
}

export class ArrowType extends IType {
    returnType: IType;
    params: Parameter[];

    public static isSame(a: ArrowType, b: ArrowType) {
        return IType.isSame(a.returnType, b.returnType) 
            && a.params.length === b.params.length 
            && a.params.every((p, i) => IType.isSame(p.type, b.params[i].type));
    }

    public constructor(returnType: IType, params: Parameter[]) {
        super();
        this.returnType = returnType;
        this.params = params;
    }

    public getName(): string {
        return `(${this.params.map(p => `${p.name}: ${p.type.getName()}`).join(', ')}) => ${this.returnType.getName()}`;
    }

    public getAllProperties(): { [name: string]: Property; } {
        return {};
    }

    public getProperty(name: string): Property {
        return null;
    }

    public getAllMethods(): { [name: string]: Method[]; } {
        return {};
    }

    public getMethods(name: string): Method[] {
        return [];
    }
}
