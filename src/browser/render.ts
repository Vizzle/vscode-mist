import * as flex from '../../lib/FlexLayout';

declare const $: any;

var config = {
    scale: 1
};

function length(obj): flex.Length {
    if (typeof(obj) === 'number') {
        return new flex.Length(obj);
    }
    else if (typeof(obj) === 'string') {
        if (obj === 'auto') {
            return new flex.Length(flex.Undefined, flex.LengthTypeAuto);
        }
        else if (obj === 'content') {
            return new flex.Length(flex.Undefined, flex.LengthTypeContent);
        }

        var match = obj.match(/^([\d.]+)(.*)$/);
        if (!match) {
            return new flex.Length(0);
        }
        var value = parseFloat(match[1]);
        var suffix = match[2];
        if (suffix === '%') {
            return new flex.Length(value, flex.LengthTypePercent);
        }
        else {
            switch (suffix) {
                case 'px': value /= config.scale; break;
                case 'cm': value *= 96 / 2.54;  break;
                case 'mm': value *= 96 / 2.54 / 10;  break;
                case 'q': value *= 96 / 2.54 / 40;  break;
                case 'in': value *= 96;  break;
                case 'pc': value *= 96 / 6;  break;
                case 'pt': value *= 96 / 72;  break;
            }
            return new flex.Length(value);
        }
    }
    return new flex.Length(0);
}

function lengthString(length: flex.Length) {
    switch (length.type) {
        case flex.LengthTypeAuto: return 'auto';
        case flex.LengthTypeContent: return 'content';
        case flex.LengthTypePercent: return length.value + '%';
        default: return length.value + '';
    }
}

function direction(obj) {
    switch (obj) {
        default: case 'horizontal': return flex.Horizontal;
        case 'vertical': return flex.Vertical;
        case 'horizontal-reverse': return flex.HorizontalReverse;
        case 'vertical-reverse': return flex.VerticalReverse;
    }
}

function directionString(direction) {
    switch (direction) {
        default: case flex.Horizontal: return 'horizontal';
        case flex.Vertical: return 'vertical';
        case flex.HorizontalReverse: return 'horizontal-reverse';
        case flex.VerticalReverse: return 'vertical-reverse';
    }
}

function wrap(obj) {
    switch (obj) {
        case 'wrap': case true: return flex.Wrap;
        default: case 'nowrap': case false: return flex.NoWrap;
        case 'wrap-reverse': return flex.WrapReverse;
    }
}

function wrapString(wrap) {
    switch (wrap) {
        case flex.Wrap: return 'wrap';
        default: case flex.NoWrap: return 'nowrap';
        case flex.WrapReverse: return 'wrap-reverse';
    }
}

function align(obj) {
    switch (obj) {
        case "auto": return flex.Inherit;
        case "start": return flex.Start;
        case "center": return flex.Center;
        case "end": return flex.End;
        case "stretch": return flex.Stretch;
        case "space-between": return flex.SpaceBetween;
        case "space-around": return flex.SpaceAround;
        case "baseline": return flex.Baseline;
    }
}

function alignString(align) {
    switch (align) {
        case flex.Inherit: return "auto";
        case flex.Start: return "start";
        case flex.Center: return "center";
        case flex.End: return "end";
        case flex.Stretch: return "stretch";
        case flex.SpaceBetween: return "space-between";
        case flex.SpaceAround: return "space-around";
        case flex.Baseline: return "baseline";
    }
}

function convertColor(color: string): string {
    if (color === 'clear') {
        return 'transparent';
    }

    if (!color.startsWith('#')) {
        return color;
    }

    if (color.length === 5) {
        var a = Number.parseInt(color.substr(1, 1), 16) / 15.0;
        var r = Number.parseInt(color.substr(2, 1), 16) * 255 / 15;
        var g = Number.parseInt(color.substr(3, 1), 16) * 255 / 15;
        var b = Number.parseInt(color.substr(4, 1), 16) * 255 / 15;
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    }
    else if (color.length === 9) {
        var a = Number.parseInt(color.substr(1, 2), 16) / 255.0;
        var r = Number.parseInt(color.substr(3, 2), 16);
        var g = Number.parseInt(color.substr(5, 2), 16);
        var b = Number.parseInt(color.substr(7, 2), 16);
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    }

    return color;
}

