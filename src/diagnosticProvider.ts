'use strict';

import * as vscode from 'vscode';
import * as json from 'jsonc-parser'
import * as cp from 'child_process'
import * as net from 'net'
import MistServer from './mistServer'

export default class MistDiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private _waiting = false;

    constructor(private context: vscode.ExtensionContext, private server: MistServer) {
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
        let currentProperty: string;
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
                currentProperty = property;
                let object: string[] = objectStack[objectStack.length - 1];
                if (object.indexOf(property) >= 0) {
                    errors.push({offset:offset, length:length, desc:"Duplicate object key", type:vscode.DiagnosticSeverity.Warning});
                }
                object.push(property);
            },
            onLiteralValue (value: any, offset: number, length: number) {
                if (typeof value === 'string') {
                    let offsets = [];
                    let origin = document.getText().substr(offset, length);
                    for (let i = 0; i < origin.length; i++) {
                        let c = origin.charAt(i);
                        if (c == '\\' && i < origin.length - 1) {
                            c = origin.charAt(i + 1);
                            switch (c) {
                                case '"':
                                case '\\':
                                case '/':
                                case 'b':
                                case 'f':
                                case 'n':
                                case 'r':
                                case 't':
                                    offsets.push(i);
                                    i++;
                                    break;
                                case 'u':
                                    offsets.push(i);
                                    i++;
                                    let n = 4;
                                    do {
                                        if (i < origin.length - 1 && /[0-9A-F]/i.test(origin.charAt(i + 1))) {
                                            i++;
                                        }
                                        else {
                                            errors.push({offset:offset, length:length, desc:'Invalid unicode sequence in string', type:vscode.DiagnosticSeverity.Error});
                                            break;
                                        }
                                    } while (--n > 0);
                                    if (n != 0) {
                                        i++;
                                    }
                                    break;
                                default:
                                    i++;
                                    errors.push({offset:offset, length:length, desc:'Invalid escape character in string', type:vscode.DiagnosticSeverity.Error});
                                    break;
                            }
                        }
                        else {
                            offsets.push(i);
                        }
                    }
                    offsets.push(origin.length);

                    let originOffset = (offset, offsets) => offsets[offset];
                    
                    
                    if (currentProperty === 'repeat') {
                        let expRE = /^(.*)(\s+in\s+)((?:.|[\r\n])*)$/m;
                        let match = expRE.exec(value);
                        if (match) {
                            let start = 1 + match.index + match[1].length + match[2].length;
                            let expOffsets = offsets.slice(start, start + match[3].length + 2);
                            exps.push({exp: match[3], offset: offset, length: match[3].length, offsets:expOffsets});
                            return;
                        }
                    }

                    if (/\$\{((?:[^}]|[\r\n])*)$/m.test(value)) {
                        errors.push({offset: offset + length - 1, length: 1, desc: "unclosed expression", type: vscode.DiagnosticSeverity.Error});
                        return;
                    }

                    let expRE = /\$\{((?:.|[\r\n])*?)\}/mg;
                    let match;
                    while (match = expRE.exec(value)) {
                        let start = 1 + match.index + 2;
                        let expOffsets = offsets.slice(start, start + match[1].length + 2);
                        exps.push({exp: match[1], offset: offset, length: match[1].length, offsets:expOffsets});
                    }
                }
            }
        });

        let mistexpPromise = this.server.send("checkExp", exps.map(e => e.exp).join('\x1e')).then(str => {
            let result = str.split('\x1e');
            let errors = exps.map((v, i) => [v, result[i]] ).filter(v => v[1].length > 0).map(v => {
                let match = /^\[(\d+), (\d+)\] (.+)$/.exec(v[1]);
                let error: Error;
                if (match) {
                    error = {
                        type: vscode.DiagnosticSeverity.Error,
                        desc: match[3],
                        offset: parseInt(match[1]),
                        length: Math.max(1, parseInt(match[2])),
                    };
                }
                else {
                    error = {
                        type: vscode.DiagnosticSeverity.Error,
                        desc: v[1],
                        offset: 0,
                        length: v[0].length,
                    };
                }
                let originOffset = v[0].offset + v[0].offsets[error.offset];
                let originLength = v[0].offsets[error.offset + error.length] - v[0].offsets[error.offset];
                error.offset = originOffset;
                error.length = originLength;
                return error;
            });
            return errors;
        }).catch(err => <Error[]>[]);
        
        Promise.all([errors, mistexpPromise]).then(values => {
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
