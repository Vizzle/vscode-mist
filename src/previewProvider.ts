
'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as JsonParser from 'jsonc-parser'
import * as color from './utils/color'
import * as fs from 'fs'
import { parseJson } from './utils/json'
import { MistDocument, MistData } from './mistDocument';
import { ImageHelper } from './imageHelper';
import { extensions } from 'vscode';

export function isMistFile(document: vscode.TextDocument) {
	return document.languageId === 'mist'
		&& document.uri.scheme !== 'mist'; // prevent processing of own documents
}

export function getMistUri(uri: vscode.Uri) {
	return uri.with({ scheme: 'mist', path: uri.path + '.rendered', query: uri.toString() });
}

class Device {
	constructor(public name: string,
				public desc: string,
				public width: number,
				public height: number,
				public scale: number) { }
}

const devices = [
	new Device("iPhone", "iPhone 1g-3GS, iPod Touch 1g-3g", 320, 480, 1),
	new Device("iPhone Retina", "iPhone 4/4S, iPod Touch 4g", 320, 480, 2),
	new Device("iPhone 5", "iPhone 5/5C/5S, iPod Touch 5g", 320, 568, 2),
	new Device("iPhone 6", "iPhone 6/6S", 375, 667, 2),
	new Device("iPhone 6 Plus", "iPhone 6+/6S+", 414, 736, 3),
	new Device("iPad", "iPad, iPad 2, iPad Mini", 768, 1024, 1),
	new Device("iPad Retina", "iPad 3/4, iPad Air 1/2, iPad Mini 2/4, iPad Pro 9.7-inch", 768, 1024, 2),
	new Device("iPad Pro 12.9-inch", "iPad Pro 12.9-inch", 1024, 1366, 2),
];

const defaultDevice = devices[3];

const SCALES = [
    { desc: '200%', scale: 2 },
    { desc: '150%', scale: 1.5 },
    { desc: '100%', scale: 1 },
    { desc: '75%', scale: 0.75 },
    { desc: '50%', scale: 0.5 },
    { desc: '33%', scale: 0.33333333333333 },
];

const DEFAULT_SCALE_INDEX = SCALES.findIndex(s => s.scale === 1);

type PreviewConfig = {
    device: Device;
    dataIndex?: number;
    scaleIndex: number;
}

export class MistContentProvider implements vscode.TextDocumentContentProvider {
	

	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
	private _waiting: boolean = false;
	private _config = new Map<string, PreviewConfig>();

	constructor(private context: vscode.ExtensionContext) { console.log(context.extensionPath)}

    private resolveImageFiles(doc, layout, scale): string[] {
        var files = [];
        function imageName(value) {
            let image = ImageHelper.imageUriWithName(doc, value, scale);
            let ret = '';
            if (image) {
                ret = image.file;
                if (image.scale !== scale) {
                    ret += '?' + image.scale;
                }
            }
            return ret;
        }
        function _resolveImageFiles(doc, layout, scale, files: string[]) {
            function convert(propertyName) {
                var value = layout.style[propertyName];
                if (value) {
                    if (typeof(value) === 'string') {
                        layout.style[propertyName] = imageName(value);
                        files.push(layout.style[propertyName]);
                    }
                    else if (typeof(value) === 'object' && value.constructor === Object) {
                        for (var key in value) {
                            value[key] = imageName(value[key]);
                            files.push(value[key]);
                        }
                    }
                }
            }
            if (layout.style) {
                convert('image');
                convert('error-image');
                convert('background-image');
                if ("html-text" in layout.style) {
                    layout.style["html-text"] = layout.style["html-text"].replace(/src\s*=\s*['"](.*?)['"]/, (s, src) => {
                        let image = ImageHelper.imageUriWithName(doc, src, scale);
                        files.push(image.file);
                        return image ? `srcset="${image.file} ${image.scale}x"` : '';
                    });
                }
            }
            if (layout.children instanceof Array) {
                for (let child of layout.children) {
                    _resolveImageFiles(doc, child, scale, files);
                }
            }
        }
        _resolveImageFiles(doc, layout, scale, files);
        return files;
    }

