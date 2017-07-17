
'use strict';

import * as vscode from 'vscode';
import * as json from 'jsonc-parser';
import * as path from 'path';

export default class MistNodeTreeProvider implements vscode.TreeDataProvider<json.Node>, vscode.DocumentSymbolProvider {
    private _onDidChangeTreeData: vscode.EventEmitter<json.Node | null> = new vscode.EventEmitter<json.Node | null>();
	readonly onDidChangeTreeData: vscode.Event<json.Node | null> = this._onDidChangeTreeData.event;

	private tree: json.Node;
	private editor: vscode.TextEditor;

	constructor(private context: vscode.ExtensionContext) {
		vscode.window.onDidChangeActiveTextEditor(editor => {
			this.update();
		});
		vscode.workspace.onDidChangeTextDocument(e => {
		})
		this.parseTree();
	}

	update() {
		this.parseTree();
		this._onDidChangeTreeData.fire();
	}

	private onDocumentChanged(changeEvent: vscode.TextDocumentChangeEvent): void {
		if (changeEvent.document.uri.toString() === this.editor.document.uri.toString()) {
			for (const change of changeEvent.contentChanges) {
			}
		}
	}

	private getProp(node: json.Node, key: string): json.Node {
		if (node && node.type == "object") {
			let r = node.children.find(p => p.children[0].value == key);
			if (r) {
				return r.children[1];
			}
		}
		return null;
	}

	private getType(node: json.Node): string {
		if (node.type == 'object') {
			let childrenNode = this.getProp(node, 'children');
			let typeNode = this.getProp(node, 'type');
			return typeNode ? typeNode.value : childrenNode ? 'stack' : 'node';
		}
		else if (node.type == 'string' && (<string>node.value).match(/^\${.+}$/)) {
			return "exp";
		}
		else {
			return "unknown";
		}
	}

	private getStringValue(node: json.Node, key: string): string {
		let prop = this.getProp(node, key);
		return prop && prop.type == 'string' ? prop.value : null;
	}

	private parseTree(): void {
		this.tree = null;
		this.editor = vscode.window.activeTextEditor;
		if (this.editor && this.editor.document && this.editor.document.languageId === 'mist') {
			let tpl = json.parseTree(this.editor.document.getText());
			this.tree = this.getProp(tpl, 'layout');
		}
	}

	getChildren(node?: json.Node): Thenable<json.Node[]> {
		if (node) {
			return Promise.resolve(this._getChildren(node));
		} else {
			return Promise.resolve(this.tree ? [this.tree] : []);
		}
	}

	private _getChildren(node: json.Node): json.Node[] {
		let childrenNode = this.getProp(node, 'children');
		if (childrenNode) {
			return childrenNode.children;
		}
		return [];
	}

	private toArrayValueNode(node: json.Node): json.Node[] {
		if (node.type === 'array' || node.type === 'object') {
			return node.children;
		}
		node['arrayValue'] = true;
		return [node];
	}

	private getDesc(node: json.Node): string {
		if (node.type != 'object') {
			return node.value;
		}

		let type = this.getType(node);
		let desc: string;
		let style = this.getProp(node, 'style');
		switch (type) {
			case 'stack':
				desc = [this.getStringValue(style, 'direction'),
						this.getStringValue(style, 'background-color')].filter(n => !!n).join(' - ');
				break;

			case 'text':
			{
				let text = this.getStringValue(style, 'html-text')
					|| this.getStringValue(style, 'text');
				desc = text ? '"' + text + '"' : null;
				break;
			}
			case 'button':
			{
				desc = [this.getStringValue(style, 'title'),
						this.getStringValue(style, 'image')].filter(n => !!n).map(t => `"${t}"`).join(' - ');
				break;
			}
			case 'image':
			{
				let text = this.getStringValue(style, 'image-url')
					|| this.getStringValue(style, 'image');
				desc = text ? '"' + text + '"' : null;
				break;
			}
			case 'scroll':
				desc = this.getStringValue(style, 'scroll-direction');
				break;
		
			case 'paging':
				desc = this.getStringValue(style, 'direction');
				break;
		
			case 'indicator':
				desc = this.getStringValue(style, 'color');
				break;
		
			case 'line':
				desc = this.getStringValue(style, 'color');
				break;
		
			default:
				desc = this.getStringValue(style, 'background-color');
				break;
		}

		if (!desc) {
			desc = '';
		}

		let events = node.children.filter(p => (<string>p.children[0].value).startsWith('on-')).map(s => '[' + s.children[0].value + ']').join(' ');
		if (events) {
			desc = events + ' ' + desc;
		}

		if (this.getProp(node, 'repeat')) {
			desc = "[repeat] " + desc;
		}

		return desc;
	}

