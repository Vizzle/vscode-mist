'use strict';

import * as vscode from 'vscode';
import * as json from 'jsonc-parser'
import { MistDocument, JsonString } from './mistDocument';
import { NodeSchema } from './template_schema';

export default class MistDiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private _waiting = false;
    private ignoreMap: Map<number, boolean> = new Map()

    constructor(private context: vscode.ExtensionContext) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('mist');
        vscode.workspace.textDocuments.forEach(d => this.validate(d));
    }

    dispose() {
        this.diagnosticCollection.dispose();
    }

    public async validate(document: vscode.TextDocument) {
        if (document.languageId !== 'mist') {
            return;
        }

        let mistDoc = MistDocument.getDocumentByUri(document.uri);
        await NodeSchema.setCurrentDir(mistDoc.dir());

        let errors: vscode.Diagnostic[] = [];
        let objectStack = [];
        let currentProperty: string;
        let range = (offset, length) => {
            let start = document.positionAt(offset);
            return new vscode.Range(start, start.translate(0, length));
        }

        function checkString(offset: number, length: number) {
            let jsonString = new JsonString(document.getText().substr(offset + 1, length - 2));
            if (jsonString.errors.length > 0) {
                jsonString.errors.forEach(e => {
                    errors.push(new vscode.Diagnostic(range(offset + e.offset + 1, e.length), e.description, vscode.DiagnosticSeverity.Error));
                });
            }
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
                checkString(offset, length);
                
                currentProperty = property;
                let object: string[] = objectStack[objectStack.length - 1];
                if (object.indexOf(property) >= 0) {
                    errors.push(new vscode.Diagnostic(range(offset, length), `Duplicate object key '${property}'`, vscode.DiagnosticSeverity.Warning));
                }
                object.push(property);
            },
            onLiteralValue (value: any, offset: number, length: number) {
                if (typeof value === 'string') {
                    checkString(offset, length);

                    let match = value.match(/\$\{(?:[^}]|[\r\n])*/m);
                    if (match && match[0].length === value.length) {
                        errors.push(new vscode.Diagnostic(range(offset + length - 1, 1), 'unclosed expression', vscode.DiagnosticSeverity.Error));
                    }
                }
            }
        });

        let expAnalyseErrors = mistDoc ? mistDoc.validate() : [];

        expAnalyseErrors = expAnalyseErrors.filter(e => !this.hasIgnore(document, e.range.start))

        const diagnostics = [...errors, ...expAnalyseErrors]
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    hasIgnore(document: vscode.TextDocument, position: vscode.Position) {
        if (position.line === 0) return false

        const text = document.lineAt(position.line - 1).text
        const scanner = json.createScanner(text, false)
        let type: json.SyntaxKind
        do {
            type = scanner.scan()
            if (type === json.SyntaxKind.LineCommentTrivia) {
                const comment = scanner.getTokenValue().trim()
                return comment.match(/^\/\/\s*@ignore\b/)
            }
        } while (type !== json.SyntaxKind.EOF)

        return false
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
