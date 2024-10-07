import { commands, ExtensionContext, window } from 'vscode';
import { registerCacheCommand } from './extension/features/cache-operation';
import { registerWebViewProvider } from "./extension/views/register-webview-provider";
import * as vscode from 'vscode';
import * as path from 'path';
import BackendFactory from './extension/backend/algorithms/information-retrieval/BackendFactory';

let globalContext: ExtensionContext;

export function activate(context: ExtensionContext) {
	globalContext = context;

	// Clear searchTerm, editDistance, and index from workspaceState
	context.workspaceState.update("searchTerm", undefined);
	context.workspaceState.update("editDistance", undefined);
	globalContext.workspaceState.update("index", undefined);

	const op = window.createOutputChannel('Search Master');
	registerCacheCommand(context);
	registerWebViewProvider(context, op);
	commands.executeCommand('setContext', 'isPrintContextMenu', true);

	const watcher = vscode.workspace.createFileSystemWatcher('**/*.*');

	watcher.onDidChange((uri) => {
		console.log("Change to file " + uri.fsPath);
		BackendFactory.getInstance().updateBackendIndex(uri.fsPath, context);
	});

	watcher.onDidCreate((uri) => {
		console.log("Create file " + uri.fsPath);
		BackendFactory.getInstance().updateBackendIndex(uri.fsPath, context);
	});

	let disposable = commands.registerCommand('extension.openFile', async (filePath: string) => {
		// Resolve the file path to the workspace
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
		const fullPath = path.join(workspaceFolder || '', filePath);
		
		// Use vscode API to open the file
		const document = await vscode.workspace.openTextDocument(fullPath);
		await vscode.window.showTextDocument(document);
	});

	context.subscriptions.push(watcher);
}

export function deactivate() { }