	private _getFullLineComment(line: number, document: vscode.TextDocument): string {
		let text = document.lineAt(line).text;
		if (text.match(/^\s*\/\//)) {
			return text.trim();
		}
		if (text.match(/^\s*\/\*.*\*\/\s*$/)) {
			return text.trim();
		}
		return null;
	}

	private _getLineTailComment(line: number, document: vscode.TextDocument): string {
		if (line < 0) {
			return null;
		}
		let text = document.lineAt(line).text;
		let matches = text.match(/\/\/.*$/);
		if (matches && matches.length > 0) {
			return matches[0];
		}
		matches = text.match(/\/\*.*\*\/\s*$/);
		if (matches && matches.length > 0) {
			return matches[0];
		}
		return null;
	}

	private getComment(node: json.Node, document: vscode.TextDocument): string {
		let lines = [];
		lines.push(document.positionAt(node.offset).line);
		if (node.children && node.children.length > 0) {
			lines.push(document.positionAt(node.children[0].offset).line);
		}
		let typeNode = this.getProp(node, 'type');
		if (typeNode) {
			lines.push(document.positionAt(typeNode.offset).line);
		}
		let linesSet = new Set(lines);
		for (let line of linesSet) {
			let comment = this._getFullLineComment(line - 1, document);
			if (comment) {
				return comment;
			}
			comment = this._getLineTailComment(line, document);
			if (comment) {
				return comment;
			}
		}
		return null;
	}

	private getLabel(node:json.Node): string {
		let type = this.getType(node);
		let desc = this.getDesc(node);
		let comment = this.getComment(node, this.editor.document);
		return `<${type || 'unknown'}>　${desc || ''} ${comment || ''}`;
	}

	getTreeItem(node: json.Node): vscode.TreeItem {
		let treeItem: vscode.TreeItem = new vscode.TreeItem(this.getLabel(node), this.getProp(node, 'children') ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
		treeItem.command = {
			command: 'mist.openNodeSelection',
			title: '',
			arguments: [new vscode.Range(this.editor.document.positionAt(node.offset), this.editor.document.positionAt(node.offset + node.length))]
		};
		treeItem.iconPath = this.getIcon(node);
		// treeItem.contextValue = this.getNodeType(node);
		return treeItem;
	}

	select(range: vscode.Range) {
		this.editor.selection = new vscode.Selection(range.start, range.end);
		this.editor.revealRange(this.editor.selection);
	}

	private getIcon(node: json.Node): any {
		let type = this.getType(node);
		let fileName = type || 'unknown';
		return {
			light: this.context.asAbsolutePath(path.join('media', 'light', `${fileName}.svg`)),
			dark: this.context.asAbsolutePath(path.join('media', 'dark', `${fileName}.svg`))
		}
	}


	// symbols provider
	private _provideNodeSymbols(node: json.Node, document: vscode.TextDocument, indent = 0): vscode.SymbolInformation[] {
		let symbols: vscode.SymbolInformation[] = [];
		let childrenNode = this.getProp(node, 'children');
		let type = this.getType(node);
		let desc = this.getDesc(node);
		let comment = this.getComment(node, document);
		let label = `${desc || ''} ${comment || ''}`;
		let offset = node.offset;
		if (node.type == 'object') {
			let typeNode = this.getProp(node, 'type');
			if (typeNode) {
				offset = typeNode.offset;
			}
			else if (node.children.length > 0) {
				offset = node.children[0].offset;
			}
		}
		symbols.push(new vscode.SymbolInformation('\t'.repeat(indent) + type, vscode.SymbolKind.Object, label, new vscode.Location(document.uri, document.positionAt(offset))));
		
		if (childrenNode) {
			let children = childrenNode.children;
			for (let i = 0; i < children.length; i++) {
				symbols = symbols.concat(this._provideNodeSymbols(children[i], document, indent + 1));
			}
		}
		return symbols;
	}

	provideDocumentSymbols(document: vscode.TextDocument): vscode.ProviderResult<vscode.SymbolInformation[]> {
		let errors = [];
		let tpl = json.parseTree(document.getText(), errors);
		if (errors.length > 0) {
			console.log("json parse error: ", errors);
        }
		
		let symbols:vscode.SymbolInformation[] = []

		for (let i = 0; i < tpl.children.length; i++) {
			let prop = tpl.children[i];
			let key = prop.children[0].value;
			let location = new vscode.Location(document.uri,  document.positionAt(prop.children[0].offset));
			symbols.push(new vscode.SymbolInformation(key, vscode.SymbolKind.Property, '<template>', location));
			switch (key) {
				case "state":
				case "styles":
				case "data":
					symbols = symbols.concat(prop.children[1].children.map(prop => {
						return new vscode.SymbolInformation('\t' + prop.children[0].value, vscode.SymbolKind.Field, '<' + key + '>', new vscode.Location(document.uri,  document.positionAt(prop.children[0].offset)));
					}));
					break;
				case "layout":
					symbols = symbols.concat(this._provideNodeSymbols(prop.children[1], document));
					break;
			}
		}

		return symbols;
	}
}