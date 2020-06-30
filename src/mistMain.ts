'use strict';

import { MistDocument } from './mistDocument'
import * as convertor from './convertor';
import { MistContentProvider, isMistFile, MistPreviewPanel } from './previewProvider';
import MistNodeTreeProvider from './nodeTreeProvider';
import MistCompletionProvider from './completionProvider'
import MistDiagnosticProvider from './diagnosticProvider'
import { format } from './formatter'
import * as color from './utils/color'

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { commands, ExtensionContext, TextEditor, TextEditorEdit } from 'vscode';
import { MistSignatureHelpProvider } from './signatureHelpProvider';
import { StatusBarManager } from './statusBarManager';
import { registerMistServer, stopServerFunc } from './mistServer';
import { registerCompiledPreview } from './compiledPreview';
import { registerMistTemplate } from './compileUpload';

export function activate(context: ExtensionContext) {
    setupMistDocument(context);
    setupStatusBarManager(context);
    registerConvertor(context);
    registerMistServer(context);
    registerPreviewProvider(context);
    registerNodeTreeProvider(context);
    registerCompletionProvider(context);
    registerSignatureHelpProvider(context);
    registerDiagnosticProvider(context);
    registerValidateWorkspace(context);
    registerFormatter(context);
    registerColorDecorations(context);
    registerCompiledPreview(context);
    registerMistTemplate(context);
}

function setupStatusBarManager(context: ExtensionContext) {
    StatusBarManager.initialize();
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        StatusBarManager.onDidChangeActiveTextEditor(editor);
    }));
}

function setupMistDocument(context: ExtensionContext) {
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => {
        MistDocument.onDidOpenTextDocument(document);
    }));

    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(document => {
        MistDocument.onDidCloseTextDocument(document);
    }));

    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
        MistDocument.onDidSaveTextDocument(document);
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        MistDocument.onDidChangeTextDocument(event);
    }));

    MistDocument.initialize();
}

export function deactivate(context: ExtensionContext) {
    if (stopServerFunc) {
        return stopServerFunc();
    }
}

function registerPreviewProvider(context: ExtensionContext) {
    MistContentProvider.context = context;
    const contentProvider = MistContentProvider.sharedInstance;
    const contentProviderRegistration = vscode.workspace.registerTextDocumentContentProvider('mist-preview', contentProvider);
    context.subscriptions.push(contentProviderRegistration);

    context.subscriptions.push(
        vscode.commands.registerCommand('mist.showPreviewToSide', () => {
            MistPreviewPanel.createOrShow(context.extensionPath);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('mist.updatePreview', () => {
            contentProvider.render(true)
        })
    );

    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(MistPreviewPanel.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                console.log(`Got state: ${state}`);
                MistPreviewPanel.revive(webviewPanel);
            }
        });
    }

    context.subscriptions.push(vscode.window.onDidChangeVisibleTextEditors(editors => {
        contentProvider.update()
    }));

    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
        if (isMistFile(document)) {
            contentProvider.update()
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        if (isMistFile(event.document)) {
            contentProvider.update();
        }
    }));

    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(event => {
        if (event.textEditor.document.languageId === 'mist') {
            contentProvider.selectionDidChange(event.textEditor);
        }
    }));
}

