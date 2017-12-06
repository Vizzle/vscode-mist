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

    public constructor(type: IType, description?: string, params: Parameter[] = [], jsEquivalent?: (...params) => any) {
        this.type = type;
        this.description = description;
        this.params = params;
        this.jsEquivalent = jsEquivalent;
    }

    registerToType(type: Type) {
        this.ownerType = type;
    }

    public static isSame(a: Method, b: Method) {
        return IType.isSame(a.type, b.type) && a.params.length == b.params.length && a.params.every((p, i) => IType.isSame(p.type, b.params[i].type));
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
    public abstract getName(): string;
    public abstract getAllProperties(): { [name: string]: Property };
    public abstract getProperty(name: string): Property;
    public abstract getAllMethods(): { [name: string]: Method[] };
    public abstract getMethods(name: string): Method[];
    public getMethod(name: string, paramsCount: number): Method {
        let methods = this.getMethods(name);
        if (methods) {
            return methods.find(m => m.params.length == paramsCount);
        }
        return null;
    }
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
        console.log('type', new Type('test').constructor);
        return false;
    }
    public static typeof(obj: any): IType {
        if (obj instanceof IType) {
            return obj;
        }
        if (obj === undefined || obj === null) {
            return Type.Any;
        }
        let type = typeof(obj);
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return Type.getType(type);
        }
        if (obj instanceof Array) {
            return new ArrayType(IntersectionType.type(obj.map(o => this.typeof(o))));
        }
        return new ObjectType(Object.keys(obj).reduce((ret, k) => {ret[k] = this.typeof(obj[k]); return ret}, {}));
    }
}

export class Type extends IType {
    private name: string;
    private description?: string;
    private properties: { [name: string]: Property };
    private methods: { [name: string]: Method[] };
    private classMethods: { [name: string]: Method[] };

    private static types: { [name: string]: Type } = {};

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
        return methods.find(m => m.params.length == paramsCount);
    }

    public getClassMethods(name: string) {
        return this.classMethods[name];
    }

    public getClassMethod(name: string, paramsCount: number) {
        return this.classMethods[name].find(m => m.params.length == paramsCount);
    }
    
    public static Number = Type.registerType(new Type('number'));
    public static Boolean = Type.registerType(new Type('boolean'));
    public static String = Type.registerType(new Type('string'));
    public static Any = Type.registerType(new Type('any'));
    public static Null = Type.registerType(new Type('null'));
    public static Void = Type.registerType(new Type('void'));
    public static Global = Type.registerType(new Type('global'));
    public static Array = Type.registerType(new Type('array')).registerPropertys({
        "count": new Property(Type.getType('number'), "数组元素数量", true),
    });
    public static Object = Type.registerType(new Type('object')).registerPropertys({
        "count": new Property(Type.getType('number'), "字典元素数量", true),
    });
}

abstract class CombinedType extends IType {
    protected types: IType[];
    public constructor(...types: IType[]) {
        super();
        this.types = types;
    }
    public static isSame(a: CombinedType, b: CombinedType) {
        return a.types.length == b.types.length && a.types.every(t => b.types.indexOf(t) >= 0);
    }
}

export class IntersectionType extends CombinedType {

    public constructor(...types: IType[]) {
        super(...types);
    }

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
                        p[k] = UnionType.type([p[k], map[k]]);
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
        if (ts.length == 0) {
            return Type.Any;
        }
        else if (ts.length == 1) {
            return ts[0];
        }
        else {
            return new IntersectionType(...ts);
        }
    }

    public getName(): string {
        return '(' + this.types.map(t => t.getName()).join(' & ') + ')';
    }

    public getAllProperties(): { [name: string]: Property } {
        let propertiesList = this.types.map(t => t.getAllProperties());
        let names = [...new Set(propertiesList.map(ps => Object.keys(ps)).reduce((p, c) => p.concat(c), []))];
        let properties = {};
        names.forEach(n => {
            let ps = propertiesList.map(ps => ps[n]).filter(p => p);
            let p: Property;
            if (ps.length == 0) {
                p = null;
            }
            else if (ps.length == 1) {
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
        if (ps.length == 0) {
            return null;
        }
        else if (ps.length == 1) {
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

    public constructor(...types: IType[]) {
        super(...types);
    }

    public static type(types: IType[]) {
        if (types.length === 0) {
            return Type.Any;
        }
        let ts = types.map(t => t instanceof UnionType ? t.types : [t]).reduce((p, c) => p.concat(c), []);
        if (ts.indexOf(Type.Any) >= 0) {
            return Type.Any;
        }
        ts = [...new Set(ts)];
        ts = ts.filter((t, i) => ts.findIndex(s => IType.isSame(t, s)) === i);
        if (ts.length == 0) {
            return Type.Any;
        }
        else if (ts.length == 1) {
            return ts[0];
        }
        else {
            return new UnionType(...ts);
        }
    }

    public getName(): string {
        return '(' + this.types.map(t => t.getName()).join(' | ') + ')';
    }

    public getAllProperties(): { [name: string]: Property } {
        let propertiesList = this.types.map(t => t.getAllProperties());
        let names = [...new Set(propertiesList.map(ps => Object.keys(ps)).reduce((p, c) => p.concat(c), []))];
        let properties = {};
        names.forEach(n => {
            let ps = propertiesList.map(ps => ps[n]).filter(p => p);
            let p: Property;
            if (ps.length == this.types.length) {
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
        if (ps.length == this.types.length) {
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
                    let method = c.find(m => v.params.length == m.params.length && v.params.every((p, i) => IType.isSame(p.type, m.params[i].type)));
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
        let ms = msList.slice(1).reduce((p, c) => {
            let ret = [];
            p.forEach((v, i) => {
                let method = c.find(m => v.params.length == m.params.length && v.params.every((p, i) => IType.isSame(p.type, m.params[i].type)));
                if (method) {
                    ret.push(new Method(UnionType.type([v.type, method.type]), v.description, v.params, v.jsEquivalent));
                }
            });
            return ret;
        }, [...msList[0]]);
        return ms;
    }
}

export class ArrayType extends IType {
    private elementsType: IType;

    public constructor(elementsType: IType) {
        super();
        this.elementsType = elementsType;
    }

    public getName(): string {
        return this.elementsType.getName() + '[]';
    }

    public getElementsType(): IType {
        return this.elementsType;
    }

    public getAllProperties(): { [name: string]: Property; } {
        return Type.getType('array').getAllProperties();//ArrayType.properties;
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

    public static isSame(a: ArrayType, b: ArrayType) {
        return IType.isSame(a.elementsType, b.elementsType);
    }
}

export class ObjectType extends IType {
    private map: { [key: string]: IType };

    static properties = {
        
    }

    static methods = {
        
    }

    public constructor(map: { [key: string]: IType }) {
        super();
        this.map = map;
    }

    public getMap(): { [key: string]: IType } {
        return this.map;
    }

    public getName(): string {
        let keys = Object.keys(this.map);
        if (keys.length == 0) {
            return '{}';
        }
        return `{
    ${keys.map(k => `"${k}": ${this.map[k].getName()};`).join('\n').replace(/\n/mg, '\n    ')}
}`;
    }

    public getAllProperties(): { [name: string]: Property; } {
        return Object.keys(this.map).reduce((p, c) => { p[c] = new Property(this.map[c]); return p;}, {});
    }

    public getProperty(name: string): Property {
        if (name in this.map) {
            return new Property(this.map[name]);
        }
        return null;
    }

    public getAllMethods(): { [name: string]: Method[]; } {
        return ObjectType.methods;
    }

    public getMethods(name: string): Method[] {
        return ObjectType.methods[name];
    }
    
    public static isSame(a: ObjectType, b: ObjectType) {
        let keysA = Object.keys(a.map);
        let keysB = Object.keys(b.map);
        return keysA.length === keysB.length && keysA.every(k => IType.isSame(a.map[k], b.map[k]));
    }
}
