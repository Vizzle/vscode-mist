'use strict';

import * as vscode from 'vscode';
import * as json from 'jsonc-parser'
import * as cp from 'child_process'
import * as net from 'net'
import { MistDocument, JsonString } from './mistDocument';

export default class MistDiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private _waiting = false;

    constructor(private context: vscode.ExtensionContext) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('mist');
        vscode.workspace.textDocuments.forEach(d => this.validate(d));
    }

    dispose() {
        this.diagnosticCollection.dispose();
    }

    public validate(document: vscode.TextDocument) {
        if (document.languageId !== 'mist') {
            return;
        }

        let errors: vscode.Diagnostic[] = [];
        let objectStack = [];
        let exps = [];
        let mistexpPath = this.context.asAbsolutePath('./bin/mistexp');
        let currentProperty: string;
        let range = (offset, length) => {
            let start = document.positionAt(offset);
            return new vscode.Range(start, start.translate(0, length));
        }
        json.visit(document.getText(), {
            onError(error: json.ParseErrorCode, offset: number, length: number) {
                errors.push(new vscode.Diagnostic(range(offset, length), json.getParseErrorMessage(error), vscode.DiagnosticSeverity.Error));
            },
            onObjectBegin (offset: number, length: number) {
                objectStack.push([]);
            },
            onObjectEnd (offset: number, length: number) {
                objectStack.pop();
            },
            onObjectProperty (property: string, offset: number, length: number) {
                currentProperty = property;
                let object: string[] = objectStack[objectStack.length - 1];
                if (object.indexOf(property) >= 0) {
                    errors.push(new vscode.Diagnostic(range(offset, length), `Duplicate object key '${property}'`, vscode.DiagnosticSeverity.Warning));
                }
                object.push(property);
            },
            onLiteralValue (value: any, offset: number, length: number) {
                if (typeof value === 'string') {
                    let jsonString = new JsonString(document.getText().substr(offset + 1, length - 2));
                    if (jsonString.errors.length > 0) {
                        jsonString.errors.forEach(e => {
                            errors.push(new vscode.Diagnostic(range(offset + e.offset + 1, e.length), 'Invalid escape character in string', vscode.DiagnosticSeverity.Error));
                        });
                    }

                    let match = value.match(/\$\{(?:[^}]|[\r\n])*/m);
                    if (match && match[0].length === value.length) {
                        errors.push(new vscode.Diagnostic(range(offset + length - 1, 1), 'unclosed expression', vscode.DiagnosticSeverity.Error));
                    }
                }
            }
        });

        let mistDoc = MistDocument.getDocumentByUri(document.uri);
        let expAnalyseErrors = mistDoc ? mistDoc.validate() : [];
        
        Promise.all([errors, expAnalyseErrors]).then(values => {
            let diagnostics = values.reduce((p, c, i, a) => {
                return p.concat(c);
            }, []);
            this.diagnosticCollection.set(document.uri, diagnostics);
        });
    }

    onChange(document: vscode.TextDocument) {
        if (!this._waiting) {
			this._waiting = true;
			setTimeout(() => {
				this._waiting = false;
				this.validate(document);
            }, 200);
		}
    }
    
}
