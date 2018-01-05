
'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as json from 'jsonc-parser'
import * as color from './utils/color'
import * as fs from 'fs'
import * as http from 'http'
import * as ws from 'ws'
import { parseJson } from './utils/json'
import { MistDocument, MistData } from './mistDocument';
import { ImageHelper } from './imageHelper';
import { extensions } from 'vscode';
import Device from './browser/previewDevice';
import { bindData } from './browser/template';

export function isMistFile(document: vscode.TextDocument) {
	return document.languageId === 'mist'
		&& document.uri.scheme !== 'mist'; // prevent processing of own documents
}

export function getMistUri(uri: vscode.Uri) {
	return uri.with({ scheme: 'mist', path: uri.path + '.rendered', query: uri.toString() });
}

type PreviewConfig = {
    device: Device;
    dataIndex?: number;
}

type PreviewClient = {
    client: ws;
    config: PreviewConfig;
}

export class MistContentProvider implements vscode.TextDocumentContentProvider {
    private _config = new Map<string, PreviewConfig>();
    private _server: ws.Server;
    private _port: number;
    private _listening: Promise<number>;
    private _clients = new Map<string, PreviewClient[]>();
    private _updateTimer = null;

	constructor(private context: vscode.ExtensionContext) {
        let httpServer = http.createServer();
        this._listening = new Promise<number>((resolve, reject) => httpServer.listen(0, 'localhost', null, err => err ? reject(err) : resolve(httpServer.address().port)));
        this._server = new ws.Server({ server: httpServer });
        this._server.on('connection', client => {
            client.on('message', message => {
                let data = JSON.parse(message);
                let findClient = c => {
                    for (var [path, clients] of this._clients.entries()) {
                        let r = clients.find(client => client.client === c);
                        if (r) {
                            return {path, client: r};
                        }
                    }
                    return null;
                }
                switch (data.type) {
                case 'open':
                    let clients = this._clients.get(data.path);
                    if (!clients) {
                        clients = [];
                        this._clients.set(data.path, clients);
                    }
                    clients.push({
                        client,
                        config: {
                            device: data.device,
                        }
                    });
                    this.render(data.path);
                    break;
                case 'select':
                {
                    let c = findClient(client);
                    if (c) {
                        this.revealNode(vscode.Uri.parse(c.path), data.index);
                    }
                    break;
                }
                case 'device':
                {
                    let c = findClient(client);
                    if (c) {
                        c.client.config.device = data.device;
                        this.update(c.path);
                    }
                    break;
                }
                }
            });

            client.on('close', () => {
                for (var [key, list] of this._clients.entries()) {
                    var index = list.findIndex(c => c.client === client);
                    if (index >= 0) list.splice(index, 1);
                }
            });
        });
    }

    private getResourcePath(file: string) {
        return this.context.asAbsolutePath(file);
    }

	private pageHtml(uri: vscode.Uri) {
        return `
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="${this.getResourcePath('css/flex.css')}">
        <link rel="stylesheet" href="${this.getResourcePath('css/preview.css')}">
        <script src="https://cdn.bootcss.com/jquery/2.1.1/jquery.min.js"></script>
        <script src="https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
        <script type="text/javascript" src="${this.getResourcePath('lib/require.js')}"></script>
        <script>
            require.config({
                paths: {
                    'previewClient': 'file:///Users/Sleen/dev/mine/vscode/x/mist/out/browser/previewClient',
                    'previewDevice': 'file:///Users/Sleen/dev/mine/vscode/x/mist/out/browser/previewDevice',
                    'render': 'file:///Users/Sleen/dev/mine/vscode/x/mist/out/browser/render',
                    'template': 'file:///Users/Sleen/dev/mine/vscode/x/mist/out/browser/template',
                    'lexer': 'file:///Users/Sleen/dev/mine/vscode/x/mist/out/browser/lexer',
                    'parser': 'file:///Users/Sleen/dev/mine/vscode/x/mist/out/browser/parser',
                    'type': 'file:///Users/Sleen/dev/mine/vscode/x/mist/out/browser/type',
                    'functions': 'file:///Users/Sleen/dev/mine/vscode/x/mist/out/browser/functions',
                    'image': 'file:///Users/Sleen/dev/mine/vscode/x/mist/out/browser/image',
                    '../../lib/FlexLayout': 'file:///Users/Sleen/dev/mine/vscode/x/mist/lib/FlexLayout',
                }
            });
            require(['previewClient'], function(main) {
                main.default();
            }, function (err) {
                var footer = document.getElementById('footer');
                footer.classList.remove('hidden');
                footer.textContent = '脚本加载失败：' + JSON.stringify(err);
            });
        </script>
        <style>
            .screen {
                display: flex;
                flex-direction: column;
                background-color: white;
                margin: 10px;
                box-shadow: 0px 0px 0px 1px white;
                transform: scale(1);
                transform-origin: top left;
            }
        </style>
    </head>
    
    <body data-port="${this._port}" data-path="${decodeURI(uri.query)}">
    <div style="width:100%; height:100%; display:flex; flex-direction:column">
    <div id="navi-bar"></div>
    
    <div style="display:flex;align-items:flex-start;overflow:auto;flex-grow:1;">
    <div class="screen hidden">
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
    <div class="mist-main"></div>
    </div>
    </div>
    <div id="footer" class="hidden"></div>
    <div id="mist-selects" class="overlay"></div>
    <div class="overlay"><div id="mist-hover" class="anim"></div></div>

    </body>
		`
	}

	public async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        this._port = await this._listening;
		const sourceUri = vscode.Uri.parse(decodeURI(uri.query));
		if (uri) {
			let mistDoc = MistDocument.getDocumentByUri(sourceUri);
			let nodeHtml = this.pageHtml(uri);
			console.log(nodeHtml);
			return nodeHtml;
		}
		return null;
    }
    
    render(uri: string) {
        let sourceUri = vscode.Uri.parse(uri);
        let clients = this._clients.get(uri);
        if (clients && clients.length > 0) {
            clients.forEach(c => {
                let mistDoc = MistDocument.getDocumentByUri(sourceUri);
                let template = mistDoc.getTemplate();
                let images = ImageHelper.getImageFiles(mistDoc.document);
                c.client.send(JSON.stringify({
                    type: 'data',
                    template,
                    images,
                    datas: mistDoc.getDatas().map(d => {
                        return {
                            name: d.description(),
                            data: d.data
                        }
                    }),
                }));
            });
        }
    }

	public update(uri: string) {
        if (this._updateTimer) {
            clearTimeout(this._updateTimer);
            this._updateTimer = null;
        }
        this._updateTimer = setTimeout((thiz) => {
            thiz._updateTimer = null;
            thiz.render(decodeURI(uri));
        }, 100, this);
    }
    
    public selectionDidChange(textEditor: vscode.TextEditor) {
        if (this._updateTimer) return;
        let doc = textEditor.document;
        let clients = this._clients.get(decodeURI(doc.uri.toString())) || [];
        if (clients.length === 0) return;
        
        let sel = textEditor.selection.end;
        let path = [...json.getLocation(doc.getText(), doc.offsetAt(sel)).path];
        let indexes = [];
        if (path.length === 0 || path[0] !== 'layout') {
            indexes = null;
        }
        else {
            path.splice(0, 1);
            while (path.length >= 2 && path[0] === 'children') {
                indexes.push(path[1]);
                path.splice(0, 2);
            }
        }

        clients.forEach(c => c.client.send(JSON.stringify({ 'type': 'select', indexes })));
    }

	public revealNode(uri: vscode.Uri, nodeIndex: string) {
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
