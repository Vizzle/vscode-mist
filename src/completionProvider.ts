
'use strict';

import * as vscode from 'vscode';
import * as json from 'jsonc-parser'

enum MistBasicType {
    Object,
    Array,
    Integer,
    Number,
    String,
    Boolean,
    Other,
}

declare type MistPropertyType = MistBasicType | any[] | Object;
let MistEvent = MistBasicType.Object;

class MistPropertyInfo {
    constructor(public type: MistPropertyType, public desc: string, private _defaultValue = null) {}

    get defaultValue() {
        if (this._defaultValue) {
            return this._defaultValue;
        }
        if (this.type instanceof Array || this.type instanceof Object) {
            return '"$0"';
        }

        switch (this.type) {
            case MistBasicType.Object:
                return '{$0}';
            case MistBasicType.Array:
                return '[$0]';
            case MistBasicType.String:
                return '"$0"';
            default:
                return '$0';
        }
        
    }
}

export default class MistCompletionProvider implements vscode.CompletionItemProvider {
    
    private static templateProperties = {
        "layout": new MistPropertyInfo(MistBasicType.Object, "模版的布局描述，类型为元素"),
        "controller": new MistPropertyInfo(MistBasicType.String, "模版关联的 controller 类名"),
        "data": new MistPropertyInfo(MistBasicType.Object, "值为字典，用于对数据做一些处理或适配，这里的计算结果会追加到数据"),
        "state": new MistPropertyInfo(MistBasicType.Object, "模版的初始状态"),
        "styles": new MistPropertyInfo(MistBasicType.Object, "样式表，定义一些可以被重复使用的样式，在元素中通过 class 属性引用"),
        "async-display": new MistPropertyInfo(MistBasicType.Boolean, "是否开启异步渲染"),
        "reuse-identifier": new MistPropertyInfo(MistBasicType.String, "模版在 tableview 中的复用 id，默认为模版名"),
        "identifier": new MistPropertyInfo(MistBasicType.String, "给模版指定一个 id"),
    };

    private static colors = [
        "black",
        "darkgray",
        "lightgray",
        "white",
        "gray",
        "red",
        "green",
        "blue",
        "cyan",
        "yellow",
        "magenta",
        "orange",
        "purple",
        "brown",
        "transparent",
    ];

