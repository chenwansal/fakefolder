// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export class MyDataProvider implements vscode.TreeDataProvider<MyClass> {

	onDidChangeTreeData?: vscode.Event<void | MyClass | null | undefined> | undefined;

	getTreeItem(element: MyClass): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: MyClass): vscode.ProviderResult<MyClass[]> {
		let arr = [];
		arr.push(new MyClass("yo", "1.1.0", vscode.TreeItemCollapsibleState.Collapsed));
		return Promise.resolve(arr);
	}

}

export class MyClass extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		private version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
		this.tooltip = `${this.label}-${this.version}`;
		this.description = this.version;
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "another-folder-view" is now active!');
	vscode.window.registerTreeDataProvider("myview", new MyDataProvider());

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('another-folder-view.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from another_folder_view!');

		vscode.window.createTreeView("myview", {
			treeDataProvider: new MyDataProvider(),
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
