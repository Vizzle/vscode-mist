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
        let objectStack = [];
        json.visit(document.getText(), {
            onError(error: json.ParseErrorCode, offset: number, length: number) {
                errors.push({offset:offset, length:length, desc:json.getParseErrorMessage(error), type:vscode.DiagnosticSeverity.Error});
            },
            onObjectBegin (offset: number, length: number) {
                objectStack.push([]);
            },
            onObjectEnd (offset: number, length: number) {
                objectStack.pop();
            },
            onObjectProperty (property: string, offset: number, length: number) {
                let object: string[] = objectStack[objectStack.length - 1];
                if (object.indexOf(property) >= 0) {
                    errors.push({offset:offset, length:length, desc:"Duplicate object key", type:vscode.DiagnosticSeverity.Warning});
                }
                object.push(property);
            },
        });

        let diagnostics = errors.map(err => {
            let range = new vscode.Range(document.positionAt(err.offset), document.positionAt(err.offset + err.length));
            return new vscode.Diagnostic(range, err.desc, err.type);
        });
        this.diagnosticCollection.set(document.uri, diagnostics);
    }
    
}
