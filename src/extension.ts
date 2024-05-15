import { commands, ExtensionContext, window } from 'vscode';
import { registerCacheCommand } from './extension/features/cache-operation';
import { registerWebViewProvider } from "./extension/views/register-webview-provider";

export function activate(context: ExtensionContext) {
	const op = window.createOutputChannel('Search Master');
	registerCacheCommand(context);
	registerWebViewProvider(context, op);
	commands.executeCommand('setContext', 'isPrintContextMenu', true);
}

export function deactivate() { }