function registerConvertor(context: ExtensionContext) {
    context.subscriptions.push(commands.registerTextEditorCommand('mist.convertToNew', (textEditor: TextEditor, edit: TextEditorEdit) => {
        try {
            let isHomePage = path.basename(textEditor.document.fileName).startsWith('home_');
            let [newText, error, todoCount] = convertor.convertToNewFormat(textEditor.document.getText(), isHomePage);
            if (error) {
                vscode.window.showErrorMessage(error);
            }
            else {
                textEditor.edit(edit => edit.replace(new vscode.Range(textEditor.document.positionAt(0), textEditor.document.positionAt(textEditor.document.getText().length)), newText)).then(success => {
                    if (todoCount > 0) {
                        vscode.window.showInformationMessage("有 " + todoCount + " 个需要检查的地方");
                        let todoMark = "// TODO";
                        let index = textEditor.document.getText().indexOf(todoMark);
                        textEditor.selection = new vscode.Selection(textEditor.document.positionAt(index), textEditor.document.positionAt(index + todoMark.length));
                        textEditor.revealRange(textEditor.selection);
                        vscode.commands.executeCommand("actions.find");
                    }
                });
            }
        } catch (error) {
            vscode.window.showErrorMessage(error);
        }
    }));

    context.subscriptions.push(commands.registerCommand('mist.convertAll', args => {
        if (!vscode.workspace.rootPath) {
            vscode.window.showErrorMessage("未打开文件夹");
            return;
        }

        vscode.window.showInformationMessage("该操作可能会修改当前目录下的所有 .mist 文件，且无法撤销，确定要继续吗？", "确定").then(result => {
            if (result === "确定") {
                vscode.workspace.findFiles("*.mist").then(files => {
                    if (files.length === 0) {
                        vscode.window.showWarningMessage("没有找到 .mist 模版文件");
                        return;
                    }

                    let allTodoCount = 0;
                    let successCount = 0;
                    let failedCount = 0;
                    files.forEach(uri => {
                        let filePath = uri.fsPath;
                        let text = fs.readFileSync(filePath, "utf-8");
                        try {
                            let fileName = path.basename(filePath);
                            let [newText, error, todoCount] = convertor.convertToNewFormat(text, fileName.startsWith("home_"));
                            allTodoCount += todoCount;
                            if (error) {
                                throw error;
                            }
                            else {
                                fs.writeFileSync(filePath, newText, { encoding: "utf-8" });
                                console.log('"' + filePath + '" 转换成功');
                                successCount++;
                            }
                        } catch (error) {
                            console.error('"' + filePath + '" 转换失败，' + error);
                            failedCount++;
                        }
                    });

                    let info = "转换完成，其中 " + successCount + " 个成功，" + failedCount + " 个失败" + (allTodoCount > 0 ? "，共有 " + allTodoCount + " 个需要检查的地方，已用 '// TODO' 标记" : "");
                    vscode.window.showInformationMessage(info);
                });
            }
        });
    }));
}

function registerNodeTreeProvider(context: ExtensionContext) {
    const nodeTreeProvider = new MistNodeTreeProvider(context);

    vscode.languages.registerDocumentSymbolProvider({ language: 'mist' }, nodeTreeProvider);
    const treeView = vscode.window.createTreeView('mistNodeTree', { showCollapseAll: true, treeDataProvider: nodeTreeProvider });

    vscode.commands.registerCommand('mist.openNodeSelection', range => {
        nodeTreeProvider.select(range);
    });

    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
        if (document.languageId === 'mist') {
            nodeTreeProvider.update();
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'mist') {
            nodeTreeProvider.update();
        }
    }));

    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(e => {
        const mistDoc = MistDocument.getDocumentByUri(e.textEditor.document.uri)
        if (!mistDoc) return

        const node = mistDoc.nodeAtOffset(mistDoc.getRootMistNode(), e.textEditor.document.offsetAt(e.selections[0].start))
        if (node) {
            treeView.reveal(node.node, {
                expand: 1,
            })
        }
    }))
}

function registerCompletionProvider(context: ExtensionContext) {
    let completionProvider = new MistCompletionProvider();
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: 'mist' }, completionProvider));
    context.subscriptions.push(vscode.languages.registerHoverProvider({ language: 'mist' }, completionProvider));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider({ language: 'mist' }, completionProvider));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(event => {
        if (event.textEditor.document.languageId === 'mist') {
            completionProvider.selectionDidChange(event.textEditor);
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'mist') {
            let textEditor = vscode.window.visibleTextEditors.find(e => e.document === event.document);
            completionProvider.documentDidChange(textEditor, event);
        }
    }));
    vscode.commands.registerCommand("mist.moveToLineEnd", () => {
        let textEditor = vscode.window.activeTextEditor;
        if (!textEditor) return;
        let pos = textEditor.selection.end.translate(0, 2);
        textEditor.selection = new vscode.Selection(pos, pos); 
    });
    vscode.commands.registerCommand("mist.triggerSuggest", () => {
        let textEditor = vscode.window.activeTextEditor;
        if (!textEditor) return;
        let doc = textEditor.document;
        let sel = textEditor.selection.start;
        let items = completionProvider.provideCompletionItems(doc, sel, null);
        if (items && items.length > 0) {
            vscode.commands.executeCommand("editor.action.triggerSuggest");
        }
    });
}

function registerSignatureHelpProvider(context: ExtensionContext) {
    let signatureHelpProvider = new MistSignatureHelpProvider();
    context.subscriptions.push(vscode.languages.registerSignatureHelpProvider({ language: 'mist' }, signatureHelpProvider, '(', ','));
}

