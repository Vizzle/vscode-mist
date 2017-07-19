
'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as JsonParser from 'jsonc-parser'
import * as color from './utils/color'

export function isMistFile(document: vscode.TextDocument) {
	return document.languageId === 'mist'
		&& document.uri.scheme !== 'mist'; // prevent processing of own documents
}

export function getMistUri(uri: vscode.Uri) {
	return uri.with({ scheme: 'mist', path: uri.path + '.rendered', query: uri.toString() });
}

export class MistContentProvider implements vscode.TextDocumentContentProvider {
	private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
	private _waiting: boolean = false;

	constructor(
		private context: vscode.ExtensionContext
	) { }

	public provideTextDocumentContent(uri: vscode.Uri): Thenable<string> {
		const sourceUri = vscode.Uri.parse(uri.query);
		return vscode.workspace.openTextDocument(sourceUri).then(document => {
			let node = JsonParser.parse(document.getText()) || {};
			let nodeHtml = this.convertToHtml(node.layout || {});
			nodeHtml = nodeHtml.replace(/\"/g, "&quot;").replace(/\n/g, "");

			let html = `
			
<style type="text/css">

.dot {
	width: 6px;
	height: 6px;
	margin: 1px;
	background-color: white;
	border-radius: 50%;
}

</style>

<div style="position:relative;display:flex;align-items:flex-start;height:400px;">
<div id="editor"></div>
<div style="display:flex; flex-direction:column; background-color:white; margin:10px; box-shadow:1px 2px 5px gray;">
<div style="display:flex; flex-direction:column; background-color:#333; flex-shrink:0;">
	<div style="display:flex; position:absolute; float:left; height:20px; color:white; align-items:center; justify-content:center; padding-left:5px">
		<div class="dot"></div>
		<div class="dot"></div>
		<div class="dot"></div>
		<div class="dot"></div>
		<div class="dot"></div>
		<div style="color:white; font-size:12px; margin-left:5px;">中国移动</div>
	</div>
	<div style="display:flex; height:20px; color:white; align-items:center; justify-content:center;">
		<div style="display:flex; color:white; font-size:12px;">上午12:00</div>
	</div>
	<div style="display:flex; height:44px; color:white; align-items:center; justify-content:center;">
		<div style="display:flex; color:white; font-size:18px;">Preview</div>
	</div>
</div>
<iframe id="preview" width="320px" height="504px" style="border:0" srcdoc="<style type='text/css'>html, body, div, img, iframe { margin:0px; padding:0px; font-size:100%; line-height:1.25em; box-sizing:border-box; display:flex; overflow-x:hidden;} body>div{flex-grow:1;}</style><body style='font-family:Arial;width:100%;'>${nodeHtml}</body>" scrolling="auto"></iframe>
</div>
			`;
			return html;
		});
	}

	get onDidChange(): vscode.Event<vscode.Uri> {
		return this._onDidChange.event;
	}

	public update(uri: vscode.Uri) {
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

	private convertToHtml(node): string {
		// if (node.gone) {
		// 	return "";
		// }

		if (!(node instanceof Object)) {
			return '';
		}
		
		var style = node.style || {};

		var isVertical = "direction" in node && node["direction"].indexOf("vertical") >= 0
		
		var styles = {};
		var attrs = {};

		var content = "";
		var tag = "div";
		
		styles["margin"] = "0";
		styles["padding"] = "0";
		styles["font-size"] = "100%";
		styles["line-height"] = "1.25em";
		styles["box-sizing"] = "border-box";
		styles["display"] = node.children && node.children.length > 0 ? "flex" : "block";
		styles["border-width"] = "0";
		styles["border-style"] = "solid";
		
		styles["position"] = "relative";
		
		if ("text" == node["type"]) {
			content = style["text"] || "";
			if ("color" in style) styles["color"] = color.cssColor(style["color"]);
			if ("font-size" in style) styles["font-size"] = this.flexLengthToCssLength(style["font-size"]);
			if ("font-name" in style) styles["font-family"] = style["font-name"];
			if ("alignment" in style) styles["text-align"] = style["alignment"];

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
			if (lines > 0) {
				// 只支持webkit内核
				styles["-webkit-line-clamp"] = lines;
				styles["-webkit-box-orient"] = "vertical";
				styles["display"] = "-webkit-box";
			}

		}
		else if ("button" == node["type"]) {
			content = style["title"];
			if ("title-color" in style) styles["color"] = color.cssColor(style["title-color"]);
			if ("font-size" in style) styles["font-size"] = this.flexLengthToCssLength(style["font-size"]);
			if ("font-name" in style) styles["font-family"] = style["font-name"];
		}
		else if ("image" == node["type"]) {
			tag = "img";
			if (style["content-mode"] == "scale-aspect-fit") {
				styles["object-fit"] = "contain";
			}
			else if (style["content-mode"] == "scale-aspect-fill") {
				styles["object-fit"] = "cover";
			}

			if ("image-url" in style) attrs["src"] = style["image-url"];
		}
		else if ("stack" == node["type"] || node.children && node.children.length > 0) {
			var str = "";
			var spacing = style["spacing"] || 0;
			var firstItem = true;
			for (var index in node.children) {
				var child = node.children[index];
				var fixed = child["fixed"];
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
				str +="\n";
			}
			
			content = str;
		}

		var directionDict = {
							"horizontal": "row",
							"horizontal-reverse": "row-reverse",
							"vertical": "column",
							"vertical-reverse": "column-reverse",
							};
		
		if ("direction" in style) styles["flex-direction"] = directionDict[style["direction"]];
		if ("wrap" in style) styles["flex-wrap"] = style["wrap"] ? "wrap" : "nowrap";
		if ("clip" in style) styles["overflow"] = style["clip"] ? "hidden" : "visible";
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
		if ("padding" in style) styles["padding"] = this.flexLengthToCssLength(style["padding"]);
		if ("padding-top" in style) styles["padding-top"] = this.flexLengthToCssLength(style["padding-top"]);
		if ("padding-left" in style) styles["padding-left"] = this.flexLengthToCssLength(style["padding-left"]);
		if ("padding-right" in style) styles["padding-right"] = this.flexLengthToCssLength(style["padding-right"]);
		if ("padding-bottom" in style) styles["padding-bottom"] = this.flexLengthToCssLength(style["padding-bottom"]);
		if ("flex-basis" in style) styles["flex-basis"] = this.flexLengthToCssLength(style["flex-basis"]);
		if ("flex-grow" in style) styles["flex-grow"] = style["flex-grow"];
		if ("flex-shrink" in style) styles["flex-shrink"] = style["flex-shrink"];
		if ("background-color" in style) styles["background-color"] = color.cssColor(style["background-color"]);
		if ("border-color" in style) styles["border-color"] = color.cssColor(style["border-color"]);
		if ("border-width" in style) styles["border-width"] = this.flexLengthToCssLength(style["border-width"]);
		if ("corner-radius" in style) styles["border-radius"] = this.flexLengthToCssLength(style["corner-radius"]);
		if ("align-items" in style) styles["align-items"] = this.flexAlignToCssAlign(style["align-items"]);
		if ("align-self" in style) styles["align-self"] = this.flexAlignToCssAlign(style["align-self"]);
		if ("align-content" in style) styles["align-content"] = this.flexAlignToCssAlign(style["align-content"]);
		if ("justify-content" in style) styles["justify-content"] = this.flexAlignToCssAlign(style["justify-content"]);

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
