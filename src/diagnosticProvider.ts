'use strict';

import * as vscode from 'vscode';
import * as json from 'jsonc-parser'
import * as cp from 'child_process'

export default class MistDiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private _waiting = false;

    constructor(private context: vscode.ExtensionContext) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('mist')
    }

    dispose() {
        this.diagnosticCollection.dispose();
    }

    private validate(document: vscode.TextDocument) {
        type Error = {
            offset: number;
            length: number;
            desc: string;
            type: vscode.DiagnosticSeverity;
        };
        let errors: Error[] = [];
        let objectStack = [];
        let exps = [];
        let mistexpPath = this.context.asAbsolutePath('./bin/mistexp');
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
            onLiteralValue (value: any, offset: number, length: number) {
                if (typeof value === 'string') {
                    let expRE = /\$\{(.*?)\}/mg;
                    let match;
                    while (match = expRE.exec(value)) {
                        exps.push({exp: match[1], offset: offset + 1 + match.index+2, length: match[1].length});
                    }
                }
            }
        });

        let mistexpPromist = new Promise<Error[]>((resolve, reject) => {
            if (exps.length == 0) {
                resolve([]);
            }

            let mistexp = cp.spawn(mistexpPath);
            mistexp.stdout.on("data", out => {
                let str: string;
                if (typeof out === 'string') {
                    str = out;
                }
                else {
                    str = out.toString("utf8");
                }
                let result = str.split('\x1e');
                let errors = exps.map((v, i) => [v, result[i]] ).filter(v => v[1].length > 0).map(v => <Error>{
                    type: vscode.DiagnosticSeverity.Error,
                    desc: v[1],
                    offset: v[0].offset,
                    length: v[0].length,
                });
                resolve(errors);
            });
            mistexp.on("exit", () => resolve([]));

            mistexp.stdin.write( exps.map(e => e.exp).join('\x1e') );
            mistexp.stdin.end();
        });
        
        Promise.all([errors, mistexpPromist]).then(values => {
            let diagnostics = values.reduce((p, c, i, a) => {
                return p.concat(c);
            }).map(err => {
                let range = new vscode.Range(document.positionAt(err.offset), document.positionAt(err.offset + err.length));
                return new vscode.Diagnostic(range, err.desc, err.type);
            });
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