    private static baseProperties = {
        "type": new MistPropertyInfo(["text", "image", "button", "scroll", "paging", "line", "indicator"], "元素类型"),
        "gone": new MistPropertyInfo(MistBasicType.Boolean, "为 true 时，元素不显示，且不加入布局"),
        "repeat": new MistPropertyInfo(MistBasicType.Number, "模版衍生机制。repeat 为元素重复的次数或重复的数组。注意：根节点元素使用 repeat 无效"),
        "vars": new MistPropertyInfo(MistBasicType.Object, "定义变量（宏）"),
        "class": new MistPropertyInfo(MistBasicType.String, "引用在 styles 中定义的样式。可以引用多个样式，用空格分开，靠后的样式覆盖前面的样式"),
        "children": new MistPropertyInfo(MistBasicType.Array, "容器的子元素"),
        "style": {
            "background-color": new MistPropertyInfo(MistCompletionProvider.colors, "背景颜色，默认为透明"),
            "border-width": new MistPropertyInfo(MistBasicType.Number, "边框宽度，默认为 0。可以用 \"1px\"表示 1 像素的边框"),
            "border-color": new MistPropertyInfo(MistCompletionProvider.colors, "边框颜色，默认为黑色"),
            "corner-radius": new MistPropertyInfo(MistBasicType.Number, `圆角半径，默认为 0。
            可以使用 corner-radius-top-left、corner-radius-top-right、corner-radius-bottom-left、corner-radius-bottom-right 分别指定每个角的圆角半径`),
            "user-interaction-enabled": new MistPropertyInfo(MistBasicType.Boolean, "设置生成的 view 的userInteractionEnabled。默认不设置"),
            "clip": new MistPropertyInfo(MistBasicType.Boolean, "设置生成的 view 的 clipsToBounds"),
            "properties": new MistPropertyInfo(MistBasicType.Object, `通过反射给 view 设置属性，如：
            "properties": {
              "layer.shadowOpacity": 1
            }`),

            "width": new MistPropertyInfo(MistBasicType.Number, "元素的宽度，默认值为 auto"),
            "height": new MistPropertyInfo(MistBasicType.Number, "元素的高度，默认值为 auto"),
            "min-width": new MistPropertyInfo(MistBasicType.Number, "元素的最小宽度"),
            "min-height": new MistPropertyInfo(MistBasicType.Number, "元素的最小高度"),
            "max-width": new MistPropertyInfo(MistBasicType.Number, "元素的最大宽度"),
            "max-height": new MistPropertyInfo(MistBasicType.Number, "元素的最大高度"),
            "margin": new MistPropertyInfo(MistBasicType.Number, "元素的外边距，默认值为 0"),
            "margin-left": new MistPropertyInfo(MistBasicType.Number, "元素距左边的外边距"),
            "margin-right": new MistPropertyInfo(MistBasicType.Number, "元素距右边的外边距"),
            "margin-top": new MistPropertyInfo(MistBasicType.Number, "元素距上边的外边距"),
            "margin-bottom": new MistPropertyInfo(MistBasicType.Number, "元素距下边的外边距"),
            "padding": new MistPropertyInfo(MistBasicType.Number, "元素的内边距，默认值为 0"),
            "padding-left": new MistPropertyInfo(MistBasicType.Number, "元素距左边的内边距"),
            "padding-right": new MistPropertyInfo(MistBasicType.Number, "元素距右边的内边距"),
            "padding-top": new MistPropertyInfo(MistBasicType.Number, "元素距上边的内边距"),
            "padding-bottom": new MistPropertyInfo(MistBasicType.Number, "元素距下边的内边距"),
            "direction": new MistPropertyInfo({
                "horizontal": "从左到右排列",
                "vertical": "从上到下排列",
                "horizontal-reverse": "从右到左排列",
                "vertical-reverse": "从下到上排列"
            }, "决定子元素的排列方向，默认为 horizontal"),
            "wrap": new MistPropertyInfo({
                "nowrap": "子元素超出容器时，所有子元素按照 flex-shrink 缩小",
                "wrap": "子元素超出容器时将换行",
                "wrap-reverse": "子元素超出容器时将换行，方向与 wrap 相反"
            }, "子元素是否允许换行"),
            "align-items": new MistPropertyInfo({
                "start": "元素位于容器的开头",
                "center": "元素位于容器的中心",
                "end": "元素位于容器的结尾",
                "stretch": "默认值。元素拉伸以填满容器",
                "baseline": "根据元素的基线位置对齐。文本的基线为第一行文字的基线，容器的基线为其第一个元素的基线。",
            }, "子元素在当前行的排列方向的垂直方向上的对齐方式"),
            "justify-content": new MistPropertyInfo({
                "start": "默认值。元素位于容器的开头",
                "end": "元素位于容器的结尾",
                "center": "元素位于容器的中心",
                "space-between": "所有子元素均匀分布在行内，空白平均分布在每两个元素中间，首尾元素对齐到容器两端",
                "space-around": "所有子元素均匀分布在行内，空白平均分布在所有元素两侧",
            }, "子元素在布局方向上的对齐方式"),
            "align-content": new MistPropertyInfo({
                "start": "行位于容器的开头",
                "end": "行位于容器的结尾",
                "center": "行位于容器的中心",
                "stretch": "默认值。行拉伸以填满容器",
                "space-between": "所有行均匀分布在容器内，空白平均分布在每两行中间，首尾行对齐到容器两端",
                "space-around": "所有行均匀分布在容器内，空白平均分布在所有行两侧",
            }, "容器内各行的对齐方式"),
            "align-self": new MistPropertyInfo({
                "start": "元素位于容器的开头",
                "center": "元素位于容器的中心",
                "end": "元素位于容器的结尾",
                "stretch": "默认值。元素拉伸以填满容器",
                "baseline": "根据元素的基线位置对齐。文本的基线为第一行文字的基线，容器的基线为其第一个元素的基线。",
            }, "覆写父元素的 align-items，指定元素在父元素中（沿父元素布局方向）的对齐方式，取值同 align-items"),
            "flex-grow": new MistPropertyInfo(MistBasicType.Number, `元素放大的权值，默认值为 0（即元素不会被放大）。不能为负数。
            
            当容器的空间（在布局方向上）有剩余时，所有子元素（在布局方向上）的尺寸会放大以填满剩余空间，flex-grow 决定元素放大的权值。见 flex-basis。
            
            当所有子元素的 flex-grow 总和小于 1 时，总权值按 1 计算，即剩余空间不会被填满`),
            "flex-shrink": new MistPropertyInfo(MistBasicType.Number, `元素缩小的权值，默认值为 1。不能为负数。
            
            当容器的空间不足以放下所有子元素时，所有子元素的大小会缩小以填满剩余空间。
            元素的 flex-basis 也会计入权值，即实际权值为 flex-shrink * flex-basis 。
            
            默认值为 1，也就是说，当空间不足时，所有元素等比缩小。
            
            像图标、头像之类的元素，一般是不允许缩小的，这时记得将 flex-shrink 设置为 0 。`),
            "flex-basis": new MistPropertyInfo(MistBasicType.Number, "元素伸缩时的基准尺寸。容器计算剩余空间时，使用子元素的基准尺寸来计算已分配空间。默认值为 auto"),
            "spacing": new MistPropertyInfo(MistBasicType.Number, "子元素间的间距。为每两个子元素之间添加间距，每行的第一个元素之前和最后一个元素之后不会添加。"),
            "line-spacing": new MistPropertyInfo(MistBasicType.Number, "多行布局的行间距。为每两行之间添加间距，跟 spacing 相似"),
            "fixed": new MistPropertyInfo(MistBasicType.Number, `是否为固定布局元素，固定元素不参与弹性布局，也不会对父容器的布局有任何影响，而是直接相对于父元素布局（等其它弹性元素布局完成之后再布局）。fixed 元素通过 width, height, margin 属性来确定元素的位置与大小。
            
            适合用于浮层、角标等元素。默认情况下（不设置 width, height, margin），一个 fixed 元素就是和父容器等大的一个浮层，也可以放置于容器底部作为背景。
            
            fixed 元素并不是一定处于其它元素的最上方，而是同其它元素一样，按照其在父容器里的顺序排列。`),
            "lines": new MistPropertyInfo(MistBasicType.Number, "仅对多行容器有效（即 wrap 不为 nowrap），限制最大行数。默认为 0，即不限制行数。可以用来隐藏放不下的元素"),
            "items-per-line": new MistPropertyInfo(MistBasicType.Number, "仅对多行容器有效（即 wrap 不为 nowrap），限制每行最大元素个数。默认为 0，即不限制"),
        },
        "on-tap": new MistPropertyInfo(MistEvent, "元素被点击时触发"),
        "on-display": new MistPropertyInfo(MistEvent, "元素显示时触发。在列表中滑出可见区域再滑回来会重新触发"),
        "on-create": new MistPropertyInfo(MistEvent, "元素被创建时触发，此时还没显示"),
    };

