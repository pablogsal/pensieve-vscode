// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { setLinesHeat, clearDecorations } from './decorations';
import { CallStackDataProvider } from './tree';
import { TopDataProvider } from './top';
import { PensieveStats } from './data';

function openSourceFileAtLine(stats: PensieveStats, module: string, line: number) {
	vscode.workspace.openTextDocument(module).then((doc) => {
		vscode.window.showTextDocument(doc, vscode.ViewColumn.One, false).then((editor) => {
			clearDecorations();
			editor?.revealRange(new vscode.Range(
				editor.document.lineAt(line - 1).range.start,
				editor.document.lineAt(line - 1).range.end
			));
			console.log(`Opening file ${module} at line ${line}`);
			const lines = stats.lineMap.get(module);
			console.log(`Found ${lines?.size} lines`);
			if (lines) {
				setLinesHeat(lines, stats.tree?.value ?? 0);
			}
		});
	});
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let stats = new PensieveStats();

	vscode.workspace.onDidChangeTextDocument((changeEvent) => {
		clearDecorations();
	});

	const callStackProvider = new CallStackDataProvider();
	stats.registerAfterCallback((stats) => callStackProvider.refresh(stats));
	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(CallStackDataProvider.viewType, callStackProvider)
	);

	const topProvider= new TopDataProvider();
	stats.registerAfterCallback((stats) => topProvider.refresh(stats));
	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(TopDataProvider.viewType, topProvider)
	);

	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pensieve-vscode" is now active!');

	// Open lines from widgets

	context.subscriptions.push(
		vscode.commands.registerCommand('pensieve-vscode.openSourceAtLine', (module: string, line: number) => {
			openSourceFileAtLine(stats, module, line);
		})
	);

	// readFile

	let read_data = vscode.commands.registerCommand("pensieve-vscode.readFile", () => {
		vscode.window.showOpenDialog({
			"canSelectFiles": true,
			"canSelectMany": false,
			"title": "Pick a pensieve report file",
			"filters": {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				"Pensieve files": ["pensieve", "pprof"],
				// eslint-disable-next-line @typescript-eslint/naming-convention
				"All files": ["*"]
			}
		}).then((uris) => {
			if (uris) {
				const currentUri = uris[0];
				console.log('Scheme: ' + currentUri.scheme);
				if (currentUri?.scheme === "file") {
					const theFile = currentUri.fsPath;
					stats.readSampleFile(theFile);
				}
			}
		});

	});
	context.subscriptions.push(read_data);
}

// this method is called when your extension is deactivated
export function deactivate() {}