function convertLength(l) {
    function lengthStringHtml(length) {
        switch (length.type) {
            case flex.LengthTypeAuto: return 'auto';
            case flex.LengthTypeContent: return 'content';
            case flex.LengthTypePercent: return length.value + '%';
            default: return length.value + 'px';
        }
    }
    return lengthStringHtml(length(l));
}

function setBasicStyle(el: HTMLElement, style) {
    if (style["background-color"]) el.style.backgroundColor = convertColor(style["background-color"]);
    el.style.borderWidth = convertLength(style["border-width"] || 0);
    el.style.borderStyle = "solid";
    if (style["border-color"]) el.style.borderColor = convertColor(style["border-color"]);
    if (style["corner-radius"]) el.style.borderRadius = convertLength(style["corner-radius"]);
    if (style["clip"]) {
        el.style.overflow = "hidden";
        // fixes overflow:hidden. reference: https://gist.github.com/adamcbrewer/5859738
        el.style["-webkit-mask-image"] = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA5JREFUeNpiYGBgAAgwAAAEAAGbA+oJAAAAAElFTkSuQmCC)";
    }
}

function setResult(el: HTMLElement, result) {
    el.style.top = (result.top || 0) + "px";
    el.style.left = (result.left || 0) + "px";
    el.style.width = el.style.minWidth = (result.width || 0) + "px";
    el.style.height = el.style.minHeight = (result.height || 0) + "px";
    el.style.paddingLeft = (result.paddingLeft || 0) + "px";
    el.style.paddingTop = (result.paddingTop || 0) + "px";
    el.style.paddingRight = (result.paddingRight || 0) + "px";
    el.style.paddingBottom = (result.paddingBottom || 0) + "px";
}