    private static nodeProperties = {
        "stack": {
            "style": {
                "highlight-background-color": new MistPropertyInfo(MistCompletionProvider.colors, "按下时的高亮颜色"),
            }
        },
        "text": {
            "style": {
                "text": new MistPropertyInfo(MistBasicType.String, "显示的文字"),
                "html-text": new MistPropertyInfo(MistBasicType.String, "使用 HTML 表示的富文本，指定这个属性后，text 属性将被忽略"),
                "color": new MistPropertyInfo(MistCompletionProvider.colors, "文字颜色。默认为黑色"),
                "font-size": new MistPropertyInfo(MistBasicType.Number, "字体大小。默认为17"),
                "font-name": new MistPropertyInfo(MistBasicType.String, "字体名。默认为系统字体"),
                "font-style": new MistPropertyInfo(["ultra-light", "thin", "light", "normal", "medium", "bold", "heavy", "black", "italic", "bold-italic"], "字体样式"),
                "alignment": new MistPropertyInfo(["left", "center", "right", "justify"], "文字水平对齐方式。默认为 left"),
                "line-break-mode": new MistPropertyInfo(["word", "char"], "文字换行方式。默认为 word"),
                "truncation-mode": new MistPropertyInfo(["truncation-head", "truncation-middle", "truncation-tail", "none"], "文字省略方式。默认为 truncation-tail"),
                "lines": new MistPropertyInfo(MistBasicType.Number, "最大行数。为 0 时，不限制行数。默认为 1"),
                "adjusts-font-size": new MistPropertyInfo(MistBasicType.Number, "是否调整字号以适应控件的宽度，默认为false"),
                "mini-scale-factor": new MistPropertyInfo(MistBasicType.Number, "与adjusts-font-size配合使用，设置一个字号调整的最小系数，设置为0时，字号会调整至内容能完全展示"),
            }
        },
        "button": {
            "style": {
                "title": new MistPropertyInfo(MistBasicType.String, "显示的文字"),
                "image": new MistPropertyInfo(MistBasicType.String, "显示的图片，只能为本地图片，图片固定显示在文字左边。支持状态"),
                "background-image": new MistPropertyInfo(MistBasicType.String, "按钮背景图片，只能为本地图片，也可以设置为颜色。支持状态"),
                "title-color": new MistPropertyInfo(MistCompletionProvider.colors, "文字颜色。默认为黑色"),
                "font-size": new MistPropertyInfo(MistBasicType.Number, "字体大小。默认为17"),
                "font-name": new MistPropertyInfo(MistBasicType.String, "字体名。默认为系统字体"),
                "font-style": new MistPropertyInfo(["ultra-light", "thin", "light", "normal", "medium", "bold", "heavy", "black", "italic", "bold-italic"], "字体样式"),
                "enlarg-size": new MistPropertyInfo(MistBasicType.Number, `放大按钮的点击区域。如：
                "enlarge-size": 5 上下左右各放大 5
                "enlarge-size": [5, 10] 左右放大 5，上下放大 10`),
            }
        },
        "image": {
            "style": {
                "image": new MistPropertyInfo(MistBasicType.String, "显示的图片名，只能使用本地图片。规则同 [UIImage imageNamed:]"),
                "image-url": new MistPropertyInfo(MistBasicType.String, "网络图片地址"),
                "error-image": new MistPropertyInfo(MistBasicType.String, `网络图片下载失败时显示的图片，只能使用本地图片，如果没有指定则显示 image。
                注意：image-url 为空时，将会使用 image 而不是 error-image`),
                "content-mode": new MistPropertyInfo(["center", "scale-to-fill", "scale-aspect-fit", "scale-aspect-fill"], "图片缩放模式"),
            },
            "on-complete": new MistPropertyInfo(MistEvent, "图片下载完成时触发"),
        },
        "scroll": {
            "style": {
                "scroll-direction": new MistPropertyInfo(["none", "horizontal", "vertical", "both"], `滚动方向。默认为 horizontal。
                与 direction 不同，direction 表示子元素实际布局方向，scroll-direction表示该方向上不限制子元素的尺寸
                none 水平方向和竖直方向都不允许滚动。
                horizontal 水平方向滚动。
                vertical 竖直方向滚动。
                both 水平方向和竖直方向都可以滚动。`),
                "scroll-enabled": new MistPropertyInfo(MistBasicType.Boolean, "是否允许用户拖动"),
            }
        },
        "paging": {
            "style": {
                "direction": new MistPropertyInfo(["horizontal", "vertical"], `滚动方向。默认为 horizontal。
                horizontal 水平方向滚动。
                vertical 竖直方向滚动。`),
                "scroll-enabled": new MistPropertyInfo(MistBasicType.Boolean, "是否允许用户拖动。默认为 true"),
                "paging": new MistPropertyInfo(MistBasicType.Boolean, "是否以分页的方式滚动。默认为 true"),
                "auto-scroll": new MistPropertyInfo(MistBasicType.Number, "自动滚动的时间间隔，单位为秒，为 0 表示不自动滚动。默认为 0"),
                "infinite-loop": new MistPropertyInfo(MistBasicType.Boolean, "是否循环滚动。默认为 false"),
                "page-control": new MistPropertyInfo(MistBasicType.Boolean, "是否显示 Page Control。默认为 false"),
                "page-control-scale": new MistPropertyInfo(MistBasicType.Number, "Page Control 缩放倍率，用于控制 Page Control 的大小。默认为 1"),
                "page-control-color": new MistPropertyInfo(MistCompletionProvider.colors, "Page Control 圆点的颜色。默认为半透明的白色"),
                "page-control-selected-color": new MistPropertyInfo(MistCompletionProvider.colors, "Page Control 当前页圆点的颜色。默认为白色"),
                "page-control-margin-left": new MistPropertyInfo(MistBasicType.Number, `Page Control 距容器边缘的左边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
                默认值为 auto。`),
                "page-control-margin-right": new MistPropertyInfo(MistBasicType.Number, `Page Control 距容器边缘的右边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
                默认值为 auto。`),
                "page-control-margin-top": new MistPropertyInfo(MistBasicType.Number, `Page Control 距容器边缘的上边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
                默认值为 auto。`),
                "page-control-margin-bottom": new MistPropertyInfo(MistBasicType.Number, `Page Control 距容器边缘的下边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
                默认值为 auto。`),
            },
            "on-switch": new MistPropertyInfo(MistEvent, "（手动或自动）翻页时触发"),
        },
        "indicator": {
            "style": {
                "color": new MistPropertyInfo(MistCompletionProvider.colors, "菊花的颜色，默认为白色"),
            }
        },
        "line": {
            "style": {
                "color": new MistPropertyInfo(MistCompletionProvider.colors, "线条的颜色，默认为黑色"),
                "dash-length": new MistPropertyInfo(MistBasicType.Number, "虚线的线段长度，不设置时为实线"),
                "space-length": new MistPropertyInfo(MistBasicType.Number, "虚线的空白长度，不设置时为实线"),
            }
        },
    };

