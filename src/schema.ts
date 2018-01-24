import * as json from 'jsonc-parser';

export class ValidationResult {
    constructor(public error: string, public node: json.Node, public isWarning = false) {}
}

export type Schema = {
    definitions?: {
        [name: string] : Schema;
    };
    type?: string;
    format?: string;
    description?: string;
    deprecatedMessage?: string;
    errorMessage?: string;
    properties?: {
        [name: string] : Schema;
    };
    patternProperties?: {
        [name: string] : Schema;
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
    $ref?: string;
} | boolean;

export interface ISchema {
    validateJsonNode(node: json.Node, offset: number, matchingSchemas: Schema[]): ValidationResult[];
}

export class SchemaFormat {
    private static map: {
        [name: string]: ISchema
    } = {};

    public static registerFormat(name: string, format: ISchema​​) {
        this.map[name] = format;
    }

    public static getFormatSchema(name: string) {
        return this.map[name];
    }
}

export function validateJsonNode(node: json.Node, schema: Schema, offset: number = -1, matchingSchemas: Schema[] = []): ValidationResult[] {
    schema = _resolveRefs(schema);
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

function _resolveRefs(schema: Schema): Schema {
    let visitedObjects = [];
    let readPath = (path: string) => {
        return path.split('/').reduce((p, c) => c === '#' ? schema : p ? p[c] : null, null);
    }
    let resolveRef = (s: Schema) => {
        if (s && typeof(s) === 'object' && s.$ref) {
            let $ref = s.$ref;
            delete s.$ref;
            let r: Schema = readPath($ref);
            if (typeof(r) === 'object') {
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
        
        if (node.type === 'property') {
            node = node.children[1];
        }

        if (schema.format) {
            let format = SchemaFormat.getFormatSchema(schema.format);
            if (format) {
                errors.push(...format.validateJsonNode(node, offset, matchingSchemas));
            }
            break;
        }

        if (matchingSchemas) {
            matchingSchemas.splice(0, matchingSchemas.length, schema);
        }

        if (!node) return errors;
        
        let valueType = node.type;
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
            matchingSchemas.splice(0, matchingSchemas.length, ...errorsList.filter(l => l[0] === undefined || l[0] === valueType).reduce((p, c) => [...p, ...c[2]], []));
            break;
        }
        if (schema.type && valueType !== schema.type) {
            if (!(schema.type === 'integer' && valueType === 'number')) {
                errors.push(new ValidationResult(`类型不匹配，需要 \`${schema.type}\` 类型`, node));
                break;
            }
        }
        if (node.type === 'array' && schema.items) {
            node.children.forEach(c => {
                errors.push(..._validateJsonNode(c, schema.items, offset, matchingSchemas));
            });
        }
        else if (node.type === 'object') {
            let properties = schema.properties || {};
            node.children.forEach(p => {
                let [keyNode, valueNode] = p.children;
                let k = p.children[0].value;
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
                            return;
                        }
                        else if (!schema.additionalProperties) {
                            errors.push(new ValidationResult(`无效的属性名称 \`${k}\`，需满足下列正则表达式 ${Object.keys(schema.patternProperties).map(r => `\`${r}\``).join(', ')}`, keyNode));
                            return;
                        }
                    }
                    if (!schema.additionalProperties) {
                        errors.push(new ValidationResult(`不存在属性 \`${k}\``, keyNode));
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
        else if (node.type === 'number') {
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
        else if (node.type === 'string') {
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