function setTextStyle(el: HTMLElement, style) {
    function fixHtml(text) {
        return text.replace(/ size\s*=\s*(['"])(\d+)\1/gm, ' style="font-size:$2px"');
    }
    
    var text = style.text;
    if (text === undefined) {
        text = "";
    }
    else if (typeof text !== "string") {
        text = text + "";
    }
    el.textContent = text;
    if ("html-text" in style) el.innerHTML = fixHtml(style["html-text"]);

    el.style.fontSize = (style['font-size'] || 14) + 'px';
    if ("color" in style) el.style.color = convertColor(style.color);
    if ("font-name" in style) el.style.fontFamily = style["font-name"];
    if ("alignment" in style) el.style.textAlign = style["alignment"];
    if ("kern" in style) el.style.letterSpacing = style["kern"] + "px";
    if ("line-spacing" in style) el.style.lineHeight = (style['font-size'] || 14) * 1.15 + style['line-spacing'] + 'px';

    var wrapMode = style["line-break-mode"];
    if ("char" === wrapMode) {
        el.style.wordBreak = "break-all";
    } else {
        el.style.wordBreak = "break-word";
    }

    var truncationMode = style["truncation-mode"];
    if ("clip" === truncationMode) {
        el.style.overflow = "hidden";
        el.style.textOverflow = "clip";
    }
    else {
        el.style.overflow = "hidden";
        el.style.textOverflow = "ellipsis";
    }

    var lines = "lines" in style ? parseInt(style["lines"]) : 1;
    el.style.whiteSpace = lines === 1 ? "pre" : "pre-wrap";
    if (lines > 1) {
        // 只支持webkit内核
        el.style["-webkit-line-clamp"] = lines;
        el.style["-webkit-box-orient"] = "vertical";
        el.style["display"] = "-webkit-box";
    }
    
    switch (style["font-style"]) {
        case "ultra-light":
            el.style.fontWeight = "100";
            break;
        case "thin":
            el.style.fontWeight = "200";
            break;
        case "light":
            el.style.fontWeight = "300";
            break;
        case "normal":
            el.style.fontWeight = "400";
            break;
        case "medium":
            el.style.fontWeight = "500";
            break;
        case "bold":
            el.style.fontWeight = "600";
            break;
        case "heavy":
            el.style.fontWeight = "800";
            break;
        case "black":
            el.style.fontWeight = "900";
            break;
        case "italic":
            el.style.fontStyle = "italic";
            break;
        case "bold-italic":
            el.style.fontWeight = "600";
            el.style.fontStyle = "italic";
            break;
    }
}

var BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

function setImageStyle(el: HTMLImageElement, style) {
    if (style["content-mode"] === "scale-aspect-fit") {
        el.style["object-fit"] = "contain";
    }
    else if (style["content-mode"] === "scale-aspect-fill") {
        el.style["object-fit"] = "cover";
    }
    else if (style["content-mode"] === "center") {
        el.style["object-fit"] = "none";
    }
    else if (style["content-mode"] === "left") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "left";
    }
    else if (style["content-mode"] === "right") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "right";
    }
    else if (style["content-mode"] === "top") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "top";
    }
    else if (style["content-mode"] === "top-left") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "top left";
    }
    else if (style["content-mode"] === "top-right") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "top right";
    }
    else if (style["content-mode"] === "bottom") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "bottom";
    }
    else if (style["content-mode"] === "bottom-left") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "bottom left";
    }
    else if (style["content-mode"] === "bottom-right") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "bottom right";
    }

    function onError() {
        var errorImage = style["error-image"];
        if (!(errorImage in imagesCache)) {
            errorImage = style["image"];
            if (!(errorImage in imagesCache)) {
                errorImage = BLANK_IMAGE;
            }
        }
        el.srcset = errorImage;
        if (el.srcset.startsWith('file')) {
            el.srcset = getSrcset(el.srcset);
        }
    }

    if (style["image"]) el.srcset = getSrcset(style["image"]);
    if ("image-url" in style) {
        var url = style["image-url"];
        if (url.match(/^[-0-9a-zA-Z]+$/)) {
            $.post('http://42.156.141.73/django-debug/j_spring_security_check', {'j_username' : 'aliwallet', 'j_password' : ''}, function(data) {
                var djangoUrl = 'http://42.156.141.73/django-debug/debug/django.jsp?fileId=' + url;
                $.get(djangoUrl, function(data, status){
                    var re = /href\s*=\s*"(.*image\?.*?)"/;
                    var match = data.match(re);
                    if (match) {
                        el.srcset = match[1];
                    }
                }).fail(onError);
            }).fail(onError);
        }
        else {
            el.srcset = url;
        }
    }
    el.onerror = onError;
    if (!el.srcset || el.srcset === '') {
        el.srcset = BLANK_IMAGE;
    }
}

function setButtonStyle(el: HTMLElement, style) {
    function unwrap(obj) {
        return obj instanceof Object ? obj.normal : obj;
    }

    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";

    if ("image" in style) {
        var image = document.createElement('img');
        image.srcset = getSrcset(unwrap(style["image"]));
        image.onerror = function() {
            image.srcset = BLANK_IMAGE;
        };
        el.appendChild(image);
    }

    if ("title" in style) {
        var text = document.createElement('div');
        text.textContent = unwrap(style["title"]) || "";
        text.style.textAlign = "center";
        if ("title-color" in style) text.style.color = convertColor(unwrap(style["title-color"]));
        if ("font-size" in style) text.style.fontSize = convertLength(style["font-size"]);
        if ("font-name" in style) text.style.fontFamily = style["font-name"];
        el.appendChild(text);
    }
    
    if ("background-image" in style) el.style.background = convertColor(unwrap(style["background-image"]));
}

function setLineStyle(el: HTMLElement, style) {
    if ('dash-length' in style) el.setAttribute('data-dash-length', style['dash-length']);
    if ('space-length' in style) el.setAttribute('data-space-length', style['space-length']);
    if ('color' in style) el.setAttribute('data-line-color', convertColor(style['color']));
    el.className = 'line';
}

