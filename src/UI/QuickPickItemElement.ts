import * as vscode from 'vscode';

export class QuickPickItemElement implements vscode.QuickPickItem {
    label: string;
    kind?: vscode.QuickPickItemKind | undefined;
    description?: string | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    alwaysShow?: boolean | undefined;
    buttons?: readonly vscode.QuickInputButton[] | undefined;

    constructor(label: string) {
        this.label = label;
    }

}