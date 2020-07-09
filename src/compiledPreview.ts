import { ExtensionContext } from "vscode"
import * as vscode from "vscode"
import * as fs from 'fs'
import { compile } from "mistc"

class CompiledPreviewDocumentProvider implements vscode.TextDocumentContentProvider {
  onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  async provideTextDocumentContent(uri: vscode.Uri) {
    const fileName = uri.fragment
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(fileName))
    const content = doc.getText()
    try {
      return await compile(fileName, { minify: false }, content) as string
    } catch (error) {
      return '编译失败：\n' + error
    }
  }
}

export function registerCompiledPreview(context: ExtensionContext) {
  const documentProvider = new CompiledPreviewDocumentProvider()
  context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('mist-compile', documentProvider))

  context.subscriptions.push(vscode.commands.registerCommand("mist.compiledPreview", async () => {
    const fileName = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.fileName
    if (!fs.existsSync(fileName) || !fileName.endsWith('.mist')) {
      vscode.window.showErrorMessage('当前没有打开 Mist 文件')
      return
    }

    const uri = generateUri(fileName)
    const doc = await vscode.workspace.openTextDocument(uri)
    await vscode.window.showTextDocument(doc, { preview: true, viewColumn: vscode.ViewColumn.Beside })
    documentProvider.onDidChangeEmitter.fire(uri)
  }))

  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
    documentProvider.onDidChangeEmitter.fire(generateUri(e.document.fileName))
  }))
}

function generateUri(fileName: string) {
  return vscode.Uri.parse(`mist-compile:${fileName.slice(0, -5)} (preview).mist#${fileName}`)
}