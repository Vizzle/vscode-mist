
export enum BasicType {
    Object,
    Array,
    Integer,
    Number,
    String,
    Boolean,
    Enum,
    Color,
    Other,
}

class EnumProperty { [key: string]: string };
class ObjectProperty { [key: string]: PropertyInfo };
type Enum = any[] | EnumProperty;
type PropertyType = BasicType | Enum | ObjectProperty;

export class PropertyInfo {
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

let actions = {
    "http-request": new PropertyInfo({
        "url": new PropertyInfo(BasicType.String, "请求的 URL"),
        "method": new PropertyInfo({
            "GET": "",
            "POST": "",
        }, "请求方式"),
        "body": new PropertyInfo(BasicType.Other, "请求发送的 body"),
        "timeout": new PropertyInfo(BasicType.Number, "超时时间（秒）"),
        "cache": new PropertyInfo(BasicType.Boolean, "是否缓存"),
    }, "发起 HTTP 请求"),
    "url": new PropertyInfo({
        "url": new PropertyInfo(BasicType.String, "打开的 URL"),
    }, "打开指定的 URL"),
    "update-state": new PropertyInfo({
        
    }, "更新状态。params 应该为一个字典，将状态中对应的值更新。注意不是替换整个状态，只是更改对应的 key"),
    "set-state": new PropertyInfo({
        
    }, "改变状态。params 应该为一个字典，替换原有状态"),
    "alert": new PropertyInfo({
        "title": new PropertyInfo(BasicType.String, "标题"),
        "message": new PropertyInfo(BasicType.String, "消息内容"),
        "buttons": new PropertyInfo(BasicType.Array, "按钮标题（取消按钮标题请设置 `cancel` 属性）。默认为一个 OK 按钮"),
        "cancel": new PropertyInfo(BasicType.String, "取消按钮的标题"),
    }, `显示 Alert。返回值为
{
    "index": 0,     // 按下的按钮索引
    "title": "OK",  // 按下的按钮标题
    "cancel": false // 是否按下了取消按钮
}
    `),
    "delay": new PropertyInfo({
        "time": new PropertyInfo(BasicType.Number, "延迟时间（秒）"),
    }, "延迟一定时间后执行 `success`"),
    "timer": new PropertyInfo({
        "time": new PropertyInfo(BasicType.Number, "时间间隔（秒）"),
        "repeat": new PropertyInfo(BasicType.Boolean, "是否重复触发"),
    }, "开始计时器。触发 `success`"),
    "set-cache": new PropertyInfo({
        
    }, "设置 NSUserDefaulst"),
    "pop": new PropertyInfo({
        "animated": new PropertyInfo(BasicType.Boolean, "是否需要动画"),
    }, "调用当前 Navigation Controller 的 pop 方法"),
    "notify": new PropertyInfo({
        "name": new PropertyInfo(BasicType.String, "通知名称"),
        "userInfo": new PropertyInfo(BasicType.Other, "userInfo"),
    }, "发送全局通知（NSNotification）"),
    "js": new PropertyInfo({
        "script": new PropertyInfo(BasicType.String, "Javascript 代码"),
    }, "执行 Javascript 代码并返回值"),
    "animation": new PropertyInfo({
        "key": new PropertyInfo(BasicType.String, "动画的 key，一个 key 只能有一个动画"),
        "delay": new PropertyInfo(BasicType.Number, "动画开始的等待时间（秒）"),
        "tag": new PropertyInfo(BasicType.Integer, "播放动画的 view 的 tag，不设置则在触发事件的 view 上播放"),
        "start": new PropertyInfo(BasicType.Other, "动画开始的事件"),
        "end": new PropertyInfo(BasicType.Other, "动画结束的事件"),
        "duration": new PropertyInfo(BasicType.Number, "动画时长（秒）"),
        "auto-reverses": new PropertyInfo(BasicType.Boolean, "是否自动倒放"),
        "repeat": new PropertyInfo(BasicType.Number, "动画重复次数，可以设置为小数。为 0 表示不重复"),
        "fill-mode": new PropertyInfo({
            "removed": "动画结束时不保持状态",
            "forwards": "动画结束后保持结束状态",
            "backwards": "动画开始前一直保持开始状态",
            "both": "动画开始前和结束后都保持状态",
        }, "非动画期间是否保持动画状态"),
        "removed-on-completion": new PropertyInfo(BasicType.Boolean, "动画结束后是否移除动画。默认为 true"),
        "speed": new PropertyInfo(BasicType.Number, "动画播放的速度。默认为 1"),
        "time-offset": new PropertyInfo(BasicType.Number, "动画偏移时间（秒）"),
        "timing-function": new PropertyInfo({
            "linear": "线性运动",
            "easeOut": "慢速结束",
            "easeIn": "慢速开始",
            "easeInEaseOut": "慢速开始，慢速结束",
        }, "动画的时间函数，控制动画的节奏。默认为 `linear`"),

        "key-path": new PropertyInfo(BasicType.String, "添加动画的属性 Key Path"),
        "from": new PropertyInfo(BasicType.Other, "动画属性的开始值。默认为 layer 的当前值"),
        "to": new PropertyInfo(BasicType.Other, "动画属性的结束值。默认为 layer 的当前值"),
        "by": new PropertyInfo(BasicType.Other, "动画属性的增加值"),

        "key-frames": new PropertyInfo(BasicType.Object, "动画的关键帧。键为时间（0～1），值为对应时间的属性值"),
        "calculation-mode": new PropertyInfo({
            "linear": "线性运动",
            "easeOut": "慢速结束",
            "easeIn": "慢速开始",
            "easeInEaseOut": "慢速开始，慢速结束",
        }, "关键帧间的插值方式。默认为 `linear`"),
        "timing-functions": new PropertyInfo(BasicType.Array, "关键帧间的时间函数，数量应该为`关键帧数 - 1`"),

        "mass": new PropertyInfo(BasicType.Other, `The mass of the object attached to the end of the spring.
The default mass is 1. Reducing this value will increase the spring effect: the attached object will be subject to more oscillations and greater overshoot, resulting in an increased settlingDuration. Decreasing the mass will reduce the spring effect: there will be fewer oscillations and a reduced overshoot, resulting in a decreased settlingDuration.`),
        "stiffness": new PropertyInfo(BasicType.Other, `The spring stiffness coefficient.
The default stiffness coefficient is 100. Increasing the stiffness reduces the number of oscillations and will reduce the settling duration. Decreasing the stiffness increases the the number of oscillations and will increase the settling duration.`),
        "damping": new PropertyInfo(BasicType.Other, `Defines how the spring’s motion should be damped due to the forces of friction.
The default value of the damping property is 10. Reducing this value reduces the energy loss with each oscillation: the animated value will overshoot the toValue and the settlingDuration may be greater than the duration. Increasing the value increases the energy loss with each duration: there will be fewer and smaller oscillations and the settlingDuration may be smaller than the duration.`),
        "initial-velocity": new PropertyInfo(BasicType.Other, `The initial velocity of the object attached to the spring.
Defaults to 0, which represents an unmoving object. Negative values represent the object moving away from the spring attachment point, positive values represent the object moving towards the spring attachment point.`),
    }, "动画"),
}

export let Event = {
    "openUrl:": new PropertyInfo(BasicType.String, "打开指定的 URL"),
    "updateState:": new PropertyInfo(BasicType.Object, "更新状态。值应该为一个字典，将状态中对应的值更新。注意不是替换整个状态，只是更改对应的 key"),
    "alert:": new PropertyInfo(BasicType.String, "显示 Alert，主要用于调试"),
    "runAction:": new PropertyInfo({
        "name": new PropertyInfo(BasicType.String, "Action 名称"),
        "params": new PropertyInfo(BasicType.Object, "触发 Action 时传入的参数"),
    }, "触发自定义 Action"),
    "postNotification:": new PropertyInfo({
        "name": new PropertyInfo(BasicType.String, "Notification 名称"),
        "userInfo": new PropertyInfo(BasicType.Object, "Notification 的 userInfo"),
    }, "发送 Notification"),

    "exposureLog:": new PropertyInfo(Log, "曝光埋点"),
    "clickLog:": new PropertyInfo(Log, "点击埋点"),

    "type": new PropertyInfo(Object.keys(actions).reduce((obj, key) => {
        obj[key] = (<PropertyInfo>actions[key]).desc;
        return obj;
    }, {}), "Action 类型"),
}

export class Properties {
    public static colors = [
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
    
    public static templateProperties = {
        "layout": new PropertyInfo(BasicType.Object, "模版的布局描述，类型为元素"),
        "controller": new PropertyInfo(BasicType.String, "模版关联的 controller 类名"),
        "data": new PropertyInfo(BasicType.Object, "值为字典，用于对数据做一些处理或适配，这里的计算结果会追加到数据"),
        "state": new PropertyInfo(BasicType.Object, "模版的初始状态"),
        "styles": new PropertyInfo(BasicType.Object, "样式表，定义一些可以被重复使用的样式，在元素中通过 class 属性引用"),
        "async-display": new PropertyInfo(BasicType.Boolean, "是否开启异步渲染"),
        "reuse-identifier": new PropertyInfo(BasicType.String, "模版在 tableview 中的复用 id，默认为模版名"),
        "identifier": new PropertyInfo(BasicType.String, "给模版指定一个 id"),
        "actions": new PropertyInfo({
            "*": new PropertyInfo(Event, "自定义 Action 的名称")
        }, "自定义 Action"),
        "notifications": new PropertyInfo({
            "*": new PropertyInfo(Event, "接收通知的名称")
        }, "接收 native 通知"),
    };

    public static baseProperties = {
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
        "identifier": new PropertyInfo(BasicType.String, "元素的 identifier，影响元素的重用"),
        "gone": new PropertyInfo(BasicType.Boolean, "为 true 时，元素不显示，且不加入布局"),
        "repeat": new PropertyInfo(BasicType.Number, "模版衍生机制。repeat 为元素重复的次数或重复的数组。注意：根节点元素使用 repeat 无效"),
        "vars": new PropertyInfo(BasicType.Object, "定义变量（宏）"),
        "class": new PropertyInfo(BasicType.String, "引用在 styles 中定义的样式。可以引用多个样式，用空格分开，靠后的样式覆盖前面的样式"),
        "children": new PropertyInfo(BasicType.Array, "容器的子元素"),
        "style": new PropertyInfo({
            "background-color": new PropertyInfo(Properties.colors, "背景颜色，默认为透明"),
            "alpha": new PropertyInfo(BasicType.Number, "元素的透明度，默认为 1"),
            "border-width": new PropertyInfo(BasicType.Number, `边框宽度，默认为 0。可以用 "1px"表示 1 像素的边框`),
            "border-color": new PropertyInfo(Properties.colors, "边框颜色，默认为黑色"),
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
        "on-update-appear": new PropertyInfo(Event, "更新状态后，元素出现时（隐藏→更新状态→显示）"),
        "on-update-disappear": new PropertyInfo(Event, "更新状态后，元素消失时（显示→更新状态→隐藏）"),
        "on-update-reuse": new PropertyInfo(Event, "更新状态后，元素复用时（显示→更新状态→显示）"),
    };

    public static nodeProperties = {
        "stack": {
            "style": new PropertyInfo({
                "highlight-background-color": new PropertyInfo(Properties.colors, "按下时的高亮颜色"),
            }, "元素的样式和布局属性")
        },
        "text": {
            "style": new PropertyInfo({
                "text": new PropertyInfo(BasicType.String, "显示的文字"),
                "html-text": new PropertyInfo(BasicType.String, "使用 HTML 表示的富文本，指定这个属性后，text 属性将被忽略"),
                "color": new PropertyInfo(Properties.colors, "文字颜色。默认为黑色"),
                "font-size": new PropertyInfo(BasicType.Number, "字体大小。"),
                "font-name": new PropertyInfo(BasicType.String, "字体名。默认为系统字体"),
                "font-style": new PropertyInfo(["ultra-light", "thin", "light", "normal", "medium", "bold", "heavy", "black", "italic", "bold-italic"], "字体样式"),
                "alignment": new PropertyInfo({
                    "left": "文字靠左边显示",
                    "center": "文字居中显示",
                    "right": "文字靠右边显示",
                    "justify": "文字两端对齐。只对多行文字有效，且最后一行文字仍然靠左显示"
                }, "文字水平对齐方式。默认为 left"),
                "vertical-alignment": new PropertyInfo({
                    "top": "文字靠上边显示",
                    "center": "文字居中显示",
                    "bottom": "文字靠下边显示",
                }, "文字竖直对齐方式。默认为 center"),
                "line-break-mode": new PropertyInfo({
                    "word": "按单词换行，尽量保证不从单词中间换行",
                    "char": "按字符换行"
                }, "文字换行方式。默认为 word"),
                "truncation-mode": new PropertyInfo({
                    "truncating-head": "文字显示不下时头部显示省略号。多行时省略号在最后一行",
                    "truncating-middle": "文字显示不下时中间显示省略号。多行时省略号在最后一行",
                    "truncating-tail": "文字显示不下时尾部显示省略号。多行时省略号在最后一行",
                    "none": "文字显示不下时不显示省略号。显示不下的文字不显示，不会出现半个字"
                }, "文字省略方式。默认为 truncating-tail"),
                "lines": new PropertyInfo(BasicType.Number, "最大行数。为 0 时，不限制行数。默认为 1"),
                "kern": new PropertyInfo(BasicType.Number, "字间距。需要注意文字的最右边也会有一个字距大小的空白，一般可以通过设置 `margin-right` 来修正。如：  \n```\n\"kern\": 5,\n\"margin-right\": -5\n```"),
                "line-spacing": new PropertyInfo(BasicType.Number, "行间距"),
                "adjusts-font-size": new PropertyInfo(BasicType.Number, "是否调整字号以适应控件的宽度，默认为false"),
                "baseline-adjustment": new PropertyInfo({
                    "none": "Adjust text relative to the top-left corner of the bounding box. This is the default adjustment.",
                    "baseline": "Adjust text relative to the position of its baseline.",
                    "center": "Adjust text based relative to the center of its bounding box.",
                }, "字体自动缩小时相对于缩小前的对齐方式。默认为 none"),
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
                    "normal": new PropertyInfo(Properties.colors, "普通状态的样式"),
                    "highlighted": new PropertyInfo(Properties.colors, "按下状态的样式"),
                    // "disabled": new PropertyInfo(Properties.colors, "禁用状态的样式"),
                    // "selected": new PropertyInfo(Properties.colors, "选择状态的样式"),
                }, "文字颜色。默认为黑色"),
                "font-size": new PropertyInfo(BasicType.Number, "字体大小。"),
                "font-name": new PropertyInfo(BasicType.String, "字体名。默认为系统字体"),
                "font-style": new PropertyInfo(["ultra-light", "thin", "light", "normal", "medium", "bold", "heavy", "black", "italic", "bold-italic"], "字体样式"),
                "enlarge-size": new PropertyInfo(BasicType.Number, `放大按钮的点击区域。如：
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
                "download-scale": new PropertyInfo(BasicType.Number, "使用 django 图片时，下载的缩放倍数"),
                "animate-count": new PropertyInfo(BasicType.Integer, "gif 图播放次数"),
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
                "page-control-color": new PropertyInfo(Properties.colors, "Page Control 圆点的颜色。默认为半透明的白色"),
                "page-control-selected-color": new PropertyInfo(Properties.colors, "Page Control 当前页圆点的颜色。默认为白色"),
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
                "color": new PropertyInfo(Properties.colors, "菊花的颜色，默认为白色"),
            }, "元素的样式和布局属性")
        },
        "line": {
            "style": new PropertyInfo({
                "color": new PropertyInfo(Properties.colors, "线条的颜色，默认为黑色"),
                "dash-length": new PropertyInfo(BasicType.Number, "虚线的线段长度，不设置时为实线"),
                "space-length": new PropertyInfo(BasicType.Number, "虚线的空白长度，不设置时为实线"),
            }, "元素的样式和布局属性")
        },
    };

}
