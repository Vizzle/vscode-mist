import { Schema, ValidationResult, SchemaFormat, validateJsonNode, ISchema, parseSchema, SchemaObject } from "./schema";
import * as json from 'jsonc-parser';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { xhr, XHRResponse, getErrorStatusDescription } from 'request-light';

type PropertyMap = {
    [name: string]: Schema;
};

type MistCustomConfig = {
    types: {
        [type: string]: string;
    };
    properties: {
        [type: string]: {
            [name: string]: Schema;
        }
    };
    styleProperties: {
        [type: string]: {
            [name: string]: Schema;
        }
    };
    actions: {
        [name: string]: Schema;
    };
}

const colors = ["black", "darkgray", "lightgray", "white", "gray", "red", "green", "blue", "cyan", "yellow", "magenta", "orange", "purple", "brown", "transparent"];

const colorSchema: Schema = {
    oneOf: [
        {
            type: 'string',
            enum: colors,
            // errorMessage: `只支持以下颜色常量：${colors.map(c => `\`${c}\``).join(', ')}`
        },
        {
            type: 'string',
            pattern: '^#[0-9A-Fa-f]{3,4}$|^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$',
            // errorMessage: '颜色格式错误，支持的颜色格式如下：`#rgb`, `#rrggbb`, `#argb`, `#aarrggbb`'
        }
    ],
    errorMessage: '颜色格式错误'
}

SchemaFormat.registerFormat('color', {
    validateJsonNode(node: json.Node, offset: number, matchingSchemas: Schema[]): ValidationResult[] {
        return validateJsonNode(node, colorSchema, offset, matchingSchemas);
    }
});

SchemaFormat.registerFormat('event', {
    validateJsonNode(node: json.Node, offset: number, matchingSchemas: Schema[]): ValidationResult[] {
        let eventSchema = NodeSchema.getEventSchema()
        eventSchema = {
            oneOf: [
                eventSchema, 
                { type: 'array', items: eventSchema }
            ]
        }
        return validateJsonNode(node, eventSchema, offset, matchingSchemas);
    }
});

