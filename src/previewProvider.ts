
'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as json from 'jsonc-parser'
import * as fs from 'fs'
import * as http from 'http'
import * as ws from 'ws'
import { MistDocument } from './mistDocument';
import { ImageHelper } from './imageHelper';
import Device from './browser/previewDevice';
import { StatusBarManager } from './statusBarManager';
import { compile } from 'mistc';

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

export class MistPreviewPanel {
    /**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
    public static currentPanel: MistPreviewPanel | undefined;

    public static readonly viewType = 'mistPreview';

    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionPath: string) {
        // If we already have a panel, show it.
        if (MistPreviewPanel.currentPanel) {
            MistPreviewPanel.currentPanel._panel.reveal();
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            MistPreviewPanel.viewType,
            'Mist Preview',
            vscode.ViewColumn.Two,
            {
                // Enable javascript in the webview
                enableScripts: true,

                // And restrict the webview to only loading content from our extension's `media` directory.
                localResourceRoots: [vscode.Uri.file(extensionPath)]
            }
        );

        MistPreviewPanel.currentPanel = new MistPreviewPanel(panel);
    }

    public static revive(panel: vscode.WebviewPanel) {
        MistPreviewPanel.currentPanel = new MistPreviewPanel(panel);
    }

    private constructor(panel: vscode.WebviewPanel) {
        this._panel = panel;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        // this._panel.onDidChangeViewState(
        //     e => {
        //         if (this._panel.visible) {
        //             this._update();
        //         }
        //     },
        //     null,
        //     this._disposables
        // );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public updateTitle(fileName: string) {
        this._panel.title = `Mist Preview (${fileName})`
    }

    public dispose() {
        MistPreviewPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update() {
        this._panel.webview.html = await MistContentProvider.sharedInstance.provideTextDocumentContent()
    }

}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export class MistContentProvider implements vscode.TextDocumentContentProvider {
    private _server: ws.Server;
    private _port: number;
    private _listening: Promise<number>;
    private _clients: PreviewClient[] = [];
    private _updateTimer = null;
    private static _sharedInstance: MistContentProvider;

    public static context: vscode.ExtensionContext;

    public static get sharedInstance(): MistContentProvider {
        if (!this._sharedInstance) {
            this._sharedInstance = new MistContentProvider(this.context);
        }
        return this._sharedInstance;
    }

    constructor(private context: vscode.ExtensionContext) {
        let httpServer = http.createServer((request, response) => {
            if (request.url === '/') {
                const content = this.pageHtml(true);
                response.end(content);
            }
            else {
                let file = request.url;
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
                        let contentType = 'text/plain'
                        if (file.endsWith('.js')) {
                            contentType = 'text/javascript'
                        }
                        else if (file.endsWith('.css')) {
                            contentType = 'text/css'
                        }
                        response.setHeader('Content-Type', contentType)
                        response.end(data);
                    }
                    else {
                        response.statusCode = 404;
                        response.end();
                    }
                });
            }
        });
        this._listening = new Promise<number>((resolve, reject) => httpServer.listen(0, null, null, err => err ? reject(err) : resolve(httpServer.address().port)));
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
                case 'selectData':
                {
                    let mistDoc = MistDocument.getDocumentByUri(vscode.Uri.parse(data.path));
                    if (mistDoc) {
                        mistDoc.setData(data.name);
                        StatusBarManager.updateDataItemForDocument(mistDoc);
                    }
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

    public async provideTextDocumentContent() {
        this._port = await this._listening
        return this.pageHtml()
    }

    public send(type: string, params: any) {
        if (this._clients.length > 0) {
            this._clients.forEach(c => {
                c.client.send(JSON.stringify({
                    type,
                    ...params
                }));
            });
        }
    }

    errorTemplate(error: Error | string) {
        return `\
{
  "layout": {
    "style": {
      "direction": "vertical",
      "align-items": "center",
      "spacing": 10,
      "padding": 30,
      "padding": 30
    },
    "children": [
      {
        "type": "text",
        "style": {
          "text": "模板编译错误",
          "font-size": 16,
          "font-style": "bold",
          "color": "red"
        }
      },
      {
        "type": "text",
        "style": {
          "text": "${error instanceof Error ? error.message : error}",
          "lines": 0,
          "alignment": "center",
          "font-size": 13,
          "color": "#333"
        }
      }
    ]
  }
}`
    }

    async render() {
        let mistDoc = this.getDocument();
        if (!mistDoc) return;

        if (MistPreviewPanel.currentPanel) {
            MistPreviewPanel.currentPanel.updateTitle(path.basename(mistDoc.document.fileName))
        }

        let template: any
        if (fs.existsSync(mistDoc.document.uri.fsPath)) {
            const result = await compile(mistDoc.document.uri.fsPath, { minify: true }, mistDoc.document.getText()).catch(this.errorTemplate)
            template = JSON.parse(result)
        }
        else {
            template = mistDoc.getTemplate();
        }

        let images = ImageHelper.getImageFiles(mistDoc.document);
        let data = mistDoc.getData();
        let dataName = data ? data.description() : null;
        this.send('data', {
            path: mistDoc.document.uri.toString(),
            template,
            images,
            datas: mistDoc.getDatas().map(d => {
                return {
                    name: d.description(),
                    data: d.data
                }
            }),
            selectedData: dataName
        })
    }

    public update(uri: string) {
        if (this._updateTimer) {
            clearTimeout(this._updateTimer);
            this._updateTimer = null;
        }
        this._updateTimer = setTimeout(() => {
            this._updateTimer = null;
            this.render();
        }, 100);
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
        this.send('select', {index});
    }

    public async revealNode(uri: vscode.Uri, nodeIndex: string) {
        const compareDocument = (doc: vscode.TextDocument) => doc.uri.toString() === uri.toString()
        let editor = vscode.window.visibleTextEditors.find(editor => compareDocument(editor.document))
        let doc: vscode.TextDocument
        if (editor) {
            doc = editor.document
        }
        else {
            doc = vscode.workspace.textDocuments.find(doc => compareDocument(doc))
            if (!doc) {
                doc = await vscode.workspace.openTextDocument(uri)
                if (!doc) {
                    console.warn(`can not open document '${uri}'`)
                    return
                }
            }
            editor = await vscode.window.showTextDocument(doc)
        }

        const mistDoc = MistDocument.getDocumentByUri(uri);
        if (!mistDoc) return;
        const rootNode = mistDoc.getRootNode();
        let node = json.findNodeAtLocation(rootNode, ['layout']);
        if (!node) return;
        const indexes = nodeIndex ? nodeIndex.split(',') : [];
        for (var i of indexes) {
            if (node.type === 'object') {
                node = json.findNodeAtLocation(node, ['children', parseInt(i)]);
            }
            else {
                break;
            }
        }
        if (!node) return;
        
        let range = new vscode.Range(doc.positionAt(node.offset), doc.positionAt(node.offset + node.length));
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(editor.selection);
    }

    private getResourcePath(file: string) {
        return this.context.asAbsolutePath(file);
    }

    public pageHtml(browser = false) {
        const nonce = getNonce();
        const scriptUrl = (file: string) => vscode.Uri.file(path.join(this.context.extensionPath, file)).with({ scheme: 'vscode-resource'})
        return `<!DOCTYPE html>
<html>
    <head>
        ${browser ? '' : `<base href="${scriptUrl('preview.html')}">
        <meta http-equiv="Content-Security-Policy" content="default-src vscode-resource:; img-src vscode-resource: https: http: data:; style-src vscode-resource: 'unsafe-inline'; script-src 'unsafe-eval' 'nonce-${nonce}'; connect-src ws:;">`}
        <title>Mist Preview</title>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="lib/bootstrap.min.css">
        <link rel="stylesheet" href="css/preview.css">
        <script type="text/javascript" nonce="${nonce}" src="http://at.alicdn.com/t/font_532796_cdkfbxvwvky2pgb9.js"></script>
        <style type="text/css">
            .icon {
            width: 1em; height: 1em;
            vertical-align: -0.15em;
            fill: currentColor;
            overflow: hidden;
            }
        </style>
        <script type="text/javascript" nonce="${nonce}" src="lib/jquery.min.js"></script>
        <script type="text/javascript" nonce="${nonce}" src="lib/bootstrap.min.js"></script>
        <script type="text/javascript" nonce="${nonce}" src="lib/require.js"></script>
        <script type="text/javascript" nonce="${nonce}" src="lib/shortcut.js"></script>
    </head>
    
    <body data-port="${this._port}" data-type="${browser ? 'browser-socket' : 'vscode'}">
    <div style="width:100%; height:100%; display:flex; flex-direction:column">
    <div id="navi-bar">
        <a id="inspect-element" class="navi-icon" title="检查元素"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-select"></use></svg></i></a>
        <a id="show-frames" class="navi-icon" title="显示边框"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-frame"></use></svg></i></a>
        ${browser ? '' : `<a id="open-in-browser" class="navi-icon" title="在浏览器打开" href="http://localhost:${this._port}"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-chrome"></use></svg></i></a>`}
        <div class="navi-line"></div>
    </div>
    
    <div style="display:flex;align-items:flex-start;overflow:auto;flex-grow:1;">
    <div class="screen hidden">
    <div class="screen-header">
    
    <div class="screen-status" style="height:20px; display:flex;">
        <div style="display:flex; color:white; align-items:center; justify-content:center; padding-left:5px">
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

    <script type="text/javascript" nonce="${nonce}" src="out/browser/bundle.js"></script>
    </body>
</html>`
    }

    private getDocument() {
        let editor = vscode.window.visibleTextEditors.find(e => e.document.languageId === 'mist');
        if (editor) {
            return MistDocument.getDocumentByUri(editor.document.uri);
        }
        return null;
    }
    
}