    private isInNode(location: json.Location): boolean {
        if (location.path.length > 1 && location.path[0] == 'layout') {
            for (let i = 1; i < location.path.length - 1; i += 2) {
                if (location.path[i] != 'children' || i + 1 >= location.path.length - 1 || location.path[i + 1] as number == undefined) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    private nodePath(location: json.Location): json.Segment[] {
        if (location.path.length > 0 && location.path[0] == "layout") {
            let start = 1;
            while (start + 1 < location.path.length && location.path[start] == "children" && location.path[start + 1] as number != undefined) {
                start += 2;
            }
            return location.path.slice(start);
        }
        
        return [];
    }

    private isInNodeStyle(location: json.Location): boolean {
        if (location.path.length > 1 && location.path[0] == 'layout') {
            
        }

        return false;
    }

	private getProp(node: json.Node, key: string): json.Node {
		if (node && node.type == "object") {
			let r = node.children.find(p => p.children[0].value == key);
			if (r) {
				return r.children[1];
			}
		}
		return null;
	}

	private getType(node: json.Node): string {
		if (node.type == 'object') {
			let childrenNode = this.getProp(node, 'children');
			let typeNode = this.getProp(node, 'type');
			return typeNode ? typeNode.value : childrenNode ? 'stack' : 'node';
		}
		else if (node.type == 'string' && (<string>node.value).match(/^\${.+}$/)) {
			return "exp";
		}
		else {
			return "unknown";
		}
	}

    private getPropertiesWithPath(properties, path: json.Segment[]) {
        if (path.length == 1) {
            return properties instanceof Object ? properties : {};
        }
        else if (path.length > 1) {
            return this.getPropertiesWithPath(properties[path[0]], path.slice(1));
        }
        return {};
    }

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        let location = json.getLocation(document.getText(), document.offsetAt(position));
        console.log(location);
        console.log(this.nodePath(location));

        let rootNode = json.parseTree(document.getText());

        let properties = {};
        let currentPath = location.path.length > 0 ? location.path[location.path.length - 1] : '';

        if (location.path.length == 0) {
            return null;
        }
        else if (location.path.length == 1) {
            properties = Object.assign(properties, MistCompletionProvider.templateProperties);
        }
        else if (location.path[0] == 'styles' && location.path.length >= 3) {
            let propertiesMap = {};
            propertiesMap = Object.assign(propertiesMap, {'node': MistCompletionProvider.baseProperties});
            propertiesMap = Object.assign(propertiesMap, MistCompletionProvider.nodeProperties);

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
                    return `<${k}> ` + (info instanceof MistPropertyInfo ? info.desc || 'no description' : 'no description');
                }).join('\n\n');
                let firstInfo = value[types[0]];
                allProperties[key] = new MistPropertyInfo(firstInfo instanceof MistPropertyInfo ? firstInfo.type : MistBasicType.Other, desc);
            });
            properties = allProperties;
        }
        else if (location.path[0] == 'layout') {
            let path = this.nodePath(location);
            let node = json.findNodeAtLocation(rootNode, location.path.slice(0, location.path.length - path.length));
            let type = this.getType(node);
            let nodeProperties = MistCompletionProvider.nodeProperties[type] || {};

            properties = Object.assign(properties, this.getPropertiesWithPath(MistCompletionProvider.baseProperties, path));
            properties = Object.assign(properties, this.getPropertiesWithPath(nodeProperties, path));
        }

        if (location.isAtPropertyKey) {
            let existsProperties = json.findNodeAtLocation(rootNode, location.path.slice(0, location.path.length - 1)).children.map(p => p.children[0].value);
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
        else {
            let info: MistPropertyInfo = properties[currentPath];
            properties = {};
            if (info instanceof MistPropertyInfo) {
                if (info.type instanceof Array) {
                    (<Array<string>>info.type).forEach(v => properties[v] = new MistPropertyInfo(MistBasicType.String, ""));
                }
                else if (info.type instanceof Object) {
                    Object.keys(info.type).forEach(k => properties[k] = new MistPropertyInfo(MistBasicType.String, info.type[k]));
                }
            }
        }

        return Object.keys(properties).map(p => {
            let item = new vscode.CompletionItem(p, vscode.CompletionItemKind.Property);
            let info: MistPropertyInfo = properties[p];
            if (!(info instanceof MistPropertyInfo)) {
                info = new MistPropertyInfo(MistBasicType.Object, "");
            }
            item.documentation = info.desc;
            
            if (location.previousNode) {
                let offset = document.offsetAt(position);
                let delta = offset - location.previousNode.offset;
                let inQuote = delta > 0 && delta < location.previousNode.length;
                if (inQuote) {
                    item.insertText = p;
                    item.range = new vscode.Range(document.positionAt(location.previousNode.offset + 1), document.positionAt(location.previousNode.offset + location.previousNode.length - 1));
                }
                else {
                    item.insertText = `"${p}"`;
                    item.range = new vscode.Range(document.positionAt(location.previousNode.offset), document.positionAt(location.previousNode.offset + location.previousNode.length));
                }
            } else {
                let insertText = `"${p}"`;
                let comma = false;
                if (document.lineAt(position.line).text.substr(position.character).match(/^\s*"/)) {
                    comma = true;
                }
                else if (position.line + 1 < document.lineCount && document.lineAt(position.line + 1).text.match(/^\s*"/)) {
                    comma = true;
                }
                insertText += `: ${info.defaultValue}`;
                if (comma) {
                    insertText += ',';
                }
                // insertText += '$0';
                item.insertText = new vscode.SnippetString(insertText);
            }
            return item;
        });
    }
    
    selectionDidChange(textEditor: vscode.TextEditor) {
        if (textEditor.selection.start.compareTo(textEditor.selection.end) != 0) {
            return;
        }

        let doc = textEditor.document;
        let sel = textEditor.selection.start;
        if (textEditor.document.getText(new vscode.Range(doc.positionAt(doc.offsetAt(sel) - 1), doc.positionAt(doc.offsetAt(sel) + 1))) == '""') {
            let items = this.provideCompletionItems(doc, sel, null);
            if (items && items.length > 0) {
                vscode.commands.executeCommand("editor.action.triggerSuggest");
            }
        }
    }
}