export class NodeSchema implements ISchema {
    private static nodeSchemaCache: { [type: string]: SchemaObject } = {};
    private static config: MistCustomConfig;
    private static configs: { [dir: string]: MistCustomConfig } = {};
    private static currentDir: string;
    private static nodeTypes = {
        "node": "基本元素\n\n[查看文档](https://vizzle.github.io/MIST/components/node.html)",
        "stack": "flex 容器元素\n\n[查看文档](https://vizzle.github.io/MIST/components/stack.html)",
        "text": "文本元素，用于显示文本，支持富文本\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html)",
        "image": `图片元素，可展示本地图片和网络图片。网络图片自动缓存。
    展示本地图片时，使用 image 属性，如 "image": "O2O.bundle/arrow"。
    展示网络图片时，使用 image-url 指定网络图片，image 指定加载中显示的图片，error-image 指定下载失败时显示的图片。

[查看文档](https://vizzle.github.io/MIST/components/image.html)`,
        "button": "按钮元素，可以设置按下时的文字颜色等\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html)",
        "scroll": `滚动容器元素，使用 children 定义子元素。
注意：scroll 元素的尺寸不会根据它的子元素自适应。

[查看文档](https://vizzle.github.io/MIST/components/scroll.html)`,
        "paging": "分页元素，使用 children 定义子元素，每个子元素就是一页\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html)",
        "line": "线条元素，主要用于展示虚线，其粗细、长度由布局属性控制\n\n[查看文档](https://vizzle.github.io/MIST/components/line.html)",
        "linear-gradient": "线性渐变。如果作为背景可以配合 `fixed` 属性使用",
        "indicator": "加载指示器，俗称菊花\n\n[查看文档](https://vizzle.github.io/MIST/components/indicator.html)",
        "text-field": "单行文本输入框",
        "text-view": "多行文本输入框",
        "switch": "开关组件",
        "segmented-control": "分段显示组件",
        "picker": "选择组件",
        "web-view": "网页组件",
        "map": "地图组件",
        "slot": "组件插槽",
    };
    public static async setCurrentDir(dir: string) {
        if (this.currentDir !== dir) {
            this.currentDir = dir;
            let config = this.configs[dir];
            this.setConfig(config);
            if (!config) {
                let config = await this.readConfigInDir(dir)
                this.configs[dir] = config;
                this.setConfig(config);
            }
        }
    }
    private static setConfig(config: MistCustomConfig) {
        this.config = config;
        this.nodeSchemaCache = {};
    }
    private static async readConfigInDir(dir: string): Promise<MistCustomConfig> {
        let configPath = dir + '/mist-extension.json';
        return this.readUri(configPath).catch(error => '{}').then(content => {
            return this.readConfig(JSON.parse(content), dir);
        });
    }
    private static readUri(uri: string): Promise<string> {
        if (uri.startsWith('http')) {
            let headers = { 'Accept-Encoding': 'gzip, deflate' };
            return xhr({ url: uri, followRedirects: 5, headers }).then(response => {
                return response.responseText;
            }, (error: XHRResponse) => {
                return Promise.reject(error.responseText || getErrorStatusDescription(error.status) || error.toString());
            });
        }
        else {
            if (uri.startsWith('file://')) {
                uri = vscode.Uri.parse(uri).fsPath;
            }
            return new Promise((resolve, reject) => {
                fs.exists(uri, exists => {
                    if (exists) {
                        fs.readFile(uri, (err, data) => {
                            if (!err) {
                                resolve(data.toString());
                            }
                            else {
                                return reject(err);
                            }
                        });
                    }
                    else {
                        return reject('`' + uri + '` file dose not exist.');
                    }
                });
            });
        }
    }
    private static readConfig(data: any, dir: string): Promise<MistCustomConfig> {
        if (data.extends) {
            let uri: string = data.extends;
            delete data.extends;
            if (!uri.startsWith('file://') && !uri.startsWith('http') && !path.isAbsolute(uri)) {
                uri = path.join(dir, uri);
            }
            return this.readUri(uri).catch(error => '{}').then(content => {
                let extendsData = JSON.parse(content);
                return Promise.all([this.readConfig(extendsData, path.dirname(uri)), this.readConfig(data, dir)]).then(r => {
                    let [extendsConfig, config] = r;
                    config.types = { ...extendsConfig.types, ...config.types };
                    config.actions = { ...extendsConfig.actions, ...config.actions };
                    config.properties = { ...extendsConfig.properties, ...config.properties };
                    config.styleProperties = { ...extendsConfig.styleProperties, ...config.styleProperties };
                    return config;
                });
            });
        }
        let definitions = data.definitions;
        definitions = parseSchema(definitions, definitions);
        
        let readPropertiesMap = map => {
            if (!map) return {};
            Object.keys(map).forEach(p => {
                map[p] = parseSchema(map[p], definitions);
            });
            return map;
        }
        let readTypesPropertiesMap = map => {
            if (!map) return {};
            Object.keys(map).forEach(type => {
                readPropertiesMap(map[type]);
            });
            return map;
        }
        
        let types = data['custom-types'] || {};
        let properties = readTypesPropertiesMap(data['custom-properties']);
        let styleProperties = readTypesPropertiesMap(data['custom-style-properties']);
        let actions = readPropertiesMap(data['custom-actions']);

        return Promise.resolve({
            types,
            properties,
            styleProperties,
            actions
        });
    }
    private static getConfig() {
        return this.config || {
            properties: {},
            styleProperties: {},
            actions: {},
            types: {}
        };
    }
    public static getEventSchema(): Schema {
        let config = this.getConfig();
        return {
            type: "object",
            additionalProperties: true,
            properties: {
                "openUrl:": SimpleSchema("string", "打开指定的 URL"),
                "updateState:": SimpleSchema("object", "更新状态。值应该为一个字典，将状态中对应的值更新。注意不是替换整个状态，只是更改对应的 key"),
                "alert:": {
                    oneOf: [
                        SimpleSchema("string", "Alert 内容"),
                        {
                            type: "object",
                            required: ["message"],
                            properties: {
                                "title": SimpleSchema("string"),
                                "message": SimpleSchema("object"),
                            },
                            
                        }
                    ],
                    snippet: '"$0"',
                    description: "显示 Alert，主要用于调试"
                },
                "runAction:": {
                    oneOf: [
                        {
                            type: "string"
                        },
                        {
                            type: "object",
                            required: ["name"],
                            properties: {
                                "name": SimpleSchema("string", "Action 名称"),
                                "params": SimpleSchema("object", "触发 Action 时传入的参数"),
                            }
                        }
                    ],
                    description: "触发自定义 Action"
                },
                "postNotification:": {
                    oneOf: [
                        {
                            type: "string"
                        },
                        {
                            type: "object",
                            required: ["name"],
                            properties: {
                                "name": SimpleSchema("string", "Notification 名称"),
                                "userInfo": SimpleSchema("object", "Notification 的 userInfo"),
                            }
                        }
                    ],
                    description: "发送 Notification"
                },
                ...config.actions || {},
            }
        };
    }
    public static getTypes(): { [name: string]: string } {
        let config = NodeSchema.getConfig();
        return { ...this.nodeTypes, ...config.types };
    }
    public getSchema(node: json.Node): Schema {
        if (node && node.type === 'object') {
            let typeNode = json.findNodeAtLocation(node, ['type']);
            let isImport = !!json.findNodeAtLocation(node, ['import']);
            let isComponentChildren = node.parent && node.parent.parent && node.parent.parent.parent && json.findNodeAtLocation(node.parent.parent.parent, ['import'])
            let slotProperties: SchemaObject['properties'] = isComponentChildren ? {
                "slot": {
                    type: "string",
                    description: "要插入的组件插槽。不设置 `slot` 则插入到默认插槽",
                    errorMessage: "`slot` 只能在 `import` 的 `children` 中使用"
                }
            } : {}
            if (isImport) {
                return {
                    type: "object",
                    properties: {
                        ...importSchemaProperties,
                        ...slotProperties,
                    },
                    description: "引用组件"
                }
            }

            let type = typeNode ? json.getNodeValue(typeNode) : json.findNodeAtLocation(node, ['children']) ? 'stack' : '';

            if (type === 'slot' && !isComponentChildren) {
                return {
                    type: "object",
                    properties: {
                        "type": {
                            oneOf: [
                                EnumSchema(NodeSchema.getTypes()),
                                SimpleSchema('string')
                            ],
                            description: "元素类型\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#type)"
                        },
                        "name": {
                            type: "string",
                            description: "插槽名称。不写 `name` 则为默认插槽"
                        },
                        "children": { ...childrenSchema, description: "插槽的默认值。未传入该插槽时，使用此默认值" },
                    }
                }
            }

            let schema = NodeSchema.nodeSchemaCache[type];
            let isCustomType = !(type in NodeSchema.getTypes());
            let config = NodeSchema.getConfig();
            if (!schema) {
                let s = {
                    type: 'object',
                    additionalProperties: isCustomType,
                    patternProperties: {
                        '^on-.+$': isCustomType ? EventSchema() : false,
                    },
                    properties: {
                        ...propertiesMap.common || {},
                        ...propertiesMap[type] || {},
                        style: {
                            type: 'object',
                            additionalProperties: isCustomType,
                            properties: {
                                ...stylesMap.common || {},
                                ...stylesMap[type] || {},
                                ...config.styleProperties['common'] || {},
                                ...config.styleProperties[type] || {}
                            },
                            description: "元素的样式和布局属性\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#style)"
                        },
                        ...config.properties['common'] || {},
                        ...config.properties[type] || {},
                        "type": {
                            oneOf: [
                                EnumSchema(NodeSchema.getTypes()),
                                SimpleSchema('string')
                            ],
                            description: "元素类型\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#type)"
                        },
                        ...(typeNode ? {} : { "children": childrenSchema }),
                        "import": importSchemaProperties['import'],
                    },
                    description: "布局元素"
                };
                let events = Object.keys(s.properties).filter(k => k.startsWith('on-'));
                events.forEach(e => {
                    let schema = s.properties[e];
                    s.properties[e + '-once'] = { ...schema };
                    if (schema.description) {
                        s.properties[e + '-once'].description = `\`-once\` 事件，只在第一次触发该事件时响应，通过元素的索引（\`gone\` 为 \`true\` 的元素也有索引）来区分

${schema.description}`;
                    }
                });
                NodeSchema.nodeSchemaCache[type] = s;
                schema = s;
            }
            if (isComponentChildren) {
                schema = {
                    ...schema,
                    properties: { ...schema.properties, ...slotProperties },
                }
            }
            return schema;
        }
        return null;
    }
    validateJsonNode(node: json.Node, offset: number, matchingSchemas: Schema[]): ValidationResult[] {
        return validateJsonNode(node, this.getSchema(node), offset, matchingSchemas);
    }
}
SchemaFormat.registerFormat('node', new NodeSchema());

const VariablesTableSchema: Schema = {
    type: "object",
    patternProperties: {
        "^[a-zA-Z_][a-zA-Z0-9_]*$": {
            additionalProperties: true
        }
    }
};

function SimpleSchema(type: string, description?: string): Schema {
    return { type, description, additionalProperties: true };
}

function EnumSchema(enums: string[] | { [name: string]: string }, description?: string): Schema {
    let schema: Schema = {
        type: "string",
        description
    };
    if (enums instanceof Array) {
        schema.enum = enums;
    }
    else {
        let keys = Object.keys(enums);
        schema.enum = keys;
        schema.enumDescriptions = keys.map(k => enums[k]);
    }
    return schema;
}

