import * as json from 'jsonc-parser';
import { Type, IType, ArrayType, ObjectType, UnionType, LiteralType } from './browser/type';

export class ValidationResult {
    constructor(public error: string, public node: json.Node, public isWarning = false) {}
}

export type SchemaObject = {
    definitions?: {
        [name: string]: Schema;
    };
    type?: string;
    format?: string;
    description?: string;
    deprecatedMessage?: string;
    errorMessage?: string;
    properties?: {
        [name: string]: Schema;
    };
    patternProperties?: {
        [name: string]: Schema;
    };
    additionalProperties?: Schema;
    required?: string[];
    items?: Schema;
    min?: number;
    max?: number;
    enum?: any[];
    enumDescriptions?: string[];
    pattern?: string;
    oneOf?: Schema[];
    snippet?: string;
    $ref?: string;
};

export type Schema = SchemaObject | boolean;

export interface ISchema {
    validateJsonNode(node: json.Node, offset: number, matchingSchemas: Schema[]): ValidationResult[];
}

export class SchemaFormat {
    private static map: {
        [name: string]: ISchema
    } = {};

    public static registerFormat(name: string, format: ISchema) {
        this.map[name] = format;
    }

    public static getFormatSchema(name: string) {
        return this.map[name];
    }
}

export function parseSchema(schema: Schema, reference?: any): Schema {
    if (!schema) return schema;
    return _resolveRefs(schema, reference);
}

export function validateJsonNode(node: json.Node, schema: Schema, offset: number = -1, matchingSchemas: Schema[] = []): ValidationResult[] {
    return _validateJsonNode(node, schema, offset, matchingSchemas);
}

export function validate(value: any, schema: Schema) {
    return validateJsonNode(valueToJsonNode(value), schema).map(r => r.error);
}

function valueToJsonNode(value: any): json.Node {
    let nodeType: json.NodeType;
    let type = typeof(value);
    if (type === 'symbol' || type === 'function') {
        return null;
    }
    else if (value instanceof Array) {
        nodeType = 'array';
    }
    else if (type === 'undefined') {
        value = null;
        nodeType = 'null';
    }
    else {
        nodeType = type;
    }
    let node: json.Node = {
        type: nodeType,
        value: value,
        offset: -1,
        length: -1
    };
    if (value instanceof Array) {
        node.children = value.map(valueToJsonNode);
        node.children.forEach(n => n.parent = node);
    }
    else if (type === 'object') {
        node.children = Object.keys(value).map(k => {
            let keyNode = valueToJsonNode(k);
            let valueNode = valueToJsonNode(value[k]);
            let property: json.Node = {
                type: 'property',
                offset: -1,
                length: -1,
                children: [keyNode, valueNode]
            };
            keyNode.parent = property;
            valueNode.parent = property;
            return property;
        });
        node.children.forEach(n => n.parent = node);
    }
    return node;
}

function _resolveRefs(schema: Schema, reference?: any): Schema {
    if (!reference) {
        reference = schema;
    }
    let visitedObjects = [];
    let readPath = (path: string) => {
        if (!path.startsWith('#/')) {
            path = '#/' + path;
        }
        return path.split('/').reduce((p, c) => c === '#' ? reference : p ? p[c] : null, null) || true;
    }
    let resolveRef = (s: Schema) => {
        if (s && typeof(s) === 'object' && s.$ref) {
            let $ref = s.$ref;
            delete s.$ref;
            let r: Schema = readPath($ref);
            if (typeof(r) === 'object') {
                r = {...r};
                if (s.description) r.description = s.description;
                if (s.errorMessage) r.errorMessage = s.errorMessage;
                if (s.deprecatedMessage) r.deprecatedMessage = s.deprecatedMessage;
            } 
            return r;
        }
        if (s instanceof Array) {
            return s.map(resolveRef);
        }
        else if (s && typeof(s) === 'object' && visitedObjects.indexOf(s) < 0) {
            visitedObjects.push(s);
            Object.keys(s).forEach(k => s[k] = resolveRef(s[k]));
            return s;
        }
        return s;
    }
    return resolveRef(schema);
}

