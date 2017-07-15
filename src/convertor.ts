'use strict';

import * as JsonParser from 'jsonc-parser'


let styleProps = ["html-text", "text", "color", "font-size", "mini-scale-factor", "adjusts-font-size", "baseline-adjustment", "font-name", "font-style", "alignment", "vertical-alignment", "line-break-mode", "truncation-mode", "lines", "kern", "line-spacing", "image", "image-url", "error-image", "content-mode", "font-size", "font-name", "font-style", "title", "title-color", "background-image", "image", "enlarge-size", "scroll-direction", "scroll-enabled", "paging", "direction", "scroll-enabled", "paging", "auto-scroll", "infinite-loop", "page-control", "page-control-margin-left", "page-control-margin-right", "page-control-margin-top", "page-control-margin-bottom", "page-control-scale", "page-control-color", "page-control-selected-color", "color", "color", "dash-length", "space-length", "direction", "justify-content", "align-items", "align-content", "spacing", "line-spacing", "clip", "alpha", "user-interaction-enabled", "background-color", "highlight-background-color", "corner-radius", "corner-radius-top-left", "corner-radius-top-right", "corner-radius-bottom-left", "corner-radius-bottom-right", "border-width", "border-color", "contents", "width", "height", "max-width", "max-height", "min-width", "min-height", "margin-left", "margin-right", "margin-top", "margin-bottom", "padding-left", "padding-right", "padding-top", "padding-bottom", "margin", "padding", "flex-grow", "flex-shrink", "flex-basis", "align-self", "fixed", "wrap", "is-accessibility-element", "accessibility-label", "view-properties",
                  "download-scale", "business", "backing-view"];
let oldProps = ["type", "gone", "repeat", "vars", "action", "switched", "display", "completion", "children", "exposure-log", "old-open-page-log"].concat(styleProps);
let types = ["node", "stack", "text", "image", "button", "scroll", "paging", "indicator", "line"];
let expRegex = /.*\$\{.*\}.*/;

let classNameMap = {
    "O2OHtmlHelper": "VZMistHTMLStringParser",
    "O2OTemplateHelper": "VZMistTemplateHelper"
};

class MistConvertor {
    src: string;
    isHomePage: boolean;

    todoCount: number = 0;
    nodeVars: Object = {};

    constructor(src: string, isHomePage: boolean) {
        this.src = src;
        this.isHomePage = isHomePage;
    }

    convert(): [string, any, number] {
        this.todoCount = 0;
        let errors = [];
        let tpl = JsonParser.parse(this.src, errors);
        if (errors.length > 0) {
            return [null, 'json 解析失败', 0];
        }
        this.changePropertyName(tpl, "native", "identifier");
        this.changePropertyName(tpl, "template", "layout");
        if (!(tpl instanceof Object && tpl.layout instanceof Object)) {
            return [null, '不是有效的模版文件', 0];
        }
        if (tpl.config) {
            if (tpl.controller) {
                this.unsupportedProperty(tpl, "config");
            }
            else {
                let vars = tpl.layout.vars;
                let config = { config: tpl.config };
                if (vars == undefined) {
                    vars = config;
                }
                else if (vars.constructor === Array) {
                    vars.splice(0, 0, config);
                }
                else {
                    vars = [config, vars];
                }
                tpl.layout.vars = vars;
                delete tpl.config;
            }
        }
        this.convertNode(tpl.layout);
        let ret = JSON.stringify(tpl, null, 2);
        for (var name in classNameMap) {
            if (classNameMap.hasOwnProperty(name)) {
                var newName = classNameMap[name];
                ret = ret.replace(new RegExp(name,"gm"), newName);
            }
        }
        return [ret, null, this.todoCount];
    }

    getTodoKey(): string {
        return "// TODO #" + ++this.todoCount;
    }

    tryConvertNode(dict: Object): boolean {
        let nodeKeys = 0;
        let otherKeys = 0;
        for (let key in dict) {
            if (oldProps.indexOf(key) >= 0) {
                nodeKeys++;
            }
            else {
                otherKeys++;
            }
        }
        if (nodeKeys > otherKeys && (nodeKeys >= 2 || oldProps.indexOf('children') >= 0)) {
            this.convertNode(dict);
            if (otherKeys > 0) {
                this.addPropertyAtFront(dict, this.getTodoKey(), "被当作 node 转换，请确认");
            }
            return true;
        }
        
        return false;
    }

