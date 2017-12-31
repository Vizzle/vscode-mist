
'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as json from 'jsonc-parser'
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
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <script src="https://cdn.bootcss.com/jquery/2.1.1/jquery.min.js"></script>
        <script src="https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
        <script src="file://${this.context.extensionPath}/preview/js/FlexLayout.js"></script>
        <script src="file://${this.context.extensionPath}/preview/js/render.js"></script>
        <link rel="stylesheet" href="file://${this.context.extensionPath}/preview/css/flex.css">
        <link rel="stylesheet" href="file://${this.context.extensionPath}/preview/css/preview.css">
        <style>
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
                <a role="menuitem" tabindex="-1" onclick="document.getElementsByClassName('screen')[0].style.transform='scale(${s.scale})'" href="${encodeURI(`command:mist.changePreviewConfig?${JSON.stringify([uri.toString(), {scaleIndex: i}])}`)}">${s.desc}</a>
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
    <div id="mist-hover"></div>

    <script>
        var div = document.getElementsByClassName('main')[0];
        while (div.children.length > 0)
            div.children.item(0).remove();
        var tree = ${JSON.stringify(layout)};
        var scale = ${SCALES[config.scaleIndex].scale};
        var images = ${JSON.stringify(imageFiles)};
        var hover = document.getElementById('mist-hover');
        render(tree, div.clientWidth, scale, images, {
            nodeClicked: function (node) {
                window.parent.postMessage({
                    command: 'did-click-link',
                    data: 'command:mist.revealNode?["${encodeURI(uri.toString())}", "' + node.getAttribute('data-node-index') + '"]'
                }, "file://");
            },
            nodeHovering: function (node) {
                if (node) {
                    var nodeRect = node.getBoundingClientRect();
                    hover.style.opacity = "1";
                    hover.style.width = nodeRect.width + 'px';
                    hover.style.height = nodeRect.height + 'px';
                    hover.style.left = nodeRect.left + 'px';
                    hover.style.top = nodeRect.top + 'px';
                }
                else {
                    hover.style.opacity = "0";
                }
            },
        }).then(function(r) {
            div.appendChild(r);
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
                return;
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

	public revealNode(uri: vscode.Uri, nodeIndex: string) {
        uri = vscode.Uri.parse(uri.query);
        vscode.workspace.openTextDocument(uri).then(doc => {
            let mistDoc = MistDocument.getDocumentByUri(uri);
            if (!mistDoc) return;
            let rootNode = mistDoc.getRootNode();
            var node = json.findNodeAtLocation(rootNode, ['layout']);
            if (!node) return;
            let indexes = nodeIndex ? nodeIndex.split(',') : [];
            for (var i of indexes) {
                if (node.type === 'object') {
                    node = json.findNodeAtLocation(node, ['children', parseInt(i)]);
                }
                else {
                    break;
                }
            }
            if (!node) return;
            vscode.window.showTextDocument(doc).then(editor => {
                let range = new vscode.Range(doc.positionAt(node.offset), doc.positionAt(node.offset + node.length));
                editor.selection = new vscode.Selection(range.start, range.end);
                editor.revealRange(editor.selection);
            });
        });
	}

}
