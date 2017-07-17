
'use strict';

import * as vscode from 'vscode';
import * as json from 'jsonc-parser'
import {parseJson} from './jsonUtils'

enum BasicType {
    Object,
    Array,
    Integer,
    Number,
    String,
    Boolean,
    Other,
}

class EnumProperty { [key: string]: string };
class ObjectProperty { [key: string]: PropertyInfo };
type Enum = any[] | EnumProperty;
type PropertyType = BasicType | Enum | ObjectProperty;

class PropertyInfo {
    constructor(public type: PropertyType, public desc: string, private _defaultValue = null) {}

    public isEnumProperty() {
        if (this.type instanceof Array) {
            return true;
        }
        else if (this.type instanceof Object) {
            let keys = Object.keys(this.type);
            if (keys.length > 0) {
                return typeof this.type[keys[0]] === "string";
            }
        }
        return false;
    }

    public isObjectProperty() {
        if (this.type instanceof Object) {
            let keys = Object.keys(this.type);
            if (keys.length > 0) {
                return this.type[keys[0]] instanceof PropertyInfo;
            }
        }
        return false;
    }

    get defaultValue() {
        if (this._defaultValue) {
            return this._defaultValue;
        }
        if (this.isEnumProperty()) {
            return '"$0"';
        }
        else if (this.isObjectProperty()) {
            return '{$0}';
        }

        switch (this.type) {
            case BasicType.Object:
                return '{$0}';
            case BasicType.Array:
                return '[$0]';
            case BasicType.String:
                return '"$0"';
            default:
                return '$0';
        }
        
    }
}

let Log = {
    "seed": new PropertyInfo(BasicType.String, "埋点的 spmId"),
    "params": new PropertyInfo(BasicType.Object, "埋点扩展参数"),
}

let Event = {
    "openUrl:": new PropertyInfo(BasicType.String, "打开指定的 URL"),
    "updateState:": new PropertyInfo(BasicType.Object, "更新状态。值应该为一个字典，将状态中对应的值更新。注意不是替换整个状态，只是更改对应的 key"),
    "exposureLog:": new PropertyInfo(Log, "曝光埋点"),
    "clickLog:": new PropertyInfo(Log, "点击埋点"),
}

export default class MistCompletionProvider implements vscode.CompletionItemProvider {
    
