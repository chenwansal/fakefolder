import * as vscode from 'vscode';
import { AppState } from '../AppState/AppState';
import { RENode } from '../Entity/RENode';
import { CommandHelper } from '../Helper/CommandHelper';
import { SaveService } from '../Service/SaveService';
import { QuickPickWindow } from '../UI/QuickPickWindow';
import { QuickPickItemElement } from '../UI/QuickPickItemElement';
import path = require('path');

function GetFolderItems(save: SaveService) {
    let items: QuickPickItemElement[] = [];
    save.GetFolderNode().forEach(folder => {
        items.push(new QuickPickItemElement(folder.name));
    });
    return items;
}

export class CommandSystem {

    static Init(ctx: vscode.ExtensionContext) {
        this.RegisterCreateFolder(ctx);
        this.RegisterPutFileToFolder(ctx);
    }

    private static RegisterCreateFolder(ctx: vscode.ExtensionContext) {

        let dis1 = vscode.commands.registerCommand(CommandHelper.GetFullCommand("create-fake-folder"), () => {
            let save = SaveService.Instance;
            let curFolderInput = new QuickPickWindow();
            let folderToCreate = "";
            curFolderInput.OnConfirmHandle = (curFolderName) => {

                folderToCreate = curFolderName;

                let parentFolderInput = new QuickPickWindow();
                parentFolderInput.OnConfirmHandle = (parentFolderName) => {
                    let parentNode = save.FindNodeWithDir(parentFolderName);
                    if (!parentNode) {
                        let node = new RENode(save.GetCount(), folderToCreate, true, "", -1);
                        save.AddNode(node);
                        return;
                    } else {
                        let node = new RENode(save.GetCount(), folderToCreate, true, "", parentNode.id);
                        parentNode.childrenFolder.push(node.id);
                        save.AddNode(node);
                    }
                    AppState.re.TriggerTreeChange();
                };

                parentFolderInput.Open("Create Fake Folder(2/2)", "Input Parent Folder Name", true, GetFolderItems(save));
            };
            curFolderInput.Open("Create Fake Folder(1/2)", "Input Folder Name", false, []);
        });
    }

    private static RegisterPutFileToFolder(ctx: vscode.ExtensionContext) {
        let dis1 = vscode.commands.registerCommand(CommandHelper.GetFullCommand("put-file-to-fake-folder"), () => {
            if (AppState.curTextDocu) {
                let curFileTruePath = AppState.curTextDocu.fileName;
                let save = SaveService.Instance;
                let targetFolderInput = new QuickPickWindow();
                targetFolderInput.OnConfirmHandle = (targetFolderName) => {
                    let parentNode = save.FindNodeWithDir(targetFolderName);
                    if (!parentNode) {
                        return;
                    }
                    let node = new RENode(save.GetCount(), path.basename(curFileTruePath), false, curFileTruePath, parentNode.id);
                    parentNode.childrenFile.push(node.id);
                    save.AddNode(node);
                    AppState.re.TriggerTreeChange();
                };
                targetFolderInput.Open("Put Current File To Fake Folder", "Select Target Folder", true, GetFolderItems(save));
            } else {
                console.log("未选中");
            }
        });

    }

}
