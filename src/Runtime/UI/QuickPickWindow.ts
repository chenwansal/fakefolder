import * as vscode from 'vscode';

export class QuickPickWindow {

    private inputValue: string;

    OnConfirmHandle: (value: string) => void;

    constructor() {
        this.inputValue = "";
        this.OnConfirmHandle = () => { }
    }

    Open(title: string, placeHolder: string, isSelect: boolean, items: vscode.QuickPickItem[]) {
        let pick = vscode.window.createQuickPick();
        pick.title = title;
        pick.items = items;
        pick.placeholder = placeHolder;
        pick.busy = true;
        pick.show();
        pick.onDidChangeValue(value => {
            this.inputValue = value;
        });
        pick.onDidAccept(() => {
            pick.busy = false;
            pick.hide();
            if (!isSelect) {
                this.OnConfirmHandle(this.inputValue);
            }
        });
        pick.onDidChangeSelection((e) => {
            if (!isSelect) {
                return;
            }
            if (e && e.length > 0) {
                let v = e[0];
                this.OnConfirmHandle(v.label);
            }
        });
    }
}