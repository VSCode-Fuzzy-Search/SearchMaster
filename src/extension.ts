import { commands, ExtensionContext, window } from 'vscode';
import { registerCacheCommand } from './extension/features/cache-operation';
import { registerWebViewProvider } from "./extension/views/register-webview-provider";
import * as vscode from 'vscode';
import * as path from 'path';

let globalContext: ExtensionContext;

export function activate(context: ExtensionContext) {
	globalContext = context;

	// Clear searchTerm and editDistance from workspaceState
	context.workspaceState.update("searchTerm", undefined);
	context.workspaceState.update("editDistance", undefined);	

	const op = window.createOutputChannel('Search Master');
	registerCacheCommand(context);
	registerWebViewProvider(context, op);
	commands.executeCommand('setContext', 'isPrintContextMenu', true);

	let disposable = commands.registerCommand('extension.openFile', async (filePath: string) => {
		// Resolve the file path to the workspace
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
		const fullPath = path.join(workspaceFolder || '', filePath);
		
		// Use vscode API to open the file
		const document = await vscode.workspace.openTextDocument(fullPath);
		await vscode.window.showTextDocument(document);
	});
}

export function deactivate() {
	// Clear the index from workspaceState
	globalContext.workspaceState.update("index", undefined);
	console.log("index removed from workspace");
 }
