
'use strict';

import * as vscode from 'vscode';
import { MistDocument } from './mistDocument';

export default class MistCompletionProvider implements vscode.CompletionItemProvider, vscode.HoverProvider, vscode.DefinitionProvider {
    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition> {
        return MistDocument.getDocumentByUri(document.uri).provideDefinition(position, token);
    }
    
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        return MistDocument.getDocumentByUri(document.uri).provideHover(position, token);
    }

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
        return MistDocument.getDocumentByUri(document.uri).provideCompletionItems(position, token);
    }
    
    selectionDidChange(textEditor: vscode.TextEditor) {
        if (textEditor.selection.start.compareTo(textEditor.selection.end) != 0) {
            return;
        }

        let doc = textEditor.document;
        let sel = textEditor.selection.start;
        if (textEditor.document.getText(new vscode.Range(doc.positionAt(doc.offsetAt(sel) - 1), doc.positionAt(doc.offsetAt(sel) + 1))) == '""') {
            let items = this.provideCompletionItems(doc, sel, null);
            if (items && items.length > 0) {
                vscode.commands.executeCommand("editor.action.triggerSuggest");
            }
        }
    }

    private static triggerRE = /[a-zA-Z_.]/;
    isTriggerCharacter(c: string) {
        return c.length == 1 && MistCompletionProvider.triggerRE.test(c);
    }

    documentDidChange(textEditor: vscode.TextEditor, event: vscode.TextDocumentChangeEvent) {
        if (!this.isTriggerCharacter(event.contentChanges[0].text)) {
            return;
        }
        
        let doc = textEditor.document;
        let sel = textEditor.selection.start.translate(0, 1);
        let items = this.provideCompletionItems(doc, sel, null);
        if (items && items.length > 0) {
            vscode.commands.executeCommand("editor.action.triggerSuggest");
        }
    }
}