function containsOffset(node: json.Node, offset: number) {
    if (!node) return false;
    if (node.offset <= offset && node.offset + node.length >= offset) return true;
    if (node.type === 'property') {
        return containsOffset(node.children[1], offset);
    }
    return false;
}

function getValueType(value: any): string {
    if (value === null) return 'null';
    if (value instanceof IType) return value.getName();
    if (value instanceof Array) return 'array';
    if (value instanceof Object) return 'object';
    return typeof(value);
}

function getSchemaType(s: Schema): IType {
    if (!s || typeof(s) === 'boolean') {
        return Type.Any;
    }
    if (s.oneOf) {
        return UnionType.type(s.oneOf.map(getSchemaType));
    }
    if (s.enum) {
        return UnionType.type(s.enum.map(e => new LiteralType(e)));
    }
    if (!s.type) {
        return Type.Any;
    }
    switch (s.type) {
        case 'number': case 'integer': return Type.Number;
        case 'string': return Type.String;
        case 'boolean': return Type.Boolean;
        case 'null': return Type.Null;
        case 'array': return new ArrayType(getSchemaType(s.items));
        case 'object':
        {
            let properties = Object.keys(s.properties || {}).reduce((p, c) => { p[c] = getSchemaType(s.properties[c]); return p; }, {});
            let indexType = s.additionalProperties ? getSchemaType(s.additionalProperties) : null;
            return new ObjectType(properties, s.required, indexType ? { name: 'key', type: indexType } : null);
        }
        default: return Type.Any;
    }
}

