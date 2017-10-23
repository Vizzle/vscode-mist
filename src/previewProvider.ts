
'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as JsonParser from 'jsonc-parser'
import * as color from './utils/color'
import * as fs from 'fs'
import { parseJson } from './utils/json'
import MistServer from './mistServer'

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

type PreviewConfig = {
	device: Device;
}

export class MistContentProvider implements vscode.TextDocumentContentProvider {
	

	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
	private _waiting: boolean = false;
	private _config = new Map<string, PreviewConfig>();

	constructor(
		private context: vscode.ExtensionContext,
		private server: MistServer
	) { }

	private pageHtml(uri: vscode.Uri, html: string, datas: any[], config: PreviewConfig) {
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
}

.dot {
width: 6px;
height: 6px;
margin: 1px;
background-color: white;
border-radius: 50%;
}

.navi-bar {
	background-color: #E24810;
}

.navi-item {
	display: inline-block;
}

.active, .focus, .active.focus, :active, :focus, :active:focus {
	outline: 0 !important;
}

.btn.active.focus, .btn.active:focus, .btn.focus, .btn:active.focus, .btn:active:focus, .btn:focus {
	color: white
}

.btn.active, .btn:active {
	box-shadow: none;
}

.btn:hover {
	color: rgba(255, 255, 255, 0.8)
}

.dropdown>button {
	background-color: transparent;
    border: 0;
    color: white;
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
			${datas.length == 0 ? '无数据' : datas[0].desc}
			<span class="caret"></span>
		</button>
		<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
			${datas.map((d, i) => `
		<li role="presentation" class="${i == 0 ? 'selected' : ''}">
			<a role="menuitem" tabindex="-1" href="#">${d.desc}</a>
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

<div style="display:flex;align-items:flex-start;overflow:auto">
<div style="display:flex; flex-direction:column; background-color:white; margin:10px; box-shadow:1px 2px 5px gray;">
<div style="display:flex; flex-direction:column; background-color:#333; flex-shrink:0;">

<div style="display:flex; height:20px; color:white; align-items:center; justify-content:center;">
	<div style="display:flex; height:20px; color:white; align-items:center; justify-content:center; padding-left:5px">
		<div class="dot"></div>
		<div class="dot"></div>
		<div class="dot"></div>
		<div class="dot"></div>
		<div class="dot"></div>
		<div style="color:white; font-size:12px; margin-left:5px;">中国移动</div>
	</div>
	<div style="display:flex; margin:auto; color:white; font-size:12px;">上午12:00</div>
	<div style="display:flex; visibility:hidden; height:20px; color:white; align-items:center; justify-content:center; padding-left:5px">
		<div class="dot"></div>
		<div class="dot"></div>
		<div class="dot"></div>
		<div class="dot"></div>
		<div class="dot"></div>
		<div style="color:white; font-size:12px; margin-left:5px;">中国移动</div>
	</div>
</div>
<div style="display:flex; height:44px; color:white; align-items:center; justify-content:center;">
	<div style="display:flex; color:white; font-size:18px;">Preview</div>
</div>
</div>
<iframe id="preview" width="${config.device.width}px" height="${config.device.height - 64}px" style="border:0" srcdoc="<style type='text/css'>html, body{width:100%; height:100%;} html, body, div, img, iframe { margin:0px; padding:0px; font-size:100%; line-height:1.15em; box-sizing:border-box; display:flex; overflow:hidden;} body>div{flex-grow:1;}</style><body style='font-family:Helvetica Neue; display:block; overflow-y:scroll;'>${html}</body>" scrolling="auto"></iframe>
</div>
</div>
</body>
		`
	}

	private findData(sourceFile: string) {
		let file = sourceFile;
        let dir = path.dirname(file);
        let templateId = path.basename(file, ".mist");
        return new Promise<{file:string,desc:string,data:any}[]>((resolve, reject) => {
			fs.readdir(dir, (err, files) => {
				if (err) {
					vscode.window.showErrorMessage(err.message);
					reject(err);
					return;
				}
				let result = [];
				files.filter(f => f.endsWith(".json")).map(f => {
					let file = `${dir}/${f}`;
					let text = fs.readFileSync(file).toString();
					if (text) {
						let re = new RegExp(`"(block|template)\\w*"\\s*:\\s*"(\\w*?@)?${templateId}"`, "mg");
						let match;
						let fileResult = []
						while (match = re.exec(text)) {
							fileResult.push({file: file, position: match.index});
						}
						if (fileResult.length > 0) {
							let rootNode = parseJson(text);
							fileResult = fileResult.map((r, i) => {
								let data;
								let location = JsonParser.getLocation(text, r.position);
								let node = JsonParser.findNodeAtLocation(rootNode, location.path.slice(0, location.path.length - 1));
								if (node) {
									let dataNode = JsonParser.findNodeAtLocation(node, ["data"]) || node;
									data = JsonParser.getNodeValue(dataNode);
								}
								return { file: file, desc: fileResult.length > 1 ? f + ' #' + i : f, data: data };
							})
							result.push(...fileResult.filter(r => r.data));
						}
					}
				});
				resolve(result);
			});
		});
	}

	public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
		const sourceUri = vscode.Uri.parse(uri.query);
		let config = this._config.get(uri.query) || { device: defaultDevice };
		if (uri) {
			return vscode.workspace.openTextDocument(sourceUri).then(document => {
				return this.findData(sourceUri.path).then((datas): Thenable<string> => {
					let tpl = document.getText();
					let parsed = parseJson(tpl);
					let node = parsed ? JsonParser.getNodeValue(parsed) : {};
					let request = {
						template: node,
						data: datas && datas.length > 0 ? datas[0].data : {},
						screenWidth: config.device.width,
						screenHeight: config.device.height,
						screenScale: config.device.scale
					};
					return this.server.send("bindData", JSON.stringify(request))
						.then(str => JSON.parse(str), err => node).then(node => {
						let nodeHtml = this.convertToHtml(node.layout || {});
						nodeHtml = this.htmlEncode(nodeHtml);
						nodeHtml = this.pageHtml(uri, nodeHtml, datas, config);
						// console.log(nodeHtml);
						return nodeHtml;
					});
				});
			});
		}
		return null;
	}

	get onDidChange(): vscode.Event<vscode.Uri> {
		return this._onDidChange.event;
	}

	public update(uri: vscode.Uri, configChange?: any) {
		if (configChange) {
			if ("deviceIndex" in configChange) {
				let config = this._config.get(uri.query);
				if (!config) {
					config = {device: defaultDevice};
					this._config.set(uri.query, config);
				}
				config.device = devices[configChange.deviceIndex];
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

	private flexLengthToCssLength(length) {
		if (!isNaN(length)) {
			return length + "px";
		}
		return length + "";
	}

	private flexAlignToCssAlign(align) {
		var dict = {//mist2css
					"auto": "auto",
					"center": "center",
					"end": "flex-end",
					"space-around": "space-around",
					"space-between": "space-between",
					"start": "flex-start",
					"stretch": "stretch",
					};
		return dict[align];
	}

	private htmlEncode(text: string) {
		if (typeof text !== "string") {
			text = text + "";
		}
		let escapes = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;"
		}
		for (let k of ["&", "<", ">", '"']) {
			text = text.replace(new RegExp(k,"gm"), escapes[k]);
		}
		return text;
	}

	private fixHtml(text: string) {
		return text.replace(/ size\s*=\s*(['"])(\d+)\1/gm, ' style="font-size:$2px"');
	}

	private tag(tag: string, content: string, styles: any, attrs: any) {
		var stylesText = "";
		for (var key in styles) {
			stylesText += key + ":" + styles[key] + "; ";
		}
		
		attrs["style"] = stylesText;
		
		var attrsText = "";
		for (var key in attrs) {
			attrsText += " " + key + "=\"" + attrs[key] + "\"";
		}
		
		return "<" + tag + attrsText + ">" + content + "</" + tag + ">";
	}

	private paddingStyle(style) {
		let styles = {};
		if ("padding" in style) styles["padding"] = this.flexLengthToCssLength(style["padding"]);
		if ("padding-top" in style) styles["padding-top"] = this.flexLengthToCssLength(style["padding-top"]);
		if ("padding-left" in style) styles["padding-left"] = this.flexLengthToCssLength(style["padding-left"]);
		if ("padding-right" in style) styles["padding-right"] = this.flexLengthToCssLength(style["padding-right"]);
		if ("padding-bottom" in style) styles["padding-bottom"] = this.flexLengthToCssLength(style["padding-bottom"]);
		return styles;
	}

	private convertToHtml(node): string {
		if (!(node instanceof Object)) {
			return '';
		}
		
		var style = node.style || {};

		var isVertical = "direction" in style && style["direction"].indexOf("vertical") >= 0
		
		var styles = {};
		var attrs = {};

		var content = "";
		var tag = "div";

		let defaultStyles = {
			"margin": "0",
			"padding": "0",
			"font-size": "100%",
			"line-height": "1.25em",
			"box-sizing": "border-box",
			"display": node.children && node.children.length > 0 ? "flex" : "block",
			"border-width": "0",
			"border-style": "solid",
			"position": "relative"
		}
		
		styles = {...defaultStyles};
		// styles["margin"] = "0";
		// styles["padding"] = "0";
		// styles["font-size"] = "100%";
		// styles["line-height"] = "1.25em";
		// styles["box-sizing"] = "border-box";
		// styles["display"] = node.children && node.children.length > 0 ? "flex" : "block";
		// styles["border-width"] = "0";
		// styles["border-style"] = "solid";
		// styles["position"] = "relative";

		let paddingStyle = this.paddingStyle(style);

		if ("text" === node["type"]) {
			if ("color" in style) styles["color"] = color.cssColor(style["color"]);
			if ("font-size" in style) styles["font-size"] = this.flexLengthToCssLength(style["font-size"]);
			if ("font-name" in style) styles["font-family"] = style["font-name"];
			if ("alignment" in style) styles["text-align"] = style["alignment"];
			if ("kern" in style) styles["letter-spacing"] = (style["kern"]||0) + "px";

			var wrapMode = style["line-break-mode"];
			if ("char" == wrapMode) {
				styles["word-break"] = "break-all";
			} else {
				styles["word-break"] = "break-word";
			}

			var truncationMode = style["truncation-mode"];
			if ("clip" == truncationMode) {
				styles["overflow"] = "hidden";
				styles["text-overflow"] = "clip";
			}
			else {
				styles["overflow"] = "hidden";
				styles["text-overflow"] = "ellipsis";
			}

			var lines = "lines" in style ? parseInt(style["lines"]) : 1;
			styles["white-space"] = lines == 1 ? "pre" : "pre-wrap";
			if (lines > 1) {
				// 只支持webkit内核
				styles["-webkit-line-clamp"] = lines;
				styles["-webkit-box-orient"] = "vertical";
				styles["display"] = "-webkit-box";
			}

			var text = style["text"];
			if (text === undefined) {
				text = "";
			}
			else if (typeof text !== "string") {
				text = text + "";
			}
			content = this.htmlEncode(text);
			if ("html-text" in style) content = this.fixHtml(style["html-text"]);

			var veticalAlign;
			switch (style["vertical-alignment"]) {
				case "center":
				default:
					veticalAlign = "center";
					break;
				case "top":
					veticalAlign = "flex-start";
					break;
				case "bottom":
					veticalAlign = "flex-end";
					break;
			}

			switch (style["font-style"]) {
				case "ultra-light":
					styles["font-weight"] = "100";
					break;
				case "thin":
					styles["font-weight"] = "200";
					break;
				case "light":
					styles["font-weight"] = "300";
					break;
				case "normal":
					styles["font-weight"] = "400";
					break;
				case "medium":
					styles["font-weight"] = "550";
					break;
				case "bold":
					styles["font-weight"] = "700";
					break;
				case "heavy":
					styles["font-weight"] = "800";
					break;
				case "black":
					styles["font-weight"] = "900";
					break;
				case "italic":
					styles["font-style"] = "italic";
					break;
				case "bold-italic":
					styles["font-weight"] = "600";
					styles["font-style"] = "italic";
					break;
			}

			content = this.tag("div", content, styles, attrs);
			styles["display"] = "flex";
			styles["flex-direction"] = "column";
			styles["justify-content"] = veticalAlign;
		}
		else if ("button" === node["type"]) {
			var title = style["title"];
			content = title instanceof Object ? title.normal : title;
			if (content == undefined) {
				content = "";
			}
			var buttonStyle = {};
			buttonStyle["text-align"] = "center";
			if ("title-color" in style) buttonStyle["color"] = color.cssColor(style["title-color"]);
			if ("font-size" in style) buttonStyle["font-size"] = this.flexLengthToCssLength(style["font-size"]);
			if ("font-name" in style) buttonStyle["font-family"] = style["font-name"];

			content = this.tag("div", content, {...styles, ...buttonStyle}, attrs);
			if ("background-image" in style) styles["background"] = color.cssColor(style["background-image"]);
			styles["display"] = "flex";
			styles["flex-direction"] = "column";
			styles["justify-content"] = "center";
		}
		else if ("image" === node["type"]) {
			tag = "img";
			if (style["content-mode"] == "scale-aspect-fit") {
				styles["object-fit"] = "contain";
			}
			else if (style["content-mode"] == "scale-aspect-fill") {
				styles["object-fit"] = "cover";
			}
			else if (style["content-mode"] == "center") {
				styles["object-fit"] = "none";
			}
			else if (style["content-mode"] == "left") {
				styles["object-fit"] = "none";
				styles["object-position"] = "left";
			}
			else if (style["content-mode"] == "right") {
				styles["object-fit"] = "none";
				styles["object-position"] = "right";
			}
			else if (style["content-mode"] == "top") {
				styles["object-fit"] = "none";
				styles["object-position"] = "top";
			}
			else if (style["content-mode"] == "top-left") {
				styles["object-fit"] = "none";
				styles["object-position"] = "top left";
			}
			else if (style["content-mode"] == "top-right") {
				styles["object-fit"] = "none";
				styles["object-position"] = "top right";
			}
			else if (style["content-mode"] == "bottom") {
				styles["object-fit"] = "none";
				styles["object-position"] = "bottom";
			}
			else if (style["content-mode"] == "bottom-left") {
				styles["object-fit"] = "none";
				styles["object-position"] = "bottom left";
			}
			else if (style["content-mode"] == "bottom-right") {
				styles["object-fit"] = "none";
				styles["object-position"] = "bottom right";
			}

			if ("image-url" in style) attrs["src"] = style["image-url"];
		}
		else if ("stack" === node["type"] || node.children && node.children.length > 0) {
			var str = "";
			var spacing = style["spacing"] || 0;
			var firstItem = true;
			for (var index in node.children) {
				var child = node.children[index];
				if (!("style" in child)) {
					child["style"] = {};
				}
				if ("paging" === node["type"]) {
					child.style["fixed"] = true;
				}
				var fixed = child.style["fixed"];
				if ("scroll" === node["type"]) {
					child["style"]["flex-shrink"] = "0";
				}
				if (spacing > 0 && !fixed) {
					if (firstItem) {
						firstItem = false;
					}
					else {
						var spacingItem = "<div style=\"" + (isVertical ? "height" : "width") + ":" + spacing + "px; flex-shrink:0;\"></div>";
						str += spacingItem;
					}
				}
				str += this.convertToHtml(child);
				if ("paging" === node["type"]) {
					break;
				}
				str +="\n";
			}

			content = str;

			var directionDict = {
				"horizontal": "row",
				"horizontal-reverse": "row-reverse",
				"vertical": "column",
				"vertical-reverse": "column-reverse",
				};

			if ("direction" in style) styles["flex-direction"] = directionDict[style["direction"]];
			if ("align-items" in style) styles["align-items"] = this.flexAlignToCssAlign(style["align-items"]);
			if ("align-content" in style) styles["align-content"] = this.flexAlignToCssAlign(style["align-content"]);
			if ("justify-content" in style) styles["justify-content"] = this.flexAlignToCssAlign(style["justify-content"]);
			if ("wrap" in style) styles["flex-wrap"] = style["wrap"] ? "wrap" : "nowrap";

			if ("scroll" === node["type"]) {
				switch (style["scroll-direction"]) {
					case "horizontal":
					default:
						styles["overflow-x"] = "scroll";
						break;
					case "vertical":
						styles["overflow-y"] = "scroll";
						break;
					case "both":
						styles["overflow"] = "scroll";
						break;
					case "none":
						break;
				}
				var scrollStyle = {"position": "absolute", "top": "0", "bottom": "0", "left": "0", "right": "0"};
				content = this.tag("div", content, {...styles, ...scrollStyle, ...paddingStyle}, attrs);
				paddingStyle = {};
			}
		}

		if ("clip" in style && "scroll" !== node["type"]) styles["overflow"] = style["clip"] ? "hidden" : "visible";
		var fixed = style["fixed"];
		
		if ("width" in style) styles["width"] = this.flexLengthToCssLength(style["width"]);
		if ("height" in style) styles["height"] = this.flexLengthToCssLength(style["height"]);
		if ("min-width" in style) styles["min-width"] = this.flexLengthToCssLength(style["min-width"]);
		if ("min-height" in style) styles["min-height"] = this.flexLengthToCssLength(style["min-height"]);
		if ("max-width" in style) styles["max-width"] = this.flexLengthToCssLength(style["max-width"]);
		if ("max-height" in style) styles["max-height"] = this.flexLengthToCssLength(style["max-height"]);
		if ("margin" in style) styles["margin"] = this.flexLengthToCssLength(style["margin"]);
		if ("margin-top" in style) styles["margin-top"] = this.flexLengthToCssLength(style["margin-top"]);
		if ("margin-left" in style) styles["margin-left"] = this.flexLengthToCssLength(style["margin-left"]);
		if ("margin-right" in style) styles["margin-right"] = this.flexLengthToCssLength(style["margin-right"]);
		if ("margin-bottom" in style) styles["margin-bottom"] = this.flexLengthToCssLength(style["margin-bottom"]);
		if ("flex-basis" in style) styles["flex-basis"] = this.flexLengthToCssLength(style["flex-basis"]);
		if ("flex-grow" in style) styles["flex-grow"] = style["flex-grow"];
		if ("flex-shrink" in style) styles["flex-shrink"] = style["flex-shrink"];
		if ("background-color" in style) styles["background-color"] = color.cssColor(style["background-color"]);
		if ("border-color" in style) styles["border-color"] = color.cssColor(style["border-color"]);
		if ("border-width" in style) styles["border-width"] = this.flexLengthToCssLength(style["border-width"]);
		if ("corner-radius" in style) styles["border-radius"] = this.flexLengthToCssLength(style["corner-radius"]);
		if ("align-self" in style) styles["align-self"] = this.flexAlignToCssAlign(style["align-self"]);

		styles = {...styles, ...paddingStyle};

		if (fixed) {
			var margin = style["margin"];
			var marginLeft = style["margin-left"] ? style["margin-left"] : margin;
			var marginRight = style["margin-right"] ? style["margin-right"] : margin;
			if (!("auto" == marginLeft || "auto" == marginRight || "width" in style)) {
				styles["flex-grow"] = "1";
			}
		}
		
		var stylesText = "";
		for (var key in styles) {
			stylesText += key + ":" + styles[key] + "; ";
		}
		
		attrs["style"] = stylesText;
		
		var attrsText = "";
		for (var key in attrs) {
			attrsText += " " + key + "=\"" + attrs[key] + "\"";
		}
		
		var ret = "<" + tag + attrsText + ">" + content + "</" + tag + ">";
		if (fixed) {
			ret = "<div style=\"position:absolute;display:flex;top:0;left:0;bottom:0;right:0;\">" + ret + "</div>";
		}
		return ret;
	}

}
