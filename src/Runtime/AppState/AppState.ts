import { TextDocument, TreeView } from "vscode";
import { REDataProvider, REElement } from "../../extension";

export class AppState {

    static re: REDataProvider;
    static treeview: TreeView<REElement>;
    static curTextDocu: TextDocument;

}