	private pageHtml(uri: vscode.Uri, layout: any, dataIndex: number, datas: MistData[], config: PreviewConfig, imageFiles: string[]) {
		return `
		<head>
        <link rel="stylesheet" href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <script src="https://cdn.bootcss.com/jquery/2.1.1/jquery.min.js"></script>
        <script src="https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <style type="text/css">
    
    div {
        margin: 0;
        padding: 0;
    }
    
    html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        font-family: "HanHei SC", "PingHei", "PingFang SC", "STHeitiSC-Light", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
    }

    body {
        background-color: #1e1e1e;
    }

    body.vscode-light {
        background-color: white;
    }
    
    .screen {
        min-width: ${config.device.width}px;
        height: ${config.device.height}px;
        display: flex;
        flex-direction: column;
        background-color: white;
        margin: 10px;
        box-shadow: 0px 0px 0px 1px white;
        transform: scale(${SCALES[config.scaleIndex].scale});
        transform-origin: top left;
    }

    .vscode-light .screen {
        box-shadow: 1px 2px 5px gray;
    }

    .screen-header {
        display: flex;
        flex-direction: column;
        background-color: #333;
        flex-shrink: 0;
    }

    .screen-status {
        height: 20px;
        display: flex;
        color: white;
        align-items: center;
        justify-content: center;
    }

    .screen-navi {
        height: 44px;
        display: flex;
        height: 44px;
        color: white;
        align-items: center;
        justify-content:center;
    }

    .main {
        flex-grow: 1;
        position: relative;
        overflow-x: hidden;
        overflow-y: auto;
    }

    * {
        line-height: 1.2em;
    }

    .main::-webkit-scrollbar, .main ::-webkit-scrollbar { 
        display: none;
    }

    .dot {
        width: 6px;
        height: 6px;
        margin: 1px;
        background-color: white;
        border-radius: 50%;
    }
    
    .navi-bar {
        background-color: #2c2c2c;
    }

    .vscode-light .navi-bar {
        background-color: #f3f3f3;
    }
    
    .navi-item {
        display: inline-block;
    }
    
    .active, .focus, .active.focus, :active, :focus, :active:focus {
        outline: 0 !important;
    }
    
    
    .btn, .btn:hover, .btn:active, .btn:visited, .btn:focus {
        color: white;
    }

    .btn.active, .btn:active {
        box-shadow: none;
    }
    
    .btn:hover {
        opacity: 0.8;
    }
    
    .dropdown>button {
        background-color: transparent;
        border: 0;
        color: white;
    }
    
    .vscode-light .dropdown>button {
        color: #333;
    }

    .dropdown-menu {
        max-height: 300px;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .dropdown-menu li.selected>a:before {
        content: "✓";
        position: absolute;
        margin-left: -1.1em;
    }
    .dropdown-menu li.selected>a {
        color: #E24810;
    }

    </style>
    </head>
    
    <body>
    <div style="width:100%; height:100%; display:flex; flex-direction:column">
    <div class="navi-bar">
        <div class="dropdown navi-item">
            <button type="button" class="btn dropdown-toggle" id="dropdownMenu1" 
                    data-toggle="dropdown">
                ${config.device.name}
                <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
                ${devices.map((d,i) => `
            <li role="presentation" class="${d === config.device ? 'selected' : ''}">
                <a role="menuitem" tabindex="-1" href="${encodeURI(`command:mist.changePreviewConfig?${JSON.stringify([uri.toString(), {deviceIndex: i}])}`)}">${d.name}</a>
            </li>`).join("")}
            </ul>
        </div>
        <div class="dropdown navi-item">
            <button type="button" class="btn ${datas.length == 0 ? 'disabled' : ''} dropdown-toggle" id="dropdownMenu1" 
                    data-toggle="dropdown">
                ${datas.length == 0 ? '无数据' : datas[dataIndex].description()}
                <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
                ${datas.map((d, i) => `
            <li role="presentation" class="${i == dataIndex ? 'selected' : ''}">
                <a role="menuitem" tabindex="-1" href="${encodeURI(`command:mist.changePreviewConfig?${JSON.stringify([uri.toString(), {dataIndex: i}])}`)}">${d.description()}</a>
            </li>`).join("")}
            </ul>
        </div>
        <div class="dropdown navi-item">
            <button type="button" class="btn dropdown-toggle" id="dropdownMenu1" 
                    data-toggle="dropdown">
                ${SCALES[config.scaleIndex].desc}
                <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
                ${SCALES.map((s, i) => `
            <li role="presentation" class="${i == config.scaleIndex ? 'selected' : ''}">
                <a role="menuitem" tabindex="-1" href="${encodeURI(`command:mist.changePreviewConfig?${JSON.stringify([uri.toString(), {scaleIndex: i}])}`)}">${s.desc}</a>
            </li>`).join("")}
            </ul>
        </div>
    </div>
    <script type="text/javascript">
    $(".dropdown-menu li a").click(function(){
      var selText = $(this).text();
      $(this).parents('.dropdown').find('.selected').removeClass('selected');
      $(this).parent().addClass('selected');
      $(this).parents('.dropdown').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
    });
    </script>
    
    <div style="display:flex;align-items:flex-start;overflow:auto;flex-grow:1;">
    <div class="screen">
    <div class="screen-header">
    
    <div class="screen-status">
        <div style="display:flex; height:20px; color:white; align-items:center; justify-content:center; padding-left:5px">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div style="color:white; font-size:12px; margin-left:5px;">中国移动</div>
        </div>
        <div class="screen-status-time" style="display:flex; margin:auto; color:white; font-size:12px;">上午12:00</div>
        <div style="display:flex; visibility:hidden; height:20px; color:white; align-items:center; justify-content:center; padding-left:5px">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div style="color:white; font-size:12px; margin-left:5px;">中国移动</div>
        </div>
    </div>
    <div class="screen-navi">
        <div id="preview" style="display:flex; color:white; font-size:18px;">Preview</div>
    </div>
    </div>
    <div class="main"></div>
    </div>
    </div>

    <script src="file://${this.context.extensionPath}/out/src/flex/FlexLayout.js"></script>
        <script>
var flex = FlexLayout;

function getScale() {
    // return window.devicePixelRatio;
    return ${config.device.scale};
}

function length(obj) {
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

        var match = obj.match(/^([\\d.]+)(.*)$/);
        if (!match) {
            return new flex.Length(0);
        }
        var value = match[1];
        var suffix = match[2];
        if (suffix === '%') {
            return new flex.Length(value, flex.LengthTypePercent);
        }
        else {
            switch (suffix) {
                case 'px': value /= getScale(); break;
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

function lengthString(length) {
    switch (length.type) {
        case flex.LengthTypeAuto: return 'auto';
        case flex.LengthTypeContent: return 'content';
        case flex.LengthTypePercent: return length.value + '%';
        default: return length.value + '';
    }
}

function direction(obj) {
    return {
        "horizontal": flex.Horizontal,
        "vertical": flex.Vertical,
        "horizontal-reverse": flex.HorizontalReverse,
        "vertical-reverse": flex.VerticalReverse,
    }[obj];
}

function directionString(direction) {
    switch (direction) {
        case flex.Horizontal: return 'horizontal';
        case flex.Vertical: return 'vertical';
        case flex.HorizontalReverse: return 'horizontal-reverse';
        case flex.VerticalReverse: return 'vertical-reverse';
    }
}

function wrap(obj) {
    if (obj === true) {
        return flex.Wrap;
    }
    else if (obj === false) {
        return flex.NoWrap;
    }

    return {
        "wrap": flex.Wrap,
        "nowrap": flex.NoWrap,
        "wrap-reverse": flex.WrapReverse,
    }[obj];
}

function wrapString(wrap) {
    switch (wrap) {
        case flex.Wrap: return 'wrap';
        case flex.NoWrap: return 'nowrap';
        case flex.WrapReverse: return 'wrap-reverse';
    }
}

function align(obj) {
    return {
        "auto": flex.Inherit,
        "start": flex.Start,
        "center": flex.Center,
        "end": flex.End,
        "stretch": flex.Stretch,
        "space-between": flex.SpaceBetween,
        "space-around": flex.SpaceAround,
        "baseline": flex.Baseline,
    }[obj];
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

function convertColor(color) {
    if (color === 'clear') {
        return 'transparent';
    }

    if (!color.startsWith('#')) {
        return color;
    }

    if (color.length == 5) {
        let a = Number.parseInt(color.substr(1, 1), 16) / 15.0;
        let r = Number.parseInt(color.substr(2, 1), 16) * 255 / 15;
        let g = Number.parseInt(color.substr(3, 1), 16) * 255 / 15;
        let b = Number.parseInt(color.substr(4, 1), 16) * 255 / 15;
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
    }
    else if (color.length == 9) {
        let a = Number.parseInt(color.substr(1, 2), 16) / 255.0;
        let r = Number.parseInt(color.substr(3, 2), 16);
        let g = Number.parseInt(color.substr(5, 2), 16);
        let b = Number.parseInt(color.substr(7, 2), 16);
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

function setBasicStyle(el, style) {
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

function setResult(el, result) {
    el.style.top = (result.top || 0) + "px";
    el.style.left = (result.left || 0) + "px";
    el.style.width = el.style.minWidth = (result.width || 0) + "px";
    el.style.height = el.style.minHeight = (result.height || 0) + "px";
    el.style.paddingLeft = (result.paddingLeft || 0) + "px";
    el.style.paddingTop = (result.paddingTop || 0) + "px";
    el.style.paddingRight = (result.paddingRight || 0) + "px";
    el.style.paddingBottom = (result.paddingBottom || 0) + "px";
}

function setTextStyle(el, style) {
    function fixHtml(text) {
		return text.replace(/ size\\s*=\\s*(['"])(\\d+)\\1/gm, ' style="font-size:$2px"');
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
    if ("char" == wrapMode) {
        el.style.wordBreak = "break-all";
    } else {
        el.style.wordBreak = "break-word";
    }

    var truncationMode = style["truncation-mode"];
    if ("clip" == truncationMode) {
        el.style.overflow = "hidden";
        el.style.textOverflow = "clip";
    }
    else {
        el.style.overflow = "hidden";
        el.style.textOverflow = "ellipsis";
    }

    var lines = "lines" in style ? parseInt(style["lines"]) : 1;
    el.style.whiteSpace = lines == 1 ? "pre" : "pre-wrap";
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

function setImageStyle(el, style) {
    if (style["content-mode"] == "scale-aspect-fit") {
        el.style["object-fit"] = "contain";
    }
    else if (style["content-mode"] == "scale-aspect-fill") {
        el.style["object-fit"] = "cover";
    }
    else if (style["content-mode"] == "center") {
        el.style["object-fit"] = "none";
    }
    else if (style["content-mode"] == "left") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "left";
    }
    else if (style["content-mode"] == "right") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "right";
    }
    else if (style["content-mode"] == "top") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "top";
    }
    else if (style["content-mode"] == "top-left") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "top left";
    }
    else if (style["content-mode"] == "top-right") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "top right";
    }
    else if (style["content-mode"] == "bottom") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "bottom";
    }
    else if (style["content-mode"] == "bottom-left") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "bottom left";
    }
    else if (style["content-mode"] == "bottom-right") {
        el.style["object-fit"] = "none";
        el.style["object-position"] = "bottom right";
    }

    var blankImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

    function onError() {
        el.srcset = style["error-image"] || style["image"] || blankImage;
        if (el.srcset.startsWith('file')) {
            el.srcset =getSrcset(el.srcset);
        }
    }

    if (style["image"]) el.srcset = getSrcset(style["image"]);
    if ("image-url" in style) {
        let url = style["image-url"];
        if (url.match(/^[-0-9a-zA-Z]+$/)) {
            $.post('http://42.156.141.73/django-debug/j_spring_security_check', {'j_username' : 'aliwallet', 'j_password' : ''}, function(data) {
                var djangoUrl = 'http://42.156.141.73/django-debug/debug/django.jsp?fileId=' + url;
				$.get(djangoUrl, function(data, status){
					var re = /href\\s*=\\s*"(.*image\\?.*?)"/;
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
        el.srcset = blankImage;
    }
}

function setButtonStyle(el, style) {
    function unwrap(obj) {
        return obj instanceof Object ? obj.normal : obj;
    }

    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";

    if ("image" in style) {
        var image = document.createElement('img');
        image.srcset = getSrcset(unwrap(style["image"]));
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

function setLineStyle(el, style) {
    el.setAttribute('data-dash-length', style['dash-length']);
    el.setAttribute('data-space-length', style['space-length']);
    el.setAttribute('data-line-color', convertColor(style['color']));
    el.className = 'line';
    if ("title-color" in style) el.style.color = convertColor(unwrap(style["title-color"]));
    if ("font-size" in style) el.style.fontSize = convertLength(style["font-size"]);
    if ("font-name" in style) el.style.fontFamily = style["font-name"];
    if ("background-image" in style) el.style.background = convertColor(unwrap(style["background-image"]));
}

function setScrollStyle(el, style, result) {
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

function elementFromLayout(layout) {
    var el;
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
    var el = document.createElement(tag);
    el.style.boxSizing = "border-box";
    var style = layout.style || {};

    if (type === 'text') {
        setTextStyle(el, style);
    }
    else if (type === 'image') {
        setImageStyle(el, style);
    }
    else if (type === 'button') {
        setButtonStyle(el, style);
    }
    else if (type === 'line') {
        el.width = layout.result.width;
        el.height = layout.result.height;
        setLineStyle(el, style);
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
        var justifyContent = "center"
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

var imagesCache = {};
function loadImages() {
    var imagePromises = [];
    function loadImage(file) {
        if (file in imagesCache) {
    
        }
        else {
            imagePromises.push(new Promise(function (resolve, reject) {
                var image = new Image();
                image.src = file;
                image.onload = resolve;
                image.onerror = resolve;
                imagesCache[file] = image;
            }));
        }
    }
    var imageFiles = ${JSON.stringify(imageFiles)};
    for (var i in imageFiles) {
        loadImage(imageFiles[i]);
    }
    return imagePromises;
}

function getSrcset(file) {
    let scale = getScale();
    let index = file.indexOf('?');
    if (index >= 0) {
        scale = parseInt(file.substr(index + 1));
    }
    return file + ' ' + scale + 'x';
}

function imageSize(file) {
    let scale = getScale();
    let index = file.indexOf('?');
    if (index >= 0) {
        scale = parseInt(file.substr(index + 1));
    }
    var image = imagesCache[file];
    if (!image) return new flex.Size(0, 0);
    return new flex.Size(image.width / scale, image.height / scale);
}

var measureFuncs = {
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
        return new flex.Size(0, 0);
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
    var node = layout.node;
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
        let measure = measureFuncs[l.type];
        if (measure) node.setMeasure(function(constrainedSize) { return measure(l, constrainedSize); });
    }
    var style = l.style;
    function bind(func, layoutProp, nodeProp) {
        if (!nodeProp) nodeProp = layoutProp;
        if (layoutProp in style) {
            var value = style[layoutProp];
            if (func) value = func(value);
            if (value !== undefined) {
                if (nodeProp instanceof Array) {
                    for (i in nodeProp) {
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
                node.layoutWithScale(node.width.value, node.height.value, getScale());
                l.result.scrollWidth = node.resultWidth;
                l.result.scrollHeight = node.resultHeight;
                for (var i in l.children) {
                    l.children[i].didLayout();
                }
            }
        }
        else if (l.type === 'paging' && l.children.length > 0) {
            l.didLayout = function() {
                didLayout(l);
                var width = l.result.width;
                var height = l.result.height;
                for (var i in l.children) {
                    var child = l.children[i];
                    var childNode = nodeFromLayout(child);
                    childNode.layoutWithScale(width, height, getScale());
                    child.didLayout();
                }
            }
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
            }
        }
    }

    return node;
}

function layout(layout, width, height = NaN) {
    var node = nodeFromLayout(layout);
    node.layoutWithScale(width, height, getScale());
    layout.didLayout();
}

function render(_layout, width) {
    layout(_layout, width);
    function _render(l) {
        let el = elementFromLayout(l);
        el.style.position = "absolute";
        setResult(el, l.result);
        if (l.type && l.type === 'text') {
            var style = l.style || {};
            if ("line-spacing" in style) {
                var e = el.children.item(0);
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
}

var tree = ${JSON.stringify(layout)};

function update() {
    var div = document.getElementsByClassName('main')[0];
    while (div.children.length > 0)
        div.children.item(0).remove();
    // var t1 = performance.now();
    var rendered = render(tree, div.clientWidth);
    // var t2 = performance.now();
    div.appendChild(rendered);

    var lines = document.getElementsByClassName('line');
    for (var i = 0; i < lines.length; i++) {
        var canvas = lines.item(i);
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;
        var lineWidth = Math.min(width, height);

        var context = canvas.getContext('2d');
        context.beginPath();
        context.lineWidth = lineWidth;
        context.strokeStyle = canvas.getAttribute('data-line-color') || 'transparent';
        context.setLineDash([canvas.getAttribute('data-dash-length') || 0, canvas.getAttribute('data-space-length') || 0]);
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

    // document.getElementsByClassName('screen-status-time')[0].textContent = parseInt((t2 - t1)+'') + 'ms';
}

Promise.all(loadImages()).then(e => {
    update();
});

        </script>

    </body>
		`
	}