function ObjectSchema(properties: { [name: string]: Schema }, description?: string): Schema {
    return {
        type: "object",
        properties,
        description
    };
}

function ColorSchema(description?: string): Schema {
    return {
        type: "string",
        format: "color",
        description
    };
}

function PointSchema(description?: string): Schema {
    return {
        type: "array",
        items: {
            type: "number"
        },
        description
    }
}

const units = ['px', 'cm', 'mm', 'q', 'in', 'pc', 'pt'];
function LengthSchema(percentage: boolean, enums: string[], description?: string): Schema {
    return {
        oneOf: [
            { type: "number" },
            { type: "string", pattern: `^-?\\d+(\\.\\d+)?(${units.join('|')}${percentage ? '|%' : ''})?$` },
            ...(enums && enums.length > 0 ? [{ type: "string", enum: enums }] : [])
        ],
        description,
        errorMessage: `只能为${enums && enums.length > 0 ? ` ${enums.map(e => `\`${e}\``).join(', ')} 或` : ''}数字（可以带单位${percentage ? '或百分比' : ''}，支持的单位有 ${units.map(u => `\`${u}\``).join(', ')}）`
    };
}

function EventSchema(description?: string): Schema {
    return {
        type: 'object',
        format: 'event',
        description,
    };
}

const childrenSchema: SchemaObject = {
    type: "array",
    items: {
        type: "object",
        format: "node"
    },
    snippet: `[
  {
    $0
  }
]`,
    description: "容器的子元素"
};

const importSchemaProperties: SchemaObject['properties'] = {
    "import": {
        type: "string",
        description: "引用组件。通过组件路径引用，可省略 `.mist` 后缀"
    },
    "params": {
        type: "object",
        patternProperties: {
            "^[a-zA-Z_][a-zA-Z0-9_]*$": true
        }
    },
    "children": childrenSchema
}

const propertiesMap: { [type: string]: PropertyMap} = {
    common: {
        "tag": {
            type: "integer",
            description: "元素的 tag，用于在 native 查找该 view。必须是整数"
        },
        "identifier": {
            type: "string",
            description: "元素的 identifier，影响元素的重用"
        },
        "gone": {
            type: "boolean",
            description: "为 `true` 时，元素不显示，且不加入布局\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#gone)"
        },
        "repeat": {
            oneOf: [
                {
                    type: "integer",
                    min: 0
                },
                {
                    type: "array"
                }
            ],
            description: "模版衍生机制。`repeat` 为元素重复的次数或重复的数组。注意：根节点元素使用 `repeat` 无效\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#repeat)",
            errorMessage: "`repeat` 只能为整数或数组"
        },
        "vars": {
            oneOf: [
                VariablesTableSchema,
                {
                    type: "array",
                    items: VariablesTableSchema
                }
            ],
            snippet: "{\n  $0\n}",
            description: "定义变量（宏）\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#vars)"
        },
        "class": {
            type: "string",
            description: "引用在 `styles` 中定义的样式。可以引用多个样式，用空格分开，靠后的样式覆盖前面的样式\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#class)"
        },
        "on-tap": EventSchema("元素被点击时触发\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#on-tap)"),
        "on-long-press": EventSchema("元素被长按时触发"),
        "on-display": EventSchema("元素显示时触发。在列表中滑出可见区域再滑回来会重新触发\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#on-display)"),
        "on-create": EventSchema("元素被创建时触发，此时还没显示\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#on-create)"),
        // "on-update-appear": EventSchema("更新状态后，元素出现时（隐藏→更新状态→显示）"),
        // "on-update-disappear": EventSchema("更新状态后，元素消失时（显示→更新状态→隐藏）"),
        // "on-update-reuse": EventSchema("更新状态后，元素复用时（显示→更新状态→显示）"),
    },
    node: {
        
    },
    stack: {
        "children": childrenSchema,
    },
    image: {
        "on-complete": EventSchema("图片下载完成时触发\n\n[查看文档](https://vizzle.github.io/MIST/components/image.html#on-complete)"),
    },
    text: {
        "on-link": EventSchema("文本中的链接被点击时触发，可以使用 `_event_.link` 获取点击的链接。\n（链接通过在 `html-text` 属性中使用 `<a>` 标签插入）"),
    },
    scroll: {
        "children": childrenSchema,
    },
    paging: {
        "on-switch": EventSchema("（手动或自动）翻页时触发\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html#on-switch)"),
        "children": childrenSchema,
    },
    "text-field": {
        "on-focus": EventSchema("获取焦点时触发"),
        "on-blur": EventSchema("失去焦点时触发"),
        "on-change": EventSchema("文本变化时触发"),
        "on-submit": EventSchema("点击返回键时触发"),
    },
    "text-view": {
        "on-focus": EventSchema("获取焦点时触发"),
        "on-blur": EventSchema("失去焦点时触发"),
        "on-change": EventSchema("文本改变时触发"),
        "on-submit": EventSchema("点击返回键时触发"),
        "on-scroll": EventSchema("滑动时触发"),
    },
    switch: {
        "on-change": EventSchema("状态改变时触发"),
    },
    "segmented-control": {
        "on-change": EventSchema("选中项目改变时触发"),
    },
    picker: {
        "on-change": EventSchema("选中项目改变时触发"),
    },
    "web-view": {
        "on-loading-start": EventSchema("加载开始"),
        "on-loading-finish": EventSchema("加载完成"),
        "on-loading-error": EventSchema("加载错误"),
    },
    map: {
        "on-annotation-focus": EventSchema("地图标注选中"),
        "on-annotation-blur": EventSchema("地图标注取消选中"),
        "on-annotation-drag-state-change": EventSchema("地图标注拖动状态发生变化"),
    }
};

const viewProperties = {
    'backgroundColor': 'background-color',
    'alpha': 'alpha',
    'clipsToBounds': 'clip',

    'layer.backgroundColor': 'background-color',
    'layer.borderColor': 'border-color',
    'layer.borderWidth': 'border-width',
    'layer.cornerRadius': 'corner-radius',
    'layer.opacity': 'alpha',
    'layer.masksToBounds': 'clip',
}

const textCommon: PropertyMap = {
    "text": SimpleSchema("string", "显示的文字"),
    "color": ColorSchema("文字颜色。默认为黑色"),
    "font-size": { type: "number", min: 0, description: "字体大小。" },
    "font-name": SimpleSchema("string", "字体名。默认为系统字体"),
    "font-style": EnumSchema(["ultra-light", "thin", "light", "normal", "medium", "bold", "heavy", "black", "italic", "bold-italic"], "字体样式"),
    "alignment": EnumSchema({
        "left": "文字靠左边显示",
        "center": "文字居中显示",
        "right": "文字靠右边显示",
        "justify": "文字两端对齐。只对多行文字有效，且最后一行文字仍然靠左显示"
    }, "文字水平对齐方式。默认为 `left`"),
}

const textViewCommon: PropertyMap = {
    ...textCommon,
    "auto-focus": SimpleSchema("boolean", "自动获取焦点，默认为 `false`"),
    "editable": SimpleSchema("boolean", "是否可编辑，默认为 `false`"),
    "max-length": {
        type: "number",
        min: 0,
        description: "最大输入长度，默认为 `-1`，不限制输入长度"
    },
    "placeholder": SimpleSchema("string", "没有输入文本时的提示文字"),
    "placeholder-color": ColorSchema("提示文字的颜色"),
    "keyboard-type": EnumSchema({
        "default": "Default type for the current input method.",
        "ascii-capable": "Displays a keyboard which can enter ASCII characters",
        "number-punctuation": "Numbers and assorted punctuation.",
        "url": "A type optimized for URL entry (shows . / .com prominently).",
        "number": "A number pad with locale-appropriate digits (0-9, ۰-۹, ०-९, etc.). Suitable for PIN entry.",
        "phone": "A phone pad (1-9, *, 0, #, with letters under the numbers).",
        "name-phone": "A type optimized for entering a person's name or phone number.",
        "email": "A type optimized for multiple email address entry (shows space @ . prominently).",
        "decimal": "A number pad with a decimal point.",
        "twitter": "A type optimized for twitter text entry (easy access to @ #)",
        "web": "A default keyboard type with URL-oriented addition (shows space . prominently).",
    }, "键盘类型，默认为 `default`"),
    "keyboard-appearance": EnumSchema(["default", "dark", "light"], "键盘外观，默认为 `default`"),
    "return-key-type": EnumSchema([
        "default",
        "go",
        "google",
        "join",
        "next",
        "route",
        "search",
        "send",
        "yahoo",
        "done",
        "emergency-call"
    ], "返回按键文本，默认为 `default`"),
    "blur-on-submit": SimpleSchema("boolean", "点击返回按键是否失去焦点，默认为 `true`"),
}

const stylesMap: { [type: string]: PropertyMap} = {
    common: {
        "background-color": ColorSchema("背景颜色，默认为透明\n\n[查看文档](https://vizzle.github.io/MIST/basics/Style.html#background-color)"),
        "alpha": {
            "type": "number",
            "min": 0,
            "max": 1,
            "description": "元素的透明度，默认为 `1`\n\n[查看文档](https://vizzle.github.io/MIST/basics/Style.html#alpha)"
        },
        "border-width": {
            oneOf: [
                SimpleSchema("number"),
                EnumSchema(['1px']),
            ],
            description: "边框宽度，默认为 `0`。可以用 \"1px\"表示 `1` 像素的边框\n\n[查看文档](https://vizzle.github.io/MIST/basics/Style.html#border-width)"
        },
        "border-color": ColorSchema("边框颜色，默认为黑色\n\n[查看文档](https://vizzle.github.io/MIST/basics/Style.html#border-color)"),
        "corner-radius": SimpleSchema("number", `圆角半径，默认为 0。