function setScrollStyle(el: HTMLElement, style, result) {
    var scrollDirection = style["scroll-direction"] || "horizontal";
    var horScroll = scrollDirection === "horizontal" || scrollDirection === "both";
    var verScroll = scrollDirection === "vertical" || scrollDirection === "both";
    if (horScroll) el.style.overflowX = "scroll";
    if (verScroll) el.style.overflowY = "scroll";
    var blank = document.createElement('div');
    blank.style.width = (result.scrollWidth || 0) + 'px';
    blank.style.height = (result.scrollHeight || 0) + 'px';
    el.appendChild(blank);
}

function elementFromLayout(layout): HTMLElement {
    var type = layout.type;
    var tag;
    if (type === 'image') {
        tag = 'img';
    }
    else if (type === 'line') {
        tag = "canvas";
    }
    else {
        tag = 'div';
    }
    var el: HTMLElement = document.createElement(tag);
    el.style.boxSizing = "border-box";
    var style = layout.style || {};

    if (type === 'text') {
        setTextStyle(el, style);
    }
    else if (type === 'image') {
        setImageStyle(<HTMLImageElement>el, style);
    }
    else if (type === 'button') {
        setButtonStyle(el, style);
    }
    else if (type === 'line') {
        (<HTMLCanvasElement>el).width = layout.result.width * window.devicePixelRatio;
        (<HTMLCanvasElement>el).height = layout.result.height * window.devicePixelRatio;
        setLineStyle(el, style);
    }
    else if (type === 'node') {
        
    }
    else if (type === 'stack') {
        
    }
    else if (type === 'scroll') {
        
    }
    else if (type === 'paging') {
        
    }
    else {
        el.textContent = type;
    }

    if (type === 'text') {
        el.style.position = "relative";
        var container = document.createElement('div');
        container.appendChild(el);
        container.style.boxSizing = "border-box";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        var justifyContent = "center";
        if ("vertical-alignment" in style) {
            var verticalAlignment = style["vertical-alignment"];
            justifyContent = {
                "top": "flex-start",
                "center": "center",
                "bottom": "flex-end"
            }[verticalAlignment] || justifyContent;
        }
        container.style.justifyContent = justifyContent;
        el = container;
    }

    setBasicStyle(el, style);

    if (type === 'scroll') {
        setScrollStyle(el, style, layout.result || {});
    }

    return el;
}

var imagesCache: {[name: string]: HTMLImageElement} = {};
function loadImages(imageFiles: string[]) {
    var imagePromises = [];
    function loadImage(file: string) {
        if (file in imagesCache) {
    
        }
        else {
            imagePromises.push(new Promise(function (resolve, reject) {
                var image = new Image();
                image.src = file;
                image.onload = resolve;
                image.onerror = ev => {
                    delete imagesCache[file];
                    resolve(ev);
                };
                imagesCache[file] = image;
            }));
        }
    }
    for (var i in imageFiles) {
        loadImage(imageFiles[i]);
    }
    return imagePromises;
}

function getSrcset(file: string) {
    var scale = config.scale;
    var index = file.indexOf('?');
    if (index >= 0) {
        scale = parseInt(file.substr(index + 1));
    }
    return file + ' ' + scale + 'x';
}

function imageSize(file: string) {
    var scale = config.scale;
    var index = file.indexOf('?');
    if (index >= 0) {
        scale = parseInt(file.substr(index + 1));
    }
    var image = imagesCache[file];
    if (!image) return new flex.Size(0, 0);
    return new flex.Size(image.width / scale, image.height / scale);
}

type MeasureFunc = (layout, constrainedSize: flex.Size) => flex.Size;