function _validateJsonNode(node: json.Node, schema: Schema, offset: number, matchingSchemas: Schema[]): ValidationResult[] {
    let errors: ValidationResult[] = [];

    do {
        if (typeof(schema) === 'boolean') {
            if (!schema) {
                errors.push(new ValidationResult(`Schema 始终不通过`, node));
            }
            return errors;
        }

        if (offset >= 0 && !containsOffset(node, offset)) {
            return errors;
        }
        
        if (node && node.type === 'property') {
            node = node.children[1];
        }

        if (matchingSchemas) {
            matchingSchemas.splice(0, matchingSchemas.length, schema);
        }

        if (schema.format) {
            let format = SchemaFormat.getFormatSchema(schema.format);
            if (format) {
                errors.push(...format.validateJsonNode(node, offset, matchingSchemas));
            }
            break;
        }

        if (!node) break;
        
        if (node.value instanceof IType) {
            if (node.value instanceof LiteralType) {
                node.value = node.value.getValue();
            }
            else {
                let schemaType = getSchemaType(schema);
                if (!node.value.kindof(schemaType)) {
                    errors.push(new ValidationResult(`不能将类型 \`${node.value.getName()}\` 分配给类型 \`${schemaType.getName()}\``, node));
                }
                break;
            }
        }
        let valueType = node.type === 'string' ? getValueType(node.value) : node.type;
        // let valueType = node.type;
        if (schema.deprecatedMessage) {
            errors.push(new ValidationResult(schema.deprecatedMessage, node));
        }
        if (schema.oneOf) {
            let errorsList: [string, ValidationResult[], Schema[]][] = schema.oneOf.map(s => {
                let matching = [];
                return <[string, ValidationResult[], Schema[]]>[typeof(s) === 'object' ? s.type : undefined, _validateJsonNode(node, s, offset, matching), matching];
            });
            if (errorsList.every(l => l[1].length > 0)) {
                let found = errorsList.find(l => l[0] === valueType);
                if (found) {
                    errors.push(...found[1]);
                }
                else {
                    errors.push(new ValidationResult('不符合 schema', node));
                }
            }
            const noErrorSchemas = errorsList.filter(l => l[1].length === 0).reduce((p, c) => [...p, ...c[2]], []);
            if (noErrorSchemas.length === 1) {
                matchingSchemas.splice(0, matchingSchemas.length, noErrorSchemas[0]);
                break;
            }
            let schemas = errorsList.filter(l => l[0] === undefined || l[0] === valueType).reduce((p, c) => [...p, ...c[2]], []);
            if (schemas.length > 0) {
                matchingSchemas.splice(0, matchingSchemas.length, ...schemas);
            }
            break;
        }
        if (schema.type && valueType !== schema.type && valueType !== 'any') {
            if (!(schema.type === 'integer' && valueType === 'number')) {
                errors.push(new ValidationResult(`类型不匹配，需要 \`${schema.type}\` 类型`, node));
                break;
            }
        }
        if (node.value instanceof IType) break;
        if (valueType === 'array' && schema.items) {
            node.children.forEach(c => {
                errors.push(..._validateJsonNode(c, schema.items, offset, matchingSchemas));
            });
        }
        else if (valueType === 'object') {
            let properties = schema.properties || {};
            node.children.forEach(p => {
                let [keyNode, valueNode] = p.children;
                let k = keyNode.value;
                if (k in properties) {
                    let s = properties[k];
                    if (s && typeof(s) === 'object' && s.deprecatedMessage) {
                        errors.push(new ValidationResult(s.deprecatedMessage, p.children[0]));
                    }
                    errors.push(..._validateJsonNode(p, properties[k], offset, matchingSchemas));
                }
                else {
                    if (schema.patternProperties) {
                        let pattern = Object.keys(schema.patternProperties).find(p => !!k.match(p));
                        if (pattern) {
                            errors.push(..._validateJsonNode(p, schema.patternProperties[pattern], offset, matchingSchemas));
                        }
                        else if (!schema.additionalProperties) {
                            errors.push(new ValidationResult(`无效的属性名称 \`${k}\`，需满足下列正则表达式 ${Object.keys(schema.patternProperties).map(r => `\`${r}\``).join(', ')}`, keyNode));
                            if (containsOffset(p, offset)) {
                                matchingSchemas.splice(0);
                            }
                        }
                        return;
                    }
                    if (!schema.additionalProperties) {
                        errors.push(new ValidationResult(`不存在属性 \`${k}\``, keyNode));
                        if (containsOffset(p, offset)) {
                            matchingSchemas.splice(0);
                        }
                    }
                    else {
                        errors.push(..._validateJsonNode(p, schema.additionalProperties, offset, matchingSchemas));
                    }
                }
            });
            if (schema.required) {
                let missingKeys = schema.required.filter(k => !(node.children.find(c => c.children[0].value === k)));
                if (missingKeys.length > 0) {
                    errors.push(new ValidationResult(`缺少属性 ${missingKeys.map(k => `\`${k}\``).join(', ')}`, node));
                }
            }
        }
        else if (valueType === 'number') {
            if (node.value < schema.min) {
                errors.push(new ValidationResult(`值不能小于 ${schema.min}`, node));
            }
            if (node.value > schema.max) {
                errors.push(new ValidationResult(`值不能大于 ${schema.max}`, node));
            }
            if (schema.type === 'integer' && !Number.isInteger(node.value)) {
                errors.push(new ValidationResult(`值必须为整数`, node));
            }
        }
        else if (valueType === 'string') {
            if (schema.pattern && !node.value.match(schema.pattern)) {
                errors.push(new ValidationResult(`值必须满足正则表达式 \`${schema.pattern}\``, node));
            }
        }
        if (schema.enum) {
            let values = schema.enum instanceof Array ? schema.enum : Object.keys(schema.enum);
            if (values.indexOf(node.value) < 0) {
                errors.push(new ValidationResult(`值必须为枚举 ${values.map(v => JSON.stringify(v)).join(', ')}`, node));
            }
        }
    } while (false);

    if (errors.length > 0 && schema.errorMessage) {
        errors = [new ValidationResult(schema.errorMessage, node)];
    }

    return errors;
}