可以使用 \`corner-radius-top-left\`, \`corner-radius-top-right\`, \`corner-radius-bottom-left\`, \`corner-radius-bottom-right\` 分别指定每个角的圆角半径

[查看文档](https://vizzle.github.io/MIST/basics/Style.html#corner-radius)`),
        "corner-radius-top-left": SimpleSchema("number", "左上角圆角半径\n\n[查看文档](https://vizzle.github.io/MIST/basics/Style.html#corner-radius)"),
        "corner-radius-top-right": SimpleSchema("number", "右上角圆角半径\n\n[查看文档](https://vizzle.github.io/MIST/basics/Style.html#corner-radius)"),
        "corner-radius-bottom-left": SimpleSchema("number", "左下角圆角半径\n\n[查看文档](https://vizzle.github.io/MIST/basics/Style.html#corner-radius)"),
        "corner-radius-bottom-right": SimpleSchema("number", "右下角圆角半径\n\n[查看文档](https://vizzle.github.io/MIST/basics/Style.html#corner-radius)"),
        "user-interaction-enabled": SimpleSchema("boolean", "设置生成的 view 的userInteractionEnabled。默认不设置\n\n[查看文档](https://vizzle.github.io/MIST/basics/Style.html#user-interaction-enabled)"),
        "clip": SimpleSchema("boolean", "设置生成的 view 的 clipsToBounds\n\n[查看文档](https://vizzle.github.io/MIST/basics/Style.html#clip)"),
        "is-accessibility-element": SimpleSchema("boolean", "是否为无障碍元素，如果为 true，则该元素与其子元素一起朗读，子元素不能再单独设置为无障碍元素"),
        "accessibility-label": SimpleSchema("string", "无障碍模式下朗读的文本"),
        "properties": {
            type: "object",
            additionalProperties: true,
            properties: Object.keys(viewProperties).reduce((p, c) => ({
                ...p,
                [c]: {
                    deprecatedMessage: `请使用 \`style\` 中的属性 \`${viewProperties[c]}\``
                }
            }), {}),
            description: `通过反射给 view 设置属性，如：
"properties": {
    "layer.shadowOpacity": 1
}

[查看文档](https://vizzle.github.io/MIST/basics/Style.html#properties)`
        },
        "width": LengthSchema(true, ["auto"], "元素的宽度，默认值为 `auto`\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#widthheight)"),
        "height": LengthSchema(true, ["auto"], "元素的高度，默认值为 `auto`\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#widthheight)"),
        "min-width": LengthSchema(true, [], "元素的最小宽度\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#min-widthmin-heightmax-widthmax-height)"),
        "min-height": LengthSchema(true, [], "元素的最小高度\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#min-widthmin-heightmax-widthmax-height)"),
        "max-width": LengthSchema(true, [], "元素的最大宽度\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#min-widthmin-heightmax-widthmax-height)"),
        "max-height": LengthSchema(true, [], "元素的最大高度\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#min-widthmin-heightmax-widthmax-height)"),
        "margin": LengthSchema(true, ["auto"], "元素的外边距，默认值为 `0`\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#margin)"),
        "margin-left": LengthSchema(true, ["auto"], "元素距左边的外边距\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#margin)"),
        "margin-right": LengthSchema(true, ["auto"], "元素距右边的外边距\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#margin)"),
        "margin-top": LengthSchema(true, ["auto"], "元素距上边的外边距\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#margin)"),
        "margin-bottom": LengthSchema(true, ["auto"], "元素距下边的外边距\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#margin)"),
        "padding": LengthSchema(true, [], "元素的内边距，默认值为 `0`\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#padding)"),
        "padding-left": LengthSchema(true, [], "元素距左边的内边距\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#padding)"),
        "padding-right": LengthSchema(true, [], "元素距右边的内边距\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#padding)"),
        "padding-top": LengthSchema(true, [], "元素距上边的内边距\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#padding)"),
        "padding-bottom": LengthSchema(true, [], "元素距下边的内边距\n\n[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#padding)"),
        "direction": EnumSchema({
            "horizontal": "从左到右排列",
            "vertical": "从上到下排列",
            "horizontal-reverse": "从右到左排列",
            "vertical-reverse": "从下到上排列"
        }, `决定子元素的排列方向，默认为 \`horizontal\`

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#direction)`),
        "wrap": {
            oneOf: [
                {
                    type: "boolean",
                    deprecatedMessage: "请使用枚举 `nowrap`, `wrap`, `wrap-reverse`"
                },
                EnumSchema({
                    "nowrap": "子元素超出容器时，所有子元素按照 \`flex-shrink\` 缩小",
                    "wrap": "子元素超出容器时将换行",
                    "wrap-reverse": "子元素超出容器时将换行，方向与 \`wrap\` 相反"
                }, `子元素是否允许换行

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#wrap)`)
            ]
        },
        "align-items": EnumSchema({
            "start": "元素位于容器的开头",
            "center": "元素位于容器的中心",
            "end": "元素位于容器的结尾",
            "stretch": "默认值。元素拉伸以填满容器",
            "baseline": "根据元素的基线位置对齐。文本的基线为第一行文字的基线，容器的基线为其第一个元素的基线。",
        }, `子元素在当前行的排列方向的垂直方向上的对齐方式

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#align-items)`),
        "justify-content": EnumSchema({
            "start": "默认值。元素位于容器的开头",
            "end": "元素位于容器的结尾",
            "center": "元素位于容器的中心",
            "space-between": "所有子元素均匀分布在行内，空白平均分布在每两个元素中间，首尾元素对齐到容器两端",
            "space-around": "所有子元素均匀分布在行内，空白平均分布在所有元素两侧",
        }, `子元素在布局方向上的对齐方式

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#justify-content)`),
        "align-content": EnumSchema({
            "start": "行位于容器的开头",
            "end": "行位于容器的结尾",
            "center": "行位于容器的中心",
            "stretch": "默认值。行拉伸以填满容器",
            "space-between": "所有行均匀分布在容器内，空白平均分布在每两行中间，首尾行对齐到容器两端",
            "space-around": "所有行均匀分布在容器内，空白平均分布在所有行两侧",
        }, `容器内各行的对齐方式

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#align-content)`),
        "align-self": EnumSchema({
            "start": "元素位于容器的开头",
            "center": "元素位于容器的中心",
            "end": "元素位于容器的结尾",
            "stretch": "默认值。元素拉伸以填满容器",
            "baseline": "根据元素的基线位置对齐。文本的基线为第一行文字的基线，容器的基线为其第一个元素的基线。",
        }, `覆写父元素的 \`align-items\`，指定元素在父元素中（沿父元素布局方向）的对齐方式，取值同 \`align-items\`

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#align-self)`),
        "flex-grow": {
            type: "number",
            min: 0,
            description: `元素放大的权值，默认值为 0（即元素不会被放大）。不能为负数。

当容器的空间（在布局方向上）有剩余时，所有子元素（在布局方向上）的尺寸会放大以填满剩余空间，\`flex-grow\` 决定元素放大的权值。注意是把容器剩余空间分配给元素，而不是所有空间。

当所有子元素的 \`flex-grow\` 总和小于 1 时，总权值按 1 计算，即剩余空间不会被填满。

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#flex-grow)`
        },
        "flex-shrink": {
            type: "number",
            min: 0,
            description: `元素缩小的权值，默认值为 \`1\`。不能为负数。

当容器的空间不足以放下所有子元素时，所有子元素的大小会缩小以填满剩余空间。
元素的初始尺寸（通过 \`width\`, \`height\`, \`flex-basis\` 设置）也会计入权值，即实际权值为 \`flex-shrink\` * \`初始尺寸\` 。

默认值为 \`1\`，也就是说，当空间不足时，所有元素等比缩小。

像图标、头像之类的元素，一般是不允许缩小的，这时记得将 \`flex-shrink\` 设置为 \`0\` 。

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#flex-shrink)`
        },
        "flex-basis": LengthSchema(true, ["auto", "content"], `在布局方向上的初始尺寸，相当于 \`width\` 或 \`height\`（取决于容器的 \`direction\`）。容器计算剩余空间时，使用子元素的基准尺寸来计算已分配空间。默认值为 \`auto\`

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#flex-basis)`),
        "spacing": LengthSchema(true, [], `子元素间的间距。为每两个子元素之间添加间距，每行的第一个元素之前和最后一个元素之后不会添加。

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#spacing)`),
        "line-spacing": LengthSchema(true, [], `多行布局的行间距。为每两行之间添加间距，跟 \`spacing\` 相似

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#line-spacing)`),
        "fixed": SimpleSchema("boolean", `是否为固定布局元素，固定元素不参与弹性布局，也不会对父容器的布局有任何影响，而是直接相对于父元素布局（等其它弹性元素布局完成之后再布局）。\`fixed\` 元素通过 \`width\`, \`height\`, \`margin\` 属性来确定元素的位置与大小。

适合用于浮层、角标等元素。默认情况下（不设置 \`width\`, \`height\`, \`margin\`），一个 \`fixed\` 元素就是和父容器等大的一个浮层，也可以放置于容器底部作为背景。

\`fixed\` 元素并不是一定处于其它元素的最上方，而是同其它元素一样，按照其在父容器里的顺序排列。

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#fixed)`),
        "lines": {
            type: "integer",
            min: 0,
            description: `仅对多行容器有效（即 \`wrap\` 不为 \`nowrap\`），限制最大行数。默认为 \`0\`，即不限制行数。可以用来隐藏放不下的元素

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#lines)`
        },
        "items-per-line": {
            type: "integer",
            min: 0,
            description: `仅对多行容器有效（即 \`wrap\` 不为 \`nowrap\`），限制每行最大元素个数。默认为 \`0\`，即不限制

[查看文档](https://vizzle.github.io/MIST/basics/Layout.html#items-per-line)`
        },
    },
    stack: {
        "highlight-background-color": ColorSchema("按下时的高亮颜色\n\n[查看文档](https://vizzle.github.io/MIST/components/stack.html#highlight-background-color)"),
    },
    text: {
        "text": SimpleSchema("string", "显示的文字\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#text)"),
        "html-text": SimpleSchema("string", "使用 HTML 表示的富文本，指定这个属性后，\`text\` 属性将被忽略\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#html-text)"),
        "color": ColorSchema("文字颜色。默认为黑色\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#color)"),
        "font-size": { type: "number", min: 0, description: "字体大小。\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#font-size)" },
        "font-name": SimpleSchema("string", "字体名。默认为系统字体\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#font-name)"),
        "font-style": EnumSchema(["ultra-light", "thin", "light", "normal", "medium", "bold", "heavy", "black", "italic", "bold-italic"], "字体样式\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#font-style)"),
        "alignment": EnumSchema({
            "left": "文字靠左边显示",
            "center": "文字居中显示",
            "right": "文字靠右边显示",
            "justify": "文字两端对齐。只对多行文字有效，且最后一行文字仍然靠左显示"
        }, "文字水平对齐方式。默认为 `left`\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#alignment)"),
        "vertical-alignment": EnumSchema({
            "top": "文字靠上边显示",
            "center": "文字居中显示",
            "bottom": "文字靠下边显示",
        }, "文字竖直对齐方式。默认为 `center`\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#vertical-alignment)"),
        "line-break-mode": EnumSchema({
            "word": "按单词换行，尽量保证不从单词中间换行",
            "char": "按字符换行"
        }, "文字换行方式。默认为 `word`\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#line-break-mode)"),
        "truncation-mode": EnumSchema({
            "truncating-head": "文字显示不下时头部显示省略号。多行时省略号在最后一行",
            "truncating-middle": "文字显示不下时中间显示省略号。多行时省略号在最后一行",
            "truncating-tail": "文字显示不下时尾部显示省略号。多行时省略号在最后一行",
            "clip": "文字显示不下时不显示省略号。末尾直接裁剪，可能出现半个字",
            "none": "文字显示不下时不显示省略号。显示不下的文字不显示，不会出现半个字"
        }, "文字省略方式。默认为 `truncating-tail`\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#truncation-mode)"),
        "lines": {
            type: "integer",
            min: 0,
            description: "最大行数。为 0 时，不限制行数。默认为 `1`\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#lines)"
        },
        "kern": SimpleSchema("number", "字间距。需要注意文字的最右边也会有一个字距大小的空白，一般可以通过设置 `margin-right` 来修正。如：  \n```\n\"kern\": 5,\n\"margin-right\": -5\n```\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#kern)"),
        "line-spacing": SimpleSchema("number", "行间距\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#line-spacing)"),
        "adjusts-font-size": SimpleSchema("boolean", "是否调整字号以适应控件的宽度，默认为 `false`\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#adjusts-font-size)"),
        "baseline-adjustment": EnumSchema({
            "none": "Adjust text relative to the top-left corner of the bounding box. This is the default adjustment.",
            "baseline": "Adjust text relative to the position of its baseline.",
            "center": "Adjust text based relative to the center of its bounding box.",
        }, "字体自动缩小时相对于缩小前的对齐方式。默认为 `none`"),
        "mini-scale-factor": {
            type: "number",
            min: 0,
            max: 1,
            description: "与 `adjusts-font-size` 配合使用，设置一个字号调整的最小系数，设置为0时，字号会调整至内容能完全展示\n\n[查看文档](https://vizzle.github.io/MIST/components/text.html#mini-scale-factor)"
        },
    },
    button: {
        "title": {
            oneOf: [
                SimpleSchema("string", "按钮标题\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html#title)"),
                ObjectSchema({
                    "normal": SimpleSchema("string", "普通状态的标题"),
                    "highlighted": SimpleSchema("string", "按下状态的标题"),
                    // "disabled": SimpleSchema("string", "禁用状态的标题"),
                    // "selected": SimpleSchema("string", "选择状态的标题"),
                }, "按钮标题\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html#title)")
            ],
            snippet: '"$0"'
        },
        "image": {
            oneOf: [
                SimpleSchema("string", "显示的图片，只能为本地图片，图片固定显示在文字左边。支持状态\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html#image)"),
                ObjectSchema({
                    "normal": SimpleSchema("string", "普通状态的图片"),
                    "highlighted": SimpleSchema("string", "按下状态的图片"),
                    // "disabled": SimpleSchema("string", "禁用状态的图片"),
                    // "selected": SimpleSchema("string", "选择状态的图片"),
                }, "显示的图片，只能为本地图片，图片固定显示在文字左边。支持状态\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html#image)")
            ],
            snippet: '"$0"'
        },
        "background-image": {
            oneOf: [
                SimpleSchema("string", "按钮背景图片，只能为本地图片，也可以设置为颜色。支持状态\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html#background-image)"),
                ObjectSchema({
                    "normal": SimpleSchema("string", "普通状态的背景图片"),
                    "highlighted": SimpleSchema("string", "按下状态的背景图片"),
                    // "disabled": SimpleSchema("string", "禁用状态的背景图片"),
                    // "selected": SimpleSchema("string", "选择状态的背景图片"),
                }, "按钮背景图片，只能为本地图片，也可以设置为颜色。支持状态\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html#background-image)")
            ],
            snippet: '"$0"'
        },
        "title-color": {
            oneOf: [
                SimpleSchema("string", "文字颜色。默认为黑色\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html#title-color)"),
                ObjectSchema({
                    "normal": SimpleSchema("string", "普通状态的文字颜色"),
                    "highlighted": SimpleSchema("string", "按下状态的文字颜色"),
                    // "disabled": SimpleSchema("string", "禁用状态的文字颜色"),
                    // "selected": SimpleSchema("string", "选择状态的文字颜色"),
                }, "文字颜色。默认为黑色\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html#title-color)")
            ],
            snippet: '"$0"'
        },
        "font-size": { type: "number", min: 0, description: "字体大小。\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html#font-size)" },
        "font-name": SimpleSchema("string", "字体名。默认为系统字体\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html#font-name)"),
        "font-style": EnumSchema(["ultra-light", "thin", "light", "normal", "medium", "bold", "heavy", "black", "italic", "bold-italic"], "字体样式\n\n[查看文档](https://vizzle.github.io/MIST/components/button.html#font-style)"),
        "enlarge-size": {
            oneOf: [
                { type: "number" },
                {
                    type: "array",
                    // TODO
                    // minItems: 2,
                    // maxItems: 2,
                    items: { type: "number" }
                }
            ],
            description: `放大按钮的点击区域。如：
"enlarge-size": 5 上下左右各放大 5
"enlarge-size": [5, 10] 左右放大 5，上下放大 10

[查看文档](https://vizzle.github.io/MIST/components/button.html#enlarge-size)`
        }
    },
    image: {
        "image": SimpleSchema("string", "显示的图片名，只能使用本地图片。规则同 `[UIImage imageNamed:]`\n\n[查看文档](https://vizzle.github.io/MIST/components/image.html#image)"),
        "image-url": SimpleSchema("string", "网络图片地址\n\n[查看文档](https://vizzle.github.io/MIST/components/image.html#image-url)"),
        "error-image": SimpleSchema("string", `网络图片下载失败时显示的图片，只能使用本地图片，如果没有指定则显示 \`image\`。
注意：\`image-url\` 为空时，将会使用 \`image\` 而不是 \`error-image\`

[查看文档](https://vizzle.github.io/MIST/components/image.html#error-image)`),
        "content-mode": EnumSchema({
            "center": "图片不缩放，居中显示",
            "scale-to-fill": "图片缩放至元素尺寸，不保留宽高比",
            "scale-aspect-fit": "图片按长边缩放，图片能完全显示，可能填不满元素",
            "scale-aspect-fill": "图片按短边缩放，图片能填满元素，可能显示不完全"
        }, "图片缩放模式\n\n[查看文档](https://vizzle.github.io/MIST/components/image.html#content-mode)"),
        "backing-view": SimpleSchema("string", "显示图片的 view 的类名"),
    },
    scroll: {
        "scroll-direction": EnumSchema({
            "none": "水平方向和竖直方向都不允许滚动",
            "horizontal": "水平方向滚动",
            "vertical": "竖直方向滚动",
            "both": "水平方向和竖直方向都可以滚动"
        }, `滚动方向。默认为 \`horizontal\`。
与 direction 不同，direction 表示子元素实际布局方向，scroll-direction表示该方向上不限制子元素的尺寸

[查看文档](https://vizzle.github.io/MIST/components/scroll.html#scroll-direction)`),
        "scroll-enabled": SimpleSchema("boolean", "是否允许用户拖动\n\n[查看文档](https://vizzle.github.io/MIST/components/scroll.html#scroll-enabled)"),
    },
    paging: {
        "direction": EnumSchema({
            "horizontal": "水平方向滚动",
            "vertical": "竖直方向滚动",
        }, "滚动方向。默认为 `horizontal`。\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html#direction)"),
        "scroll-enabled": SimpleSchema("boolean", "是否允许用户拖动。默认为 `true`\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html#scroll-enabled)"),
        "paging": SimpleSchema("boolean", "是否以分页的方式滚动。默认为 `true`\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html#paging)"),
        "auto-scroll": {
            type: "number",
            min: 0,
            description: "自动滚动的时间间隔，单位为秒，为 0 表示不自动滚动。默认为 `0`\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html#auto-scroll)"
        },
        "animation-duration": {
            type: "number",
            min: 0,
            description: "自动滚动时滚动动画的持续时间，单位为秒，默认为 0.3 秒\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html#animation-duration)"
        },
        "infinite-loop": SimpleSchema("boolean", "是否循环滚动。默认为 `false`\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html#infinite-loop)"),
        "page-control": SimpleSchema("boolean", "是否显示 Page Control。默认为 `false`\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html#page-control)"),
        "page-control-scale": {
            type: "number",
            min: 0,
            description: "Page Control 缩放倍率，用于控制 Page Control 的大小。默认为 `1`\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html#page-control-scale)"
        },
        "page-control-color": ColorSchema("Page Control 圆点的颜色。默认为半透明的白色\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html#page-control-color)"),
        "page-control-selected-color": ColorSchema("Page Control 当前页圆点的颜色。默认为白色\n\n[查看文档](https://vizzle.github.io/MIST/components/paging.html#page-control-selected-color)"),
        "page-control-margin-left": LengthSchema(true, ["auto"], `Page Control 距容器边缘的左边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
默认值为 \`auto\`。

[查看文档](https://vizzle.github.io/MIST/components/paging.html#page-control-margin-left-page-control-margin-right-page-control-margin-top-page-control-margin-bottom)`),
        "page-control-margin-right": LengthSchema(true, ["auto"], `Page Control 距容器边缘的右边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
默认值为 \`auto\`。

[查看文档](https://vizzle.github.io/MIST/components/paging.html#page-control-margin-left-page-control-margin-right-page-control-margin-top-page-control-margin-bottom)`),
        "page-control-margin-top": LengthSchema(true, ["auto"], `Page Control 距容器边缘的上边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
默认值为 \`auto\`。

[查看文档](https://vizzle.github.io/MIST/components/paging.html#page-control-margin-left-page-control-margin-right-page-control-margin-top-page-control-margin-bottom)`),
        "page-control-margin-bottom": LengthSchema(true, ["auto"], `Page Control 距容器边缘的下边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
默认值为 \`auto\`。

[查看文档](https://vizzle.github.io/MIST/components/paging.html#page-control-margin-left-page-control-margin-right-page-control-margin-top-page-control-margin-bottom)`),
    },
    indicator: {
        "color": ColorSchema("菊花的颜色，默认为白色\n\n[查看文档](https://vizzle.github.io/MIST/components/indicator.html#color)"),
    },
    line: {
        "color": ColorSchema("线条的颜色，默认为黑色\n\n[查看文档](https://vizzle.github.io/MIST/components/line.html#color)"),
        "dash-length": {
            type: "number",
            min: 0,
            description: "虚线的线段长度，不设置时为实线\n\n[查看文档](https://vizzle.github.io/MIST/components/line.html#dash-length)"
        },
        "space-length": {
            type: "number",
            min: 0,
            description: "虚线的空白长度，不设置时为实线\n\n[查看文档](https://vizzle.github.io/MIST/components/line.html#space-length)"
        },
    },
    "linear-gradient": {
        "direction": EnumSchema([
            "to-right",
            "to-left",
            "to-top",
            "to-bottom",
            "to-top-left",
            "to-bottom-left",
            "to-top-right",
            "to-bottom-right",
        ], "渐变方向，默认为 `to-right`"),
        "start-point": PointSchema("渐变开始位置，需要与 `end-point` 一起使用。取值范围为 0~1，如：`[0, 0]`"),
        "end-point": PointSchema("渐变结束位置，需要与 `start-point` 一起使用。取值范围为 0~1，如：`[1, 0]`"),
        "colors": {
            type: "array",
            items: ColorSchema(),
            description: "渐变颜色，至少指定两个颜色"
        },
        "factors": {
            type: "array",
            items: SimpleSchema("number"),
            description: "每个颜色的位置，数量需要与 `colors` 相同，取值范围为 0~1。\n\n不设置时渐变位置均分，如 `colors` 设置三个颜色时，`factors` 默认为 `[0, 0.5, 1]`"
        }
    },
    "text-field": {
        ...textViewCommon,
        "password-mode": SimpleSchema("boolean", "密码输入模式"),
        "clear-button-mode": EnumSchema([
            "never",
            "while-editing",
            "unless-editing",
            "always"
        ], "清除按钮模式，默认为 `never`"),
    },
    "text-view": {
        ...textViewCommon,
    },
    switch: {
        "on": SimpleSchema("boolean", "是否为打开状态"),
        "enabled": SimpleSchema("boolean", "是否可用，默认为 `true`"),
        "color": ColorSchema("打开状态的背景颜色，默认为绿色"),
        "thumb-color": ColorSchema("按钮的颜色，默认为白色"),
    },
    "segmented-control": {
        "items": {
            type: "array",
            items: SimpleSchema("string"),
            description: "`segmented-control` 显示的项目列表"
        },
        "selected-index": {
            type: "number",
            min: -1,
            description: "当前选中项目的索引，默认为 `-1`，即不选中任何项目"
        },
        "enabled": SimpleSchema("boolean", "是否可用，默认为 `true`")
    },
    picker: {
        "items": {
            type: "array",
            items: SimpleSchema("string"),
            description: "`picker` 显示的项目列表"
        },
        "selected-index": {
            type: "number",
            min: 0,
            description: "当前选中项目的索引，默认为 `0`"
        },
    },
    "web-view": {
        "source": {
            type: "object",
            properties: {
                "html": SimpleSchema("string", "显示的 html 内容。可通过 `baseUrl` 设置 html 的 base url"),
                "baseUrl": SimpleSchema("string", "html 的 base url"),
                "url": SimpleSchema("string", "显示的 url 链接"),
            },
            description: "`web-view` 显示内容"
        },
        "scales-page-to-fit": SimpleSchema("boolean", "是否自适应缩放并允许用户缩放页面，默认为 `false`"),
    },
    map: {
        "map-type": EnumSchema({
            "standard" : "平面图",
            "satellite" : "卫星图",
            "hybrid" : "平面图与卫星图的混合",
        }, "切换地图类型，默认为 `standard`"),
        "shows-user-location": SimpleSchema("boolean", "展示用户位置，默认为 `false`"),
        "follow-user-location": SimpleSchema("boolean", "跟随用户位置，默认为 `false`"),
        "shows-annotation-callouts": SimpleSchema("boolean", "是否显示地图标记的描述信息，默认为 `false`"),
        "zoom-enabled": SimpleSchema("boolean", "是否允许用户缩放地图，默认为 `true`"),
        "scroll-enabled": SimpleSchema("boolean", "是否允许用户拖动地图，默认为 `true`"),
        "rotate-enabled": SimpleSchema("boolean", "是否允许用户旋转地图，默认为 `true`"),
        "pitch-enabled": SimpleSchema("boolean", "是否允许用户切换到 3D 视角，默认为 `true`"),
        "region": {
            type: "object",
            required: ["latitude", "longitude", "latitude-delta", "longitude-delta"],
            properties: {
                "latitude": SimpleSchema("number", "中心点的纬度"),
                "longitude": SimpleSchema("number", "中心点的经度"),
                "latitude-delta": SimpleSchema("number", "纬度范围"),
                "longitude-delta": SimpleSchema("number", "经度范围"),
            },
            description: "地图显示的经纬度区间"
        },
        "annotations": {
            snippet: `[
  {
    $0
  }
]`,
            type: "array",
            items: {
                type: "object",
                required: ["latitude", "longitude"],
                properties: {
                    "id": SimpleSchema("string"),
                    "latitude": SimpleSchema("number", "纬度"),
                    "longitude": SimpleSchema("number", "经度"),
                    "title": SimpleSchema("string", "标题"),
                    "subtitle": SimpleSchema("string", "副标题"),
                    "image": SimpleSchema("string", "更改显示的图片，默认为一个大头钉📍"),
                    "animate-drop": SimpleSchema("boolean", "大头钉出现时是否有掉落动画，默认为 `false`"),
                    "draggable": SimpleSchema("boolean", "是否可拖动，默认为 `false`"),
                }
            },
            description: "地图上显示标注"
        },
        "overlays": {
            snippet: `[
  {
    $0
  }
]`,
            type: "array",
            items: {
                type: "object",
                required: ["coordinates"],
                properties: {
                    "id": SimpleSchema("string"),
                    "stroke-color": SimpleSchema("string", "线条颜色"),
                    "line-width": SimpleSchema("number", "线条宽度"),
                    "coordinates": {
                        snippet: `[
  {
    $0
  }
]`,
                        type: "array",
                        items: {
                            type: "object",
                            required: ["latitude", "longitude"],
                            properties: {
                                "latitude": SimpleSchema("number", "纬度"),
                                "longitude": SimpleSchema("number", "经度"),
                            }
                        },
                        description: "多边形坐标点，用经纬度表示"
                    },
                }
            },
            description: "地图上绘制多边形区域"
        },
    }
}