	public provideTextDocumentContent(uri: vscode.Uri): vscode.ProviderResult<string> {
		const sourceUri = vscode.Uri.parse(uri.query);
		let config = this._config.get(uri.query) || { device: defaultDevice, scaleIndex: DEFAULT_SCALE_INDEX };
		if (uri) {
			let mistDoc = MistDocument.getDocumentByUri(sourceUri);
            let datas = mistDoc.getDatas() || [];
            let dataIndex = config.dataIndex || 0;
            if (dataIndex > datas.length) dataIndex = 0;
            let isX = config.device.width === 812;
            let builtin = {
				_width_: config.device.width,
                _height_: config.device.height,
                _mistitem_: {},
                system: {
                    name: `${vscode.env.appName} Simulator`,
                    version: '0.0.1',
                    deviceName: vscode.env.machineId
                },
                screen: {
                    width: config.device.width,
                    height: config.device.height,
                    scale: config.device.scale,
                    statusBarHeight: isX ? 44 : 20,
                    isPlus: config.device.width > 400,
                    isSmall: config.device.width < 350,
                    isX: isX,
                    safeArea: isX ? { top: 44, left: 0, bottom: 34, right: 0 } : {},
                },
                app: {},

                UIScreen: { mainScreen: { scale: config.device.scale } }
			};
			let node = mistDoc.bindData(datas.length > 0 ? datas[dataIndex].data : {}, builtin);
            let layout = node.layout;
            let imageFiles = this.resolveImageFiles(mistDoc.document, layout, config.device.scale);
			let nodeHtml = this.pageHtml(uri, layout, dataIndex, mistDoc.getDatas(), config, imageFiles);
			console.log(nodeHtml);
			return nodeHtml;
		}
		return null;
	}

	get onDidChange(): vscode.Event<vscode.Uri> {
		return this._onDidChange.event;
	}

	public update(uri: vscode.Uri, configChange?: any) {
		if (configChange) {
            var config = this._config.get(uri.query);
            if (!config) {
                config = {device: defaultDevice, scaleIndex: DEFAULT_SCALE_INDEX};
                this._config.set(uri.query, config);
            }
			if ("deviceIndex" in configChange) {
				config.device = devices[configChange.deviceIndex];
            }
            else if ("dataIndex" in configChange) {
                config.dataIndex = configChange.dataIndex;
            }
            else if ("scaleIndex" in configChange) {
                config.scaleIndex = configChange.scaleIndex;
            }
		}

		if (!this._waiting) {
			this._waiting = true;
			setTimeout(() => {
				this._waiting = false;
				this._onDidChange.fire(uri);
			}, 100);
		}
	}

}