var measureFuncs: { [type: string]: MeasureFunc } = {
    text: function (layout, constrainedSize) {
        var el = elementFromLayout(layout);
        el.style.width = "auto";
        el.style.height = "auto";
        el.style.maxWidth = constrainedSize.width + "px";
        el.style.maxHeight = constrainedSize.height + "px";
        el.style.position = "absolute";
        document.body.appendChild(el);
        var rect = el.getBoundingClientRect();
        var size = new flex.Size(Math.ceil(rect.width), Math.ceil(rect.height));
        var style = layout.style || {};
        if ("line-spacing" in style) {
            size.height -= style["line-spacing"];
        }
        el.remove();
        return size;
    },
    image: function (layout, constrainedSize) {
        var image = (layout.style || {}).image;
        if (image) {
            return imageSize(image);
        }
        return new flex.Size(0, 0);
    },
    button: function (layout, constrainedSize) {
        var el = elementFromLayout(layout);
        el.style.width = "auto";
        el.style.height = "auto";
        el.style.maxWidth = constrainedSize.width + "px";
        el.style.maxHeight = constrainedSize.height + "px";
        el.style.position = "absolute";
        document.body.appendChild(el);
        var rect = el.getBoundingClientRect();
        var size = new flex.Size(Math.ceil(rect.width), Math.ceil(rect.height));
        el.remove();
        return size;
    },
};

function didLayout(layout) {
    var node: flex.Node = layout.node;
    layout.result = {
        "left": node.resultLeft,
        "top": node.resultTop,
        "width": node.resultWidth,
        "height": node.resultHeight,
    };
    if (layout.type && layout.type === 'text') {
        Object.assign(layout.result, {
            "paddingLeft": node.resultPaddingLeft,
            "paddingTop": node.resultPaddingTop,
            "paddingRight": node.resultPaddingRight,
            "paddingBottom": node.resultPaddingBottom,
        });
    }
    for (var i = 0; i < node.childrenCount; i++) {
        didLayout(layout.children[i]);
    }
}

function nodeFromLayout(l) {
    var node = new flex.Node();
    l.node = node;
    if ('type' in l) {
        var measure = measureFuncs[l.type];
        if (measure) node.setMeasure(function(constrainedSize) { return measure(l, constrainedSize); });
    }
    var style = l.style;
    function bind(func, layoutProp, nodeProp = null) {
        if (!nodeProp) nodeProp = layoutProp;
        if (layoutProp in style) {
            var value = style[layoutProp];
            if (func) value = func(value);
            if (value !== undefined) {
                if (nodeProp instanceof Array) {
                    for (var i in nodeProp) {
                        node[nodeProp[i]] = value;
                    }
                }
                else {
                    node[nodeProp] = value;
                }
            }
        }
    }
    if (style) {
        bind(length, 'width');
        bind(length, 'height');
        bind(length, 'min-width', 'minWidth');
        bind(length, 'min-height', 'minHeight');
        bind(length, 'max-width', 'maxWidth');
        bind(length, 'max-height', 'maxHeight');
        bind(length, 'margin', ['marginTop', 'marginLeft', 'marginRight', 'marginBottom']);
        bind(length, 'margin-top', 'marginTop');
        bind(length, 'margin-left', 'marginLeft');
        bind(length, 'margin-right', 'marginRight');
        bind(length, 'margin-bottom', 'marginBottom');
        bind(length, 'padding', ['paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom']);
        bind(length, 'padding-top', 'paddingTop');
        bind(length, 'padding-left', 'paddingLeft');
        bind(length, 'padding-right', 'paddingRight');
        bind(length, 'padding-bottom', 'paddingBottom');
        bind(null, 'flex-grow', 'flexGrow');
        bind(null, 'flex-shrink', 'flexShrink');
        bind(length, 'flex-basis', 'flexBasis');
        bind(null, 'fixed');
        bind(direction, 'direction');
        bind(wrap, 'wrap');
        bind(align, 'align-items', 'alignItems');
        bind(align, 'align-self', 'alignSelf');
        bind(align, 'align-content', 'alignContent');
        bind(align, 'justify-content', 'justifyContent');
        bind(length, 'spacing');
        bind(length, 'line-spacing', 'lineSpacing');
        bind(null, 'lines');
        bind(null, 'items-per-line', 'itemsPerLine');
    }

    l.didLayout = function(){
        didLayout(l);
    };
    
    if (l.children instanceof Array) {
        if (l.type === 'scroll' && l.children.length > 0) {
            l.didLayout = function() {
                didLayout(l);
                for (var i in l.children) {
                    var child = nodeFromLayout(l.children[i]);
                    node.add(child);
                }
                var scrollDirection = l.style["scroll-direction"] || "horizontal";
                var horScroll = scrollDirection === "horizontal" || scrollDirection === "both";
                var verScroll = scrollDirection === "vertical" || scrollDirection === "both";
                node.width = horScroll ? length("auto") : length(l.result.width);
                node.height = verScroll ? length("auto") : length(l.result.height);
                node.layoutWithScale(node.width.value, node.height.value, config.scale);
                l.result.scrollWidth = node.resultWidth;
                l.result.scrollHeight = node.resultHeight;
                for (var i in l.children) {
                    l.children[i].didLayout();
                }
            };
        }
        else if (l.type === 'paging' && l.children.length > 0) {
            l.didLayout = function() {
                didLayout(l);
                var width = l.result.width;
                var height = l.result.height;
                for (var i in l.children) {
                    var child = l.children[i];
                    var childNode = nodeFromLayout(child);
                    childNode.layoutWithScale(width, height, config.scale);
                    child.didLayout();
                }
            };
        }
        else {
            for (var i in l.children) {
                var child = nodeFromLayout(l.children[i]);
                node.add(child);
            }
            l.didLayout = function() {
                didLayout(l);
                for (var i in l.children) {
                    l.children[i].didLayout();
                }
            };
        }
    }

    return node;
}