let diagnosticProvider: MistDiagnosticProvider;

function registerDiagnosticProvider(context: ExtensionContext) {
    diagnosticProvider = new MistDiagnosticProvider(context);
    context.subscriptions.push(diagnosticProvider);

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        diagnosticProvider.onChange(event.document);
    }));

    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => {
        diagnosticProvider.onChange(document);
    }));

    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
        diagnosticProvider.onChange(document);
    }));

}

function registerValidateWorkspace(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('mist.validateWorkspace', () => {
        if (!vscode.workspace.rootPath) {
            vscode.window.showWarningMessage("未打开文件夹");
            return;
        }

        vscode.workspace.findFiles("*.mist").then(files => {
            if (files.length === 0) {
                vscode.window.showWarningMessage("没有找到 .mist 模版文件");
                return;
            }

            let promises = files.map(uri => vscode.workspace.openTextDocument(uri).then(doc => diagnosticProvider.validate(doc)));
            Promise.all(promises).then(() => {
                vscode.commands.executeCommand("workbench.action.problems.focus");
            });
        });
    }));
}

function registerFormatter(context: ExtensionContext) {
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('mist', {
        provideDocumentFormattingEdits(doc: vscode.TextDocument, options: vscode.FormattingOptions, token: vscode.CancellationToken) {
            return format(doc, null, options);
        }
    }));

    context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider('mist', {
        provideDocumentRangeFormattingEdits(doc: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken) {
            return format(doc, range, options);
        }
    }));

    context.subscriptions.push(vscode.languages.registerOnTypeFormattingEditProvider('mist', {
        provideOnTypeFormattingEdits(doc: vscode.TextDocument, pos: vscode.Position, ch: string, options: vscode.FormattingOptions, token: vscode.CancellationToken) {
            if (ch === '\n') {
                const lineRange = doc.lineAt(pos.translate(-1)).range;
                const p = lineRange.end;
                const edits = format(doc, lineRange, options);
                let text = doc.getText(lineRange);
                // 换行时追加逗号
                if (text.match(/((:\s*(true|false|null|-?\d+(\.\d+)?([eE][+-]?\d+)?|"[.*]"))|["\]}])\s*$/)) {
                    edits.push(new vscode.TextEdit(new vscode.Range(p, p), ','));
                }
                return edits;
            }
            else {
                return format(doc, doc.lineAt(pos).range, options);
            }
        }
    }, '\n', ':', '"', '{', '['));
}

function registerColorDecorations(context: ExtensionContext) {
    let decorationType = vscode.window.createTextEditorDecorationType({
        before: {
            contentText: ' ',
            border: 'solid 0.1em #000',
            margin: '0.1em 0.2em 0 0.2em',
            width: '0.8em',
            height: '0.8em',
            
        },
        dark: {
            before: {
                border: 'solid 0.1em #eee'
            }
        }
    });
    context.subscriptions.push(decorationType);

    function _updateColorDecorations(document: vscode.TextDocument) {
        if (!document) {
            return;
        }

        let textEditor = vscode.window.visibleTextEditors.find(e => e.document === document);
        if (!textEditor) {
            return;
        }

        if (document.languageId !== 'mist') {
            textEditor.setDecorations(decorationType, []);
            return;
        }

        let colorResults = []
        let text = document.getText();
        let colorRE = /#((([a-fA-F0-9]{2}){3,4})|([a-fA-F0-9]{3,4}))\b/mg;
        let match;
        while (match = colorRE.exec(text)) {
            colorResults.push({color: match[0], offset: match.index});
        }

        textEditor.setDecorations(decorationType, []);
        textEditor.setDecorations(decorationType, colorResults.map(c => {
            let position = document.positionAt(c.offset);
            let cl = color.cssColor(c.color);

            return <vscode.DecorationOptions> {
                range: new vscode.Range(position, position),
                renderOptions: {
                    before: {
                        backgroundColor: cl
                    }
                }
            }
        }));
    }
    
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        _updateColorDecorations(event.document);
    }));
    
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => {
        _updateColorDecorations(document);
    }));

    vscode.window.onDidChangeVisibleTextEditors(editors => {
        for (let editor of editors) {
            _updateColorDecorations(editor.document);
        }
    }, null, [decorationType]);

    function updateAllEditors() {
        vscode.window.visibleTextEditors.forEach(editor => {
            if (editor.document) {
                _updateColorDecorations(editor.document);
            }
        });
    }

    updateAllEditors();
}