export const templateSchema: Schema = parseSchema({
    "definitions": {
        "variables_table": VariablesTableSchema,
        "node": {
            "type": "object",
            "format": "node"
        }
    },
    "type": "object",
    "required": ["layout"],
    "properties": {
        "layout": {
            "$ref": "#/definitions/node",
            "description": "模版的布局描述，类型为元素\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#layout)"
        },
        "params": {
            "description": "组件的入参列表。key 为参数名称，value 为参数的描述信息",
            "type": "object",
            "patternProperties": {
                "^[a-zA-Z_][a-zA-Z0-9_]*$": {
                    "type": "object",
                    "properties": {
                        "type": {
                            "type": "string",
                            "enum": ["string", "number", "boolean", "array", "object"],
                            "description": "参数类型"
                        },
                        "description": {
                            "type": "string",
                            "description": "参数描述"
                        },
                        "default": {
                            "additionalProperties": true,
                            "description": "参数的默认值，使用组件时没有传入该参数时，会使用该默认值"
                        }
                    },
                    "description": "组件入参"
                }
            }
        },
        "controller": {
            "type": "string",
            "description": "模版关联的 controller 类名\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#controller)"
        },
        "state": {
            "$ref": "#/definitions/variables_table",
            "description": "模版的初始状态\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#state)"
        },
        "data": {
            "$ref": "#/definitions/variables_table",
            "description": "值为字典，用于对数据做一些处理或适配，这里的计算结果会追加到数据\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#data)"
        },
        "styles": {
            "type": "object",
            "patternProperties": {
                "^[a-zA-Z_][-a-zA-Z0-9_]*$": {
                    additionalProperties: true
                }
            },
            "description": "样式表，定义一些可以被重复使用的样式，在元素中通过 `class` 属性引用\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#styles)"
        },
        "async-display": {
            "type": "boolean",
            "description": "是否开启异步渲染\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#async-display)"
        },
        "reuse-identifier": {
            "type": "string",
            "description": "模版在 tableview 中的复用 id，默认为模版名"
        },
        "identifier": {
            "type": "string",
            "description": "给模版指定一个 id\n\n[查看文档](https://vizzle.github.io/MIST/basics/Property.html#identifier)"
        },
        "actions": {
            "type": "object",
            "additionalProperties": EventSchema(),
            "description": "自定义 Action"
        },
        "notifications": {
            "type": "object",
            "additionalProperties": EventSchema(),
            "description": "接收 native 通知"
        },
    }
});
