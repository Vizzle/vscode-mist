import { StatusBarItem } from "vscode";
import * as vscode from "vscode";
import * as path from "path";
import { MistDocument } from "./mistDocument";
import { MistContentProvider } from "./previewProvider";


export class StatusBarManager {
    public static dataItem: StatusBarItem;

    public static initialize() {
        this.dataItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
        this.dataItem.tooltip = "选择模版关联的数据";
        vscode.commands.registerCommand('mist.selectData', () => {
            let editor = vscode.window.activeTextEditor;
            let doc = MistDocument.getDocumentByUri(editor.document.uri);
            let datas = doc.getDatas();
            let items = datas.map(d => {
                let item: any = <vscode.QuickPickItem>{label: path.basename(d.file), detail: d.file, description: d.name || (d.index !== undefined ? `#${d.index + 1}` : null)};
                item.data = d
                return item;
            });
            vscode.window.showQuickPick(items).then(r => {
                if (!r) return;
                doc.setData(r.data);
                this.updateDataItemForDocument(doc);
                MistContentProvider.sharedInstance.send('selectData', {name});
            });
        });

        this.onDidChangeActiveTextEditor(vscode.window.activeTextEditor);
    }

    public static updateDataItemForDocument(doc: MistDocument) {
        if (!doc) return;
        let datas = doc.getDatas();
        if (doc.getData()) {
            let text = '$(file-text) ' + doc.getData().description();
            if (datas.length > 1) {
                text += ` (共 ${datas.length} 处)`
            }
            this.dataItem.text = text;
            this.dataItem.command = 'mist.selectData';
        }
        else if (datas && datas.length > 0) {
            this.dataItem.text = '$(file-text) Select Data...';
            this.dataItem.command = 'mist.selectData';
        }
        else {
            this.dataItem.text = '$(file-text) 未找到数据';
            this.dataItem.command = null;
        }
    }

    public static onDidChangeActiveTextEditor(editor: vscode.TextEditor) {
        if (editor && editor.document.languageId === 'mist') {
            let doc = MistDocument.getDocumentByUri(editor.document.uri);
            this.updateDataItemForDocument(doc);
            this.dataItem.show();
        }
        else {
            this.dataItem.hide();
        }
    }
}