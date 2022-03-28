// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from "fs";
import { SaveService } from './Service/SaveService';
import path = require('path');
import { RENode } from './Entity/RENode';
import { CommandSystem } from './System/CommandSystem';
import { AppState } from './AppState/AppState';

const ROOT_PATH =
    vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;
const REFILTER_FILE_NAME = "refilter.json";

function PopMessage(msg: string) {
    vscode.window.showInformationMessage(msg);
}

let curFile = "";

async function OpenFile(path: string) {
    if (curFile == path) {
        return;
    }
    curFile = path;
    let docu: vscode.TextDocument = await vscode.workspace.openTextDocument(path);
    vscode.window.showTextDocument(docu);
}

export class REDataProvider implements vscode.TreeDataProvider<REElement> {

    curNode: RENode;
    curElement: REElement;

    constructor(save: SaveService) {
        this.curNode = save.RootNode();
        console.log(this.curNode);
        this.curElement = new REElement(this.curNode);
    }

    private _onDidChangeTreeData: vscode.EventEmitter<REElement | void> = new vscode.EventEmitter<REElement | void>();
    readonly onDidChangeTreeData: vscode.Event<REElement | void | null | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: REElement): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: REElement): vscode.ProviderResult<REElement[]> {

        if (!element || !element.node) {
            console.log("GET ROOT CHILDREN");
            return Promise.resolve([this.curElement]);
        }

        let res: REElement[] = [];

        let node = element.node;
        let save = SaveService.Instance;
        if (node.isFolder) {

            for (let i = 0; i < node.childrenFolder.length; i += 1) {
                let folderId = node.childrenFolder[i];
                let tar = save.FindNode(folderId);
                if (tar) {
                    res.push(new REElement(tar));
                }
            }

            for (let i = 0; i < node.childrenFile.length; i += 1) {
                let fileId = node.childrenFile[i];
                let tar = save.FindNode(fileId);
                if (tar) {
                    res.push(new REElement(tar, vscode.TreeItemCollapsibleState.None));
                }
            }

        }

        console.log("GET CHILD CHILDREN");
        return Promise.resolve(res);

    }

    TriggerTreeChange() {
        if (this._onDidChangeTreeData) {
            this._onDidChangeTreeData.fire();
        }
        console.log("FIRE");
    }

    resolveTreeItem(item: vscode.TreeItem, element: REElement, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {

        if (!element || !element.node) {
            return Promise.resolve(item);
        }

        if (!element.node.isFolder) {
            this.TriggerTreeChange();
        }

        if (AppState.treeview.selection.find(value => value == element)) {
            OpenFile(element.node.truePath);
            return Promise.resolve(element);
        }

        return Promise.resolve(element);
    }

}

export class REElement extends vscode.TreeItem {

    node: RENode;

    constructor(node: RENode, collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed) {
        super(node.name, collapsibleState);
        this.node = node;
    }

}

function GetFilterPath(): string {
    if (ROOT_PATH) {
        return path.join(ROOT_PATH, REFILTER_FILE_NAME);
    } else {
        return "";
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // REGISTER CALLBACK
    vscode.window.onDidChangeActiveTextEditor(e => {
        let doc = e?.document;
        if (doc) {
            AppState.curTextDocu = doc;
        }
    });

    // REGISTER COMMAND
    CommandSystem.Init(context);

    let filterPath = GetFilterPath();
    if (!fs.existsSync(filterPath)) {
        PopMessage("Not Found: " + filterPath);
        return;
    }

    // LOAD FROM refilter.json
    let save: SaveService = new SaveService(filterPath);
    save.LoadAll();
    console.log('(1/2)Resource Folder Loaded Nodes...');

    // CREATE Treeview
    let provider = new REDataProvider(save);
    let dis2 = vscode.window.registerTreeDataProvider("RETreeview", provider);
    let treeview = vscode.window.createTreeView("RETreeview", {
        treeDataProvider: provider,
    });
    AppState.re = provider;
    AppState.treeview = treeview;

    if (!ROOT_PATH) {
        console.log("no workspace");
        return;
    }

    console.log('(2/2)Resource Folder Rendered Treeview...');

    // RENDER Treeview

}

// this method is called when your extension is deactivated
export function deactivate() { }