    private static templateProperties = {
        "layout": new PropertyInfo(BasicType.Object, "模版的布局描述，类型为元素"),
        "controller": new PropertyInfo(BasicType.String, "模版关联的 controller 类名"),
        "data": new PropertyInfo(BasicType.Object, "值为字典，用于对数据做一些处理或适配，这里的计算结果会追加到数据"),
        "state": new PropertyInfo(BasicType.Object, "模版的初始状态"),
        "styles": new PropertyInfo(BasicType.Object, "样式表，定义一些可以被重复使用的样式，在元素中通过 class 属性引用"),
        "async-display": new PropertyInfo(BasicType.Boolean, "是否开启异步渲染"),
        "reuse-identifier": new PropertyInfo(BasicType.String, "模版在 tableview 中的复用 id，默认为模版名"),
        "identifier": new PropertyInfo(BasicType.String, "给模版指定一个 id"),
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
        "type": new PropertyInfo({
            "text": "文本元素，用于显示文本，支持富文本",
            "image": `图片元素，可展示本地图片和网络图片。网络图片自动缓存。
            展示本地图片时，使用 image 属性，如 "image": "O2O.bundle/arrow"。
            展示网络图片时，使用 image-url 指定网络图片，image 指定加载中显示的图片，error-image 指定下载失败时显示的图片。`,
            "button": "按钮元素，可以设置按下时的文字颜色等",
            "scroll": `滚动容器元素，使用 children 定义子元素。
            注意：scroll 元素的尺寸不会根据它的子元素自适应。`,
            "paging": "分页元素，使用 children 定义子元素，每个子元素就是一页",
            "line": "线条元素，主要用于展示虚线，其粗细、长度由布局属性控制",
            "indicator": "加载指示器，俗称菊花"
        }, "元素类型"),
        "tag": new PropertyInfo(BasicType.Integer, "元素的 tag，用于在 native 查找该 view。必须是整数"),
        "gone": new PropertyInfo(BasicType.Boolean, "为 true 时，元素不显示，且不加入布局"),
        "repeat": new PropertyInfo(BasicType.Number, "模版衍生机制。repeat 为元素重复的次数或重复的数组。注意：根节点元素使用 repeat 无效"),
        "vars": new PropertyInfo(BasicType.Object, "定义变量（宏）"),
        "class": new PropertyInfo(BasicType.String, "引用在 styles 中定义的样式。可以引用多个样式，用空格分开，靠后的样式覆盖前面的样式"),
        "children": new PropertyInfo(BasicType.Array, "容器的子元素"),
        "style": new PropertyInfo({
            "background-color": new PropertyInfo(MistCompletionProvider.colors, "背景颜色，默认为透明"),
            "border-width": new PropertyInfo(BasicType.Number, "边框宽度，默认为 0。可以用 \"1px\"表示 1 像素的边框"),
            "border-color": new PropertyInfo(MistCompletionProvider.colors, "边框颜色，默认为黑色"),
            "corner-radius": new PropertyInfo(BasicType.Number, `圆角半径，默认为 0。
            可以使用 corner-radius-top-left、corner-radius-top-right、corner-radius-bottom-left、corner-radius-bottom-right 分别指定每个角的圆角半径`),
            "user-interaction-enabled": new PropertyInfo(BasicType.Boolean, "设置生成的 view 的userInteractionEnabled。默认不设置"),
            "clip": new PropertyInfo(BasicType.Boolean, "设置生成的 view 的 clipsToBounds"),
            "is-accessibility-element": new PropertyInfo(BasicType.Boolean, "是否为无障碍元素，如果为 true，则该元素与其子元素一起朗读，子元素不能再单独设置为无障碍元素"),
            "accessibility-label": new PropertyInfo(BasicType.String, "无障碍模式下朗读的文本"),
            "properties": new PropertyInfo(BasicType.Object, `通过反射给 view 设置属性，如：
            "properties": {
              "layer.shadowOpacity": 1
            }`),

            "width": new PropertyInfo(BasicType.Number, "元素的宽度，默认值为 auto"),
            "height": new PropertyInfo(BasicType.Number, "元素的高度，默认值为 auto"),
            "min-width": new PropertyInfo(BasicType.Number, "元素的最小宽度"),
            "min-height": new PropertyInfo(BasicType.Number, "元素的最小高度"),
            "max-width": new PropertyInfo(BasicType.Number, "元素的最大宽度"),
            "max-height": new PropertyInfo(BasicType.Number, "元素的最大高度"),
            "margin": new PropertyInfo(BasicType.Number, "元素的外边距，默认值为 0"),
            "margin-left": new PropertyInfo(BasicType.Number, "元素距左边的外边距"),
            "margin-right": new PropertyInfo(BasicType.Number, "元素距右边的外边距"),
            "margin-top": new PropertyInfo(BasicType.Number, "元素距上边的外边距"),
            "margin-bottom": new PropertyInfo(BasicType.Number, "元素距下边的外边距"),
            "padding": new PropertyInfo(BasicType.Number, "元素的内边距，默认值为 0"),
            "padding-left": new PropertyInfo(BasicType.Number, "元素距左边的内边距"),
            "padding-right": new PropertyInfo(BasicType.Number, "元素距右边的内边距"),
            "padding-top": new PropertyInfo(BasicType.Number, "元素距上边的内边距"),
            "padding-bottom": new PropertyInfo(BasicType.Number, "元素距下边的内边距"),
            "direction": new PropertyInfo({
                "horizontal": "从左到右排列",
                "vertical": "从上到下排列",
                "horizontal-reverse": "从右到左排列",
                "vertical-reverse": "从下到上排列"
            }, "决定子元素的排列方向，默认为 horizontal"),
            "wrap": new PropertyInfo({
                "nowrap": "子元素超出容器时，所有子元素按照 flex-shrink 缩小",
                "wrap": "子元素超出容器时将换行",
                "wrap-reverse": "子元素超出容器时将换行，方向与 wrap 相反"
            }, "子元素是否允许换行"),
            "align-items": new PropertyInfo({
                "start": "元素位于容器的开头",
                "center": "元素位于容器的中心",
                "end": "元素位于容器的结尾",
                "stretch": "默认值。元素拉伸以填满容器",
                "baseline": "根据元素的基线位置对齐。文本的基线为第一行文字的基线，容器的基线为其第一个元素的基线。",
            }, "子元素在当前行的排列方向的垂直方向上的对齐方式"),
            "justify-content": new PropertyInfo({
                "start": "默认值。元素位于容器的开头",
                "end": "元素位于容器的结尾",
                "center": "元素位于容器的中心",
                "space-between": "所有子元素均匀分布在行内，空白平均分布在每两个元素中间，首尾元素对齐到容器两端",
                "space-around": "所有子元素均匀分布在行内，空白平均分布在所有元素两侧",
            }, "子元素在布局方向上的对齐方式"),
            "align-content": new PropertyInfo({
                "start": "行位于容器的开头",
                "end": "行位于容器的结尾",
                "center": "行位于容器的中心",
                "stretch": "默认值。行拉伸以填满容器",
                "space-between": "所有行均匀分布在容器内，空白平均分布在每两行中间，首尾行对齐到容器两端",
                "space-around": "所有行均匀分布在容器内，空白平均分布在所有行两侧",
            }, "容器内各行的对齐方式"),
            "align-self": new PropertyInfo({
                "start": "元素位于容器的开头",
                "center": "元素位于容器的中心",
                "end": "元素位于容器的结尾",
                "stretch": "默认值。元素拉伸以填满容器",
                "baseline": "根据元素的基线位置对齐。文本的基线为第一行文字的基线，容器的基线为其第一个元素的基线。",
            }, "覆写父元素的 align-items，指定元素在父元素中（沿父元素布局方向）的对齐方式，取值同 align-items"),
            "flex-grow": new PropertyInfo(BasicType.Number, `元素放大的权值，默认值为 0（即元素不会被放大）。不能为负数。
            
            当容器的空间（在布局方向上）有剩余时，所有子元素（在布局方向上）的尺寸会放大以填满剩余空间，flex-grow 决定元素放大的权值。见 flex-basis。
            
            当所有子元素的 flex-grow 总和小于 1 时，总权值按 1 计算，即剩余空间不会被填满`),
            "flex-shrink": new PropertyInfo(BasicType.Number, `元素缩小的权值，默认值为 1。不能为负数。
            
            当容器的空间不足以放下所有子元素时，所有子元素的大小会缩小以填满剩余空间。
            元素的 flex-basis 也会计入权值，即实际权值为 flex-shrink * flex-basis 。
            
            默认值为 1，也就是说，当空间不足时，所有元素等比缩小。
            
            像图标、头像之类的元素，一般是不允许缩小的，这时记得将 flex-shrink 设置为 0 。`),
            "flex-basis": new PropertyInfo(BasicType.Number, "元素伸缩时的基准尺寸。容器计算剩余空间时，使用子元素的基准尺寸来计算已分配空间。默认值为 auto"),
            "spacing": new PropertyInfo(BasicType.Number, "子元素间的间距。为每两个子元素之间添加间距，每行的第一个元素之前和最后一个元素之后不会添加。"),
            "line-spacing": new PropertyInfo(BasicType.Number, "多行布局的行间距。为每两行之间添加间距，跟 spacing 相似"),
            "fixed": new PropertyInfo(BasicType.Number, `是否为固定布局元素，固定元素不参与弹性布局，也不会对父容器的布局有任何影响，而是直接相对于父元素布局（等其它弹性元素布局完成之后再布局）。fixed 元素通过 width, height, margin 属性来确定元素的位置与大小。
            
            适合用于浮层、角标等元素。默认情况下（不设置 width, height, margin），一个 fixed 元素就是和父容器等大的一个浮层，也可以放置于容器底部作为背景。
            
            fixed 元素并不是一定处于其它元素的最上方，而是同其它元素一样，按照其在父容器里的顺序排列。`),
            "lines": new PropertyInfo(BasicType.Number, "仅对多行容器有效（即 wrap 不为 nowrap），限制最大行数。默认为 0，即不限制行数。可以用来隐藏放不下的元素"),
            "items-per-line": new PropertyInfo(BasicType.Number, "仅对多行容器有效（即 wrap 不为 nowrap），限制每行最大元素个数。默认为 0，即不限制"),
        }, "元素的样式和布局属性"),
        "on-tap": new PropertyInfo(Event, "元素被点击时触发"),
        "on-display": new PropertyInfo(Event, "元素显示时触发。在列表中滑出可见区域再滑回来会重新触发"),
        "on-create": new PropertyInfo(Event, "元素被创建时触发，此时还没显示"),
    };