    convertVariable(v: any): boolean {
        if (v instanceof Object) {
            if (this.tryConvertNode(v)) {
                return true;
            }
            else {
                for (let key in v) {
                    if (this.convertVariable(v[key])) {
                        this.nodeVars[key] = v[key];
                    }
                }
            }
        }
        return false;
    }

    convertVars(vars: any) {
        if (vars == undefined) {
            return;
        }
        else if (vars.constructor === Array) {
            for (let i in vars) {
                this.convertVars(vars[i]);
            }
        }
        else if (vars instanceof Object) {
            for (let v in vars) {
                if (this.convertVariable(vars[v])) {
                    this.nodeVars[v] = vars[v];
                }
            }
        }
    }

    copyObject(from: Object, to: Object) {
        let keys = Object.keys(from);
        for (let i in keys) {
            let key = keys[i];
            let value = from[key];
            if (value.constructor === Array) {
                let newValue = [];
                for (let i in value) {
                    newValue.push(value[i]);
                }
                value = newValue;
            }
            else if (value instanceof Object) {
                let newValue = {};
                this.copyObject(value, newValue);
                value = newValue;
            }
            to[key] = value;
        }
    }

    convertNode(node: any) {
        if (!(node instanceof Object)) {
            return;
        }

        if (node.type && types.indexOf(node.type) < 0) {
            this.addPropertyBefore(node, this.getTodoKey(), "⬇️ 不支持的元素类型", "type");
        }
        
        if (node.ref != undefined) {
            let match = node.ref.match(/\${\s*([a-zA-Z0-9_]*)\s*}/);
            if (match.length < 2) {
                this.unsupportedProperty(node, "ref");
            }
            else {
                let name = match[1];
                if (name in this.nodeVars) {
                    delete node["ref"];
                    let oldNode = {};
                    let keys = Object.keys(node);
                    for (let i in keys) {
                        let key = keys[i];
                        oldNode[key] = node[key];
                        delete node[key];
                    }
                    let refNode = this.nodeVars[name];
                    this.copyObject(refNode, node);
                    this.copyObject(oldNode, node);
                }
                else {
                    this.unsupportedProperty(node, "ref");
                }
            }
        }

        this.convertVars(node.vars);

        this.convertEvent(node, "action", "on-tap");
        this.convertEvent(node, "display", "on-display");
        this.convertEvent(node, "switched", "on-switch");
        this.convertEvent(node, "completion", "on-complete");
        
        if (node["exposure-log"] instanceof Object) {
            let eventName = this.isHomePage ? "on-display-once": "on-create";
            node[eventName] = {"exposureLog:":node["exposure-log"]};
            delete node["exposure-log"];
        }

        if (node["old-open-page-log"] instanceof Object) {
            let eventName = this.isHomePage ? "on-display-once": "on-create";
            node[eventName] = {"oldOpenPageLog:":node["old-open-page-log"]};
            delete node["old-open-page-log"];
        }

        let keys = Object.keys(node);
        let style = node.style || {};
        for (let i in keys) {
            let key = keys[i];
            if (styleProps.indexOf(key) >= 0) {
                style[key] = node[key];
                delete node[key];
            }
        }

        if (style.tag) {
            this.addPropertyAtFront(node, "tag", style.tag);
            delete style["tag"];
        }
        if (style.identifier) {
            this.addPropertyAtFront(node, "identifier", style.tag);
            delete style["identifier"];
        }

        this.changePropertyName(style, "view-properties", "properties");

        if (node["spm-tag"]) {
            let viewProperties = style["properties"] || {};
            viewProperties.spmTag = node["spm-tag"];
            style["properties"] = viewProperties;
            delete node["spm-tag"];
        }
        if (Object.keys(style).length > 0) {
            node.style = style;
        }
        
        if (node.children instanceof Array) {
            let children: Array<any> = node.children;
            for (let i=0;i<children.length;i++) {
                let child = node.children[i];
                if (!(child instanceof Object)) {
                    if (typeof child === "string" && child.match(/\/\/ TODO .*/)) {
                        i++;
                        continue;
                    }
                    else if (typeof child === "string" && child.match(expRegex)) {
                        // children.splice(i++, 0, this.getTodoKey() + " ⬇️ 变量引用请注意修改被引用的变量");
                    }
                    else {
                        children.splice(i++, 0, this.getTodoKey() + " ⬇️ 错误的 node 格式");
                    }
                    continue;
                }
                this.convertNode(child);
            }
            this.pushPropertyToBack(node, "children");
        }
    }

