
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
        && document.uri.scheme !== 'mist-preview'; // prevent processing of own documents
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
    private _clients: PreviewClient[] = [];
    private _updateTimer = null;

    constructor(private context: vscode.ExtensionContext) {
        let httpServer = http.createServer((request, response) => {
            let uri = vscode.Uri.parse(request.url);
            if (uri.path === '/') {
                var content = this.pageHtml(vscode.Uri.parse('shared'));
                content = content.replace(/<base [^>]*>/m, '')
                                 .replace(/<a id="open-in-browser".*<\/a>/, '')
                                 .replace('data-type="vscode"', 'data-type="browser-socket"');
                response.end(content);
            }
            else {
                let file = uri.path;
                if (file.startsWith('/getImage/')) {
                    file = file.substr(10);
                }
                else if (file === '/favicon.ico') {
                    file = this.getResourcePath('media/mist.png');
                }
                else {
                    file = this.getResourcePath(file);
                }
                fs.readFile(file, (err, data) => {
                    if (!err) {
                        response.end(data);
                    }
                    else {
                        response.statusCode = 404;
                        response.end();
                    }
                });
            }
        });
        this._listening = new Promise<number>((resolve, reject) => httpServer.listen(0, 'localhost', null, err => err ? reject(err) : resolve(httpServer.address().port)));
        this._server = new ws.Server({ server: httpServer });
        this._server.on('connection', client => {
            client.on('message', message => {
                let data = JSON.parse(message);
                switch (data.type) {
                case 'open':
                    this._clients.push({
                        client,
                        config: {
                            device: data.device,
                        }
                    });
                    this.render();
                    break;
                case 'select':
                {
                    this.revealNode(vscode.Uri.parse(data.path), data.index);
                    break;
                }
                }
            });

            client.on('close', () => {
                let index = this._clients.findIndex(c => c.client === client);
                if (index >= 0) this._clients.splice(index, 1);
            });
        });
    }

    public async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        this._port = await this._listening;
        const sourceUri = vscode.Uri.parse(decodeURI(uri.query));
        if (uri) {
            let mistDoc = MistDocument.getDocumentByUri(sourceUri);
            let nodeHtml = this.pageHtml(vscode.Uri.parse('shared'));
            return nodeHtml;
        }
        return null;
    }

    render() {
        if (this._clients.length > 0) {
            this._clients.forEach(c => {
                let mistDoc = this.getDocument();
                if (!mistDoc) return;
                let template = mistDoc.getTemplate();
                let images = ImageHelper.getImageFiles(mistDoc.document);
                c.client.send(JSON.stringify({
                    path: mistDoc.document.uri.toString(),
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
        if (this._clients.length === 0) return;
        
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

        let index = indexes ? indexes.join(',') : null;
        this._clients.forEach(c => c.client.send(JSON.stringify({ 'type': 'select', index })));
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

    private getResourcePath(file: string) {
        return this.context.asAbsolutePath(file);
    }

    private pageHtml(uri: vscode.Uri) {
        return `
    <head>
        <base href="${this.getResourcePath('preview.html')}">
        <meta charset="UTF-8">
        <link rel="stylesheet" href="lib/bootstrap.min.css">
        <link rel="stylesheet" href="css/preview.css">
        <link rel="stylesheet" href="css/flex.css">
        <script type="text/javascript" src="http://at.alicdn.com/t/font_532796_cdkfbxvwvky2pgb9.js"></script>
        <style type="text/css">
            .icon {
            width: 1em; height: 1em;
            vertical-align: -0.15em;
            fill: currentColor;
            overflow: hidden;
            }
        </style>
        <script type="text/javascript" src="lib/jquery.min.js"></script>
        <script type="text/javascript" src="lib/bootstrap.min.js"></script>
        <script type="text/javascript" src="lib/require.js"></script>
        <script type="text/javascript" src="lib/shortcut.js"></script>
        <script>
            require.config({
                paths: {
                    'previewClient': 'out/browser/previewClient',
                    'previewDevice': 'out/browser/previewDevice',
                    'render': 'out/browser/render',
                    'template': 'out/browser/template',
                    'lexer': 'out/browser/lexer',
                    'parser': 'out/browser/parser',
                    'type': 'out/browser/type',
                    'functions': 'out/browser/functions',
                    'image': 'out/browser/image',
                    '../../lib/FlexLayout': 'lib/FlexLayout',
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
    </head>
    
    <body data-port="${this._port}" data-path="${uri.toString()}" data-type="vscode">
    <div style="width:100%; height:100%; display:flex; flex-direction:column">
    <div id="navi-bar">
        <a id="inspect-element" class="navi-icon" title="检查元素"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-select"></use></svg></i></a>
        <a id="show-frames" class="navi-icon" title="显示边框"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-frame"></use></svg></i></a>
        <a id="open-in-browser" class="navi-icon" title="在浏览器打开" href="http://localhost:${this._port}"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-chrome"></use></svg></i></a>
        <div class="navi-line"></div>
    </div>
    
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

    private getDocument() {
        let editor = vscode.window.visibleTextEditors.find(e => e.document.languageId === 'mist');
        if (editor) {
            return MistDocument.getDocumentByUri(editor.document.uri);
        }
        return null;
    }
    
}