    private static nodeProperties = {
        "stack": {
            "style": new PropertyInfo({
                "highlight-background-color": new PropertyInfo(MistCompletionProvider.colors, "按下时的高亮颜色"),
            }, "元素的样式和布局属性")
        },
        "text": {
            "style": new PropertyInfo({
                "text": new PropertyInfo(BasicType.String, "显示的文字"),
                "html-text": new PropertyInfo(BasicType.String, "使用 HTML 表示的富文本，指定这个属性后，text 属性将被忽略"),
                "color": new PropertyInfo(MistCompletionProvider.colors, "文字颜色。默认为黑色"),
                "font-size": new PropertyInfo(BasicType.Number, "字体大小。"),
                "font-name": new PropertyInfo(BasicType.String, "字体名。默认为系统字体"),
                "font-style": new PropertyInfo(["ultra-light", "thin", "light", "normal", "medium", "bold", "heavy", "black", "italic", "bold-italic"], "字体样式"),
                "alignment": new PropertyInfo({
                    "left": "文字靠左边显示",
                    "center": "文字居中显示",
                    "right": "文字靠右边显示",
                    "justify": "文字两端对齐。只对多行文字有效，且最后一行文字仍然靠左显示"
                }, "文字水平对齐方式。默认为 left"),
                "line-break-mode": new PropertyInfo({
                    "word": "按单词换行，尽量保证不从单词中间换行",
                    "char": "按字符换行"
                }, "文字换行方式。默认为 word"),
                "truncation-mode": new PropertyInfo({
                    "truncation-head": "文字显示不下时头部显示省略号。多行时省略号在最后一行",
                    "truncation-middle": "文字显示不下时中间显示省略号。多行时省略号在最后一行",
                    "truncation-tail": "文字显示不下时尾部显示省略号。多行时省略号在最后一行",
                    "none": "文字显示不下时不显示省略号。显示不下的文字不显示，不会出现半个字"
                }, "文字省略方式。默认为 truncation-tail"),
                "lines": new PropertyInfo(BasicType.Number, "最大行数。为 0 时，不限制行数。默认为 1"),
                "adjusts-font-size": new PropertyInfo(BasicType.Number, "是否调整字号以适应控件的宽度，默认为false"),
                "mini-scale-factor": new PropertyInfo(BasicType.Number, "与adjusts-font-size配合使用，设置一个字号调整的最小系数，设置为0时，字号会调整至内容能完全展示"),
            }, "元素的样式和布局属性")
        },
        "button": {
            "style": new PropertyInfo({
                "title": new PropertyInfo({
                    "normal": new PropertyInfo(BasicType.String, "普通状态的样式"),
                    "highlighted": new PropertyInfo(BasicType.String, "按下状态的样式"),
                    // "disabled": new PropertyInfo(BasicType.String, "禁用状态的样式"),
                    // "selected": new PropertyInfo(BasicType.String, "选择状态的样式"),
                }, "显示的文字"),
                "image": new PropertyInfo({
                    "normal": new PropertyInfo(BasicType.String, "普通状态的样式"),
                    "highlighted": new PropertyInfo(BasicType.String, "按下状态的样式"),
                    // "disabled": new PropertyInfo(BasicType.String, "禁用状态的样式"),
                    // "selected": new PropertyInfo(BasicType.String, "选择状态的样式"),
                }, "显示的图片，只能为本地图片，图片固定显示在文字左边。支持状态"),
                "background-image": new PropertyInfo({
                    "normal": new PropertyInfo(BasicType.String, "普通状态的样式"),
                    "highlighted": new PropertyInfo(BasicType.String, "按下状态的样式"),
                    // "disabled": new PropertyInfo(BasicType.String, "禁用状态的样式"),
                    // "selected": new PropertyInfo(BasicType.String, "选择状态的样式"),
                }, "按钮背景图片，只能为本地图片，也可以设置为颜色。支持状态"),
                "title-color": new PropertyInfo({
                    "normal": new PropertyInfo(MistCompletionProvider.colors, "普通状态的样式"),
                    "highlighted": new PropertyInfo(MistCompletionProvider.colors, "按下状态的样式"),
                    // "disabled": new PropertyInfo(MistCompletionProvider.colors, "禁用状态的样式"),
                    // "selected": new PropertyInfo(MistCompletionProvider.colors, "选择状态的样式"),
                }, "文字颜色。默认为黑色"),
                "font-size": new PropertyInfo(BasicType.Number, "字体大小。"),
                "font-name": new PropertyInfo(BasicType.String, "字体名。默认为系统字体"),
                "font-style": new PropertyInfo(["ultra-light", "thin", "light", "normal", "medium", "bold", "heavy", "black", "italic", "bold-italic"], "字体样式"),
                "enlarg-size": new PropertyInfo(BasicType.Number, `放大按钮的点击区域。如：
                "enlarge-size": 5 上下左右各放大 5
                "enlarge-size": [5, 10] 左右放大 5，上下放大 10`),
            }, "元素的样式和布局属性")
        },
        "image": {
            "style": new PropertyInfo({
                "image": new PropertyInfo(BasicType.String, "显示的图片名，只能使用本地图片。规则同 [UIImage imageNamed:]"),
                "image-url": new PropertyInfo(BasicType.String, "网络图片地址"),
                "error-image": new PropertyInfo(BasicType.String, `网络图片下载失败时显示的图片，只能使用本地图片，如果没有指定则显示 image。
                注意：image-url 为空时，将会使用 image 而不是 error-image`),
                "content-mode": new PropertyInfo({
                    "center": "图片不缩放，居中显示",
                    "scale-to-fill": "图片缩放至元素尺寸，不保留宽高比",
                    "scale-aspect-fit": "图片按长边缩放，图片能完全显示，可能填不满元素",
                    "scale-aspect-fill": "图片按短边缩放，图片能填满元素，可能显示不完全"
                }, "图片缩放模式"),
            }, "元素的样式和布局属性"),
            "on-complete": new PropertyInfo(Event, "图片下载完成时触发"),
        },
        "scroll": {
            "style": new PropertyInfo({
                "scroll-direction": new PropertyInfo({
                    "none": "水平方向和竖直方向都不允许滚动",
                    "horizontal": "水平方向滚动",
                    "vertical": "竖直方向滚动",
                    "both": "水平方向和竖直方向都可以滚动"
                }, `滚动方向。默认为 horizontal。
                与 direction 不同，direction 表示子元素实际布局方向，scroll-direction表示该方向上不限制子元素的尺寸`),
                "scroll-enabled": new PropertyInfo(BasicType.Boolean, "是否允许用户拖动"),
            }, "元素的样式和布局属性")
        },
        "paging": {
            "style": new PropertyInfo({
                "direction": new PropertyInfo({
                    "horizontal": "水平方向滚动",
                    "vertical": "竖直方向滚动",
                }, "滚动方向。默认为 horizontal。"),
                "scroll-enabled": new PropertyInfo(BasicType.Boolean, "是否允许用户拖动。默认为 true"),
                "paging": new PropertyInfo(BasicType.Boolean, "是否以分页的方式滚动。默认为 true"),
                "auto-scroll": new PropertyInfo(BasicType.Number, "自动滚动的时间间隔，单位为秒，为 0 表示不自动滚动。默认为 0"),
                "animation-duration": new PropertyInfo(BasicType.Number, "自动滚动时滚动动画的持续时间，单位为秒，默认为 0.3 秒"),
                "infinite-loop": new PropertyInfo(BasicType.Boolean, "是否循环滚动。默认为 false"),
                "page-control": new PropertyInfo(BasicType.Boolean, "是否显示 Page Control。默认为 false"),
                "page-control-scale": new PropertyInfo(BasicType.Number, "Page Control 缩放倍率，用于控制 Page Control 的大小。默认为 1"),
                "page-control-color": new PropertyInfo(MistCompletionProvider.colors, "Page Control 圆点的颜色。默认为半透明的白色"),
                "page-control-selected-color": new PropertyInfo(MistCompletionProvider.colors, "Page Control 当前页圆点的颜色。默认为白色"),
                "page-control-margin-left": new PropertyInfo(BasicType.Number, `Page Control 距容器边缘的左边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
                默认值为 auto。`),
                "page-control-margin-right": new PropertyInfo(BasicType.Number, `Page Control 距容器边缘的右边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
                默认值为 auto。`),
                "page-control-margin-top": new PropertyInfo(BasicType.Number, `Page Control 距容器边缘的上边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
                默认值为 auto。`),
                "page-control-margin-bottom": new PropertyInfo(BasicType.Number, `Page Control 距容器边缘的下边边距，用于控制 Page Control 的位置，跟 fixed 元素的 margin 规则相同。
                默认值为 auto。`),
            }, "元素的样式和布局属性"),
            "on-switch": new PropertyInfo(Event, "（手动或自动）翻页时触发"),
        },
        "indicator": {
            "style": new PropertyInfo({
                "color": new PropertyInfo(MistCompletionProvider.colors, "菊花的颜色，默认为白色"),
            }, "元素的样式和布局属性")
        },
        "line": {
            "style": new PropertyInfo({
                "color": new PropertyInfo(MistCompletionProvider.colors, "线条的颜色，默认为黑色"),
                "dash-length": new PropertyInfo(BasicType.Number, "虚线的线段长度，不设置时为实线"),
                "space-length": new PropertyInfo(BasicType.Number, "虚线的空白长度，不设置时为实线"),
            }, "元素的样式和布局属性")
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
        if (node) {
            if (node.type == 'object') {
                let childrenNode = this.getProp(node, 'children');
                let typeNode = this.getProp(node, 'type');
                return typeNode ? typeNode.value : childrenNode ? 'stack' : 'node';
            }
            else if (node.type == 'string' && (<string>node.value).match(/^\${.+}$/)) {
                return "exp";
            }
        }
        return "unknown";
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
                    return `<${k}> ` + (info instanceof PropertyInfo ? info.desc || 'no description' : 'no description');
                }).join('\n\n');
                let firstInfo = value[types[0]];
                allProperties[key] = new PropertyInfo(firstInfo instanceof PropertyInfo ? firstInfo.type : BasicType.Other, desc);
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
                if (info.type instanceof Array) {
                    (<Array<string>>info.type).forEach(v => properties[v] = new PropertyInfo(BasicType.String, ""));
                }
                else {
                    Object.keys(info.type).forEach(k => properties[k] = new PropertyInfo(BasicType.String, info.type[k]));
                }
            }
        }

        return properties;
    }

    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        let location = json.getLocation(document.getText(), document.offsetAt(position));
        let rootNode = parseJson(document.getText());
        let properties = this.getProperties(rootNode, location);
        
        let node = json.findNodeAtLocation(rootNode, location.path);
        if (location.isAtPropertyKey && node.parent.type == 'property') {
            node = node.parent.children[0];
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

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        let location = json.getLocation(document.getText(), document.offsetAt(position));
        let rootNode = parseJson(document.getText());
        let properties = this.getProperties(rootNode, location);

        return Object.keys(properties).map(p => {
            let item = new vscode.CompletionItem(p, vscode.CompletionItemKind.Property);
            let info: PropertyInfo = properties[p];
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
