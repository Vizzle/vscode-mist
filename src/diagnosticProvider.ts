'use strict';

import * as vscode from 'vscode';
import * as json from 'jsonc-parser'

export default class MistDiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('mist')
    }

    dispose() {
        this.diagnosticCollection.dispose();
    }

    onChange(document: vscode.TextDocument) {
        let errors = [];
        json.visit(document.getText(), {
            onError(error: json.ParseErrorCode, offset: number, length: number) {
                errors.push({offset:offset, length:length, desc:json.getParseErrorMessage(error)});
            }
        });

        let diagnostics = errors.map(err => {
            let range = new vscode.Range(document.positionAt(err.offset), document.positionAt(err.offset + err.length));
            return new vscode.Diagnostic(range, err.desc, vscode.DiagnosticSeverity.Error);
        });
        this.diagnosticCollection.set(document.uri, diagnostics);
    }
    
}