    camelCase(str: string) {
        return str.replace(/-(\w)/g, g => g[1].toUpperCase());
    }

    convertEvent(obj: any, oldName: string, newName: string) {
        if (obj[oldName]) {
            let oldEvent = obj[oldName];
            let newEvent = {};
            if (!(oldEvent instanceof Object)) {
                if (typeof oldEvent === "string" && oldEvent.match(expRegex)) {
                    obj[this.getTodoKey()] = "⬇️ 变量引用请注意修改被引用的变量";
                }
                newEvent = oldEvent;
            }
            else {
                if (oldEvent.url) {
                    if (oldEvent.source || oldEvent.monitor) {
                        newEvent["openUrl:"] = {
                            url: oldEvent.url,
                            monitor: oldEvent.monitor,
                            source: oldEvent.source
                        };
                    }
                    else {
                        newEvent["openUrl:"] = oldEvent.url;
                    }
                }
                if (oldEvent.selector) {
                    newEvent[oldEvent.selector] = oldEvent.params || '';
                }
                if (oldEvent.log) {
                    let logName = oldName == "action" ? "clickLog:" : "log:";
                    newEvent[logName] = oldEvent.log;
                }
                if (oldEvent["old-log"]) {
                    let logName = oldName == "action" ? "oldClickLog:" : "oldLog:";
                    newEvent[logName] = oldEvent["old-log"];
                }
                if (oldEvent["update-state"]) {
                    newEvent["updateState:"] = oldEvent["update-state"];
                }
                if (oldEvent.condition != undefined) {
                    let matches = (<string>oldEvent.condition).match(/\${(.*?)}/);
                    if (matches.length < 2) {
                        newEvent["condition"] = oldEvent.condition;
                        this.addPropertyBefore(newEvent, this.getTodoKey(), "⬇️ condition 属性不再支持。自动转换失败，未找到表达式。", "condition");
                    }
                    else {
                        let exp = matches[1];

                        let vars: Object;
                        if (obj.vars == undefined) {
                            vars = obj.vars = {};
                        }
                        else {
                            if (obj.vars.constructor !== Array) {
                                obj.vars = [obj.vars];
                            }
                            vars = {};
                            (<Array<any>>obj.vars).push(vars);
                        }
                        let key = this.camelCase(newName)+'Event';
                        vars[key] = newEvent;
                        newEvent = "${" + exp + " ? " + key + " : nil}"
                    }
                }
            }
            delete obj[oldName];
            obj[newName] = newEvent;
        }
        return undefined;
    }

    pushPropertyToBack(obj: any, prop: string) {
        if (obj[prop]) {
            let value = obj[prop];
            delete obj[prop];
            obj[prop] = value;
        }
    }

    unsupportedProperty(obj: any, prop: string) {
        if (obj[prop] != undefined) {
            this.addPropertyBefore(obj, this.getTodoKey(), "⬇️ " + prop + " 属性不再支持，请修改", prop);
        }
    }

    addPropertyBefore(obj: any, prop: string, value: any, before: string) {
        let keys = Object.keys(obj);
        for (let i in keys) {
            let key = keys[i];
            if (key == before) {
                obj[prop] = value;
            }
            let v = obj[key];
            delete obj[key];
            obj[key] = v;
        }
    }

    addPropertyAtFront(obj: any, prop: string, value: any) {
        let keys = Object.keys(obj);
        obj[prop] = value;
        for (let i in keys) {
            let key = keys[i];
            let value = obj[key];
            delete obj[key];
            obj[key] = value;
        }
    }

    changePropertyName(obj: any, oldName: string, newName: string) {
        if (obj[oldName]) {
            // obj[newName] = obj[oldName];
            // delete obj[oldName];

            // 为了保持顺序
            let keys = Object.keys(obj);
            for (let i in keys) {
                let key = keys[i];
                let value = obj[key];
                delete obj[key];
                obj[key == oldName ? newName : key] = value;
            }
        }
    }

}


export function convertToNewFormat(templateText: string, isHomePage = false): [string, any, number] {
    let convertor = new MistConvertor(templateText, isHomePage);
    return convertor.convert();
}