function layout(layout, width: number, height: number) {
    var node = nodeFromLayout(layout);
    node.layoutWithScale(width, height, config.scale);
    layout.didLayout();
}

export function render(_layout, clientWidth: number, scale: number, images: string[]) {
    if (!_layout) return Promise.reject('empty layout');
    config.scale = scale;
    return Promise.all(loadImages(images)).then(function() {
        layout(_layout, clientWidth, NaN);
        function _render(l) {
            var el = elementFromLayout(l);
            el.style.position = "absolute";
            el.classList.add('mist-node');
            el.setAttribute('data-node-index', l['node-index']);
            setResult(el, l.result);
            if (l.type && l.type === 'text') {
                var style = l.style || {};
                if ("line-spacing" in style) {
                    var e = <HTMLElement>el.children.item(0);
                    e.style.marginTop = -style["line-spacing"] / 2 + 'px';
                    e.style.marginBottom = -style["line-spacing"] / 2 + 'px';
                }
            }
            if (l.children instanceof Array) {
                // TODO
                if (l.type === 'paging' && l.children && l.children.length > 1) {
                    l.children = l.children.slice(0, 1);
                }
                for (var i in l.children) {
                    // 避免 border 占据空间
                    if ((l.style || {})['border-width']) {
                        var borderWidth = parseFloat(lengthString(length((l.style || {})['border-width'])));
                        l.children[i].result.left -= borderWidth;
                        l.children[i].result.top -= borderWidth;
                    }
                    el.appendChild(_render(l.children[i]));
                }
            }
            return el;
        }
        return _render(_layout);
    });
}

export function postRender(el: HTMLElement) {
    var lines = el.getElementsByClassName('line');
    for (var i = 0; i < lines.length; i++) {
        var canvas = <HTMLCanvasElement>lines.item(i);
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;
        var lineWidth = Math.min(width, height);

        var context = canvas.getContext('2d');
        context.scale(window.devicePixelRatio, window.devicePixelRatio)
        context.beginPath();
        context.lineWidth = lineWidth;
        context.strokeStyle = canvas.getAttribute('data-line-color') || 'transparent';
        var dashLength = parseFloat(canvas.getAttribute('data-dash-length') || '0');
        var spaceLength = parseFloat(canvas.getAttribute('data-space-length') || '0');
        if (dashLength > 0 && spaceLength > 0) {
            context.setLineDash([dashLength, spaceLength]);
        }
        if (width > height) {
            context.moveTo(0, height / 2);
            context.lineTo(width, height / 2);
        }
        else {
            context.moveTo(width / 2, 0);
            context.lineTo(width / 2, height);
        }
        context.stroke();
    }
}