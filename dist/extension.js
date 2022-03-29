/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SaveService = void 0;
const RENode_1 = __webpack_require__(4);
const fs = __webpack_require__(2);
class SaveService {
    constructor(refilterJsonPath) {
        this.jsonPath = refilterJsonPath;
        this.all = [];
        this.all.push(this.CreateRoot());
        if (SaveService.Instance == null) {
            SaveService.Instance = this;
        }
        else {
            return;
        }
    }
    CreateRoot() {
        return new RENode_1.RENode(0, "root", true, "", -1);
    }
    GetCount() {
        return this.all.length;
    }
    Travel(callback) {
        this.all.forEach(callback);
    }
    AddNode(node) {
        this.all.push(node);
        this.SaveAll();
        console.log(this.all.length);
    }
    RootNode() {
        return this.all[0];
    }
    RemoveNode(nodeId) {
        let arr = this.all;
        let index = arr.findIndex(value => value.id == nodeId);
        if (index != -1) {
            arr.splice(index, 1);
            for (let i = 0; i < arr.length; i += 1) {
                let node = arr[i];
                node.RemoveChild(nodeId);
            }
        }
    }
    FindNode(nodeId) {
        return this.all.find(value => value.id == nodeId);
    }
    FindNodeWithDir(dir) {
        return this.all.find(value => value.isFolder && value.name == dir);
    }
    GetFolderNode() {
        let res = this.all.filter(value => value.isFolder);
        return res;
    }
    LoadAll() {
        let jsonPath = this.jsonPath;
        if (!fs.existsSync(jsonPath)) {
            console.log("NO FILTER");
            return;
        }
        let str = fs.readFileSync(jsonPath, { encoding: "utf8" });
        try {
            this.all = JSON.parse(str);
            if (this.all.length == 0) {
                this.all.push(this.CreateRoot());
                this.SaveAll();
            }
        }
        catch {
            this.SaveAll();
        }
    }
    SaveAll() {
        let jsonPath = this.jsonPath;
        let str = JSON.stringify(this.all);
        fs.writeFileSync(jsonPath, str, { encoding: "utf-8" });
    }
}
exports.SaveService = SaveService;


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RENode = void 0;
class RENode {
    constructor(id, name, isFolder, truePath, parentID) {
        this.id = id;
        this.name = name;
        this.isFolder = isFolder;
        this.truePath = truePath;
        this.parentID = parentID;
        this.childrenFolder = [];
        this.childrenFile = [];
    }
    RemoveChild(targetNodeId) {
        this._RemoveChild(this.childrenFolder, targetNodeId);
        this._RemoveChild(this.childrenFile, targetNodeId);
    }
    _RemoveChild(arr, targetNodeId) {
        let index = arr.findIndex(value => value == targetNodeId);
        if (index != -1) {
            arr.slice(index, 1);
        }
    }
}
exports.RENode = RENode;


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommandSystem = void 0;
const vscode = __webpack_require__(1);
const AppState_1 = __webpack_require__(7);
const RENode_1 = __webpack_require__(4);
const CommandHelper_1 = __webpack_require__(8);
const SaveService_1 = __webpack_require__(3);
const QuickPickWindow_1 = __webpack_require__(9);
const QuickPickItemElement_1 = __webpack_require__(10);
const path = __webpack_require__(5);
function GetFolderItems(save) {
    let items = [];
    save.GetFolderNode().forEach(folder => {
        items.push(new QuickPickItemElement_1.QuickPickItemElement(folder.name));
    });
    return items;
}
class CommandSystem {
    static Init(ctx) {
        this.RegisterCreateFolder(ctx);
        this.RegisterPutFileToFolder(ctx);
    }
    static RegisterCreateFolder(ctx) {
        let dis1 = vscode.commands.registerCommand(CommandHelper_1.CommandHelper.GetFullCommand("create-fake-folder"), () => {
            let save = SaveService_1.SaveService.Instance;
            let curFolderInput = new QuickPickWindow_1.QuickPickWindow();
            let folderToCreate = "";
            curFolderInput.OnConfirmHandle = (curFolderName) => {
                folderToCreate = curFolderName;
                let parentFolderInput = new QuickPickWindow_1.QuickPickWindow();
                parentFolderInput.OnConfirmHandle = (parentFolderName) => {
                    let parentNode = save.FindNodeWithDir(parentFolderName);
                    if (!parentNode) {
                        let node = new RENode_1.RENode(save.GetCount(), folderToCreate, true, "", -1);
                        save.AddNode(node);
                        return;
                    }
                    else {
                        let node = new RENode_1.RENode(save.GetCount(), folderToCreate, true, "", parentNode.id);
                        parentNode.childrenFolder.push(node.id);
                        save.AddNode(node);
                    }
                    AppState_1.AppState.re.TriggerTreeChange();
                };
                parentFolderInput.Open("Create FakeFolder(2/2)", "Input Parent Folder Name", true, GetFolderItems(save));
            };
            curFolderInput.Open("Create FakeFolder(1/2)", "Input Folder Name", false, []);
        });
    }
    static RegisterPutFileToFolder(ctx) {
        let dis1 = vscode.commands.registerCommand(CommandHelper_1.CommandHelper.GetFullCommand("put-file-to-fake-folder"), () => {
            if (AppState_1.AppState.curTextDocu) {
                let curFileTruePath = AppState_1.AppState.curTextDocu.fileName;
                let save = SaveService_1.SaveService.Instance;
                let targetFolderInput = new QuickPickWindow_1.QuickPickWindow();
                targetFolderInput.OnConfirmHandle = (targetFolderName) => {
                    let parentNode = save.FindNodeWithDir(targetFolderName);
                    if (!parentNode) {
                        return;
                    }
                    let node = new RENode_1.RENode(save.GetCount(), path.basename(curFileTruePath), false, curFileTruePath, parentNode.id);
                    parentNode.childrenFile.push(node.id);
                    save.AddNode(node);
                    AppState_1.AppState.re.TriggerTreeChange();
                };
                targetFolderInput.Open("Put Current File To FakeFolder", "Select Target Folder", true, GetFolderItems(save));
            }
            else {
                console.log("未选中");
            }
        });
    }
}
exports.CommandSystem = CommandSystem;


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppState = void 0;
class AppState {
}
exports.AppState = AppState;


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommandHelper = void 0;
const PROJECT_NAME = "fakefolder";
class CommandHelper {
    static GetFullCommand(cmd) {
        return PROJECT_NAME + "." + cmd;
    }
}
exports.CommandHelper = CommandHelper;


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuickPickWindow = void 0;
const vscode = __webpack_require__(1);
class QuickPickWindow {
    constructor() {
        this.inputValue = "";
        this.OnConfirmHandle = () => { };
    }
    Open(title, placeHolder, isSelect, items) {
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
exports.QuickPickWindow = QuickPickWindow;


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuickPickItemElement = void 0;
class QuickPickItemElement {
    constructor(label) {
        this.label = label;
    }
}
exports.QuickPickItemElement = QuickPickItemElement;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = exports.REElement = exports.REDataProvider = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(1);
const fs = __webpack_require__(2);
const SaveService_1 = __webpack_require__(3);
const path = __webpack_require__(5);
const CommandSystem_1 = __webpack_require__(6);
const AppState_1 = __webpack_require__(7);
const ROOT_PATH = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;
const REFILTER_FILE_NAME = "refilter.json";
function PopMessage(msg) {
    vscode.window.showInformationMessage(msg);
}
let curFile = "";
async function OpenFile(path) {
    if (curFile == path) {
        return;
    }
    curFile = path;
    let docu = await vscode.workspace.openTextDocument(path);
    vscode.window.showTextDocument(docu);
}
class REDataProvider {
    constructor(save) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.curNode = save.RootNode();
        console.log(this.curNode);
        this.curElement = new REElement(this.curNode);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element || !element.node) {
            console.log("GET ROOT CHILDREN");
            return Promise.resolve([this.curElement]);
        }
        let res = [];
        let node = element.node;
        let save = SaveService_1.SaveService.Instance;
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
    resolveTreeItem(item, element, token) {
        if (!element || !element.node) {
            return Promise.resolve(item);
        }
        if (!element.node.isFolder) {
            this.TriggerTreeChange();
        }
        if (AppState_1.AppState.treeview.selection.find(value => value == element)) {
            OpenFile(element.node.truePath);
            return Promise.resolve(element);
        }
        return Promise.resolve(element);
    }
}
exports.REDataProvider = REDataProvider;
class REElement extends vscode.TreeItem {
    constructor(node, collapsibleState = vscode.TreeItemCollapsibleState.Collapsed) {
        super(node.name, collapsibleState);
        this.node = node;
    }
}
exports.REElement = REElement;
function GetFilterPath() {
    if (ROOT_PATH) {
        return path.join(ROOT_PATH, REFILTER_FILE_NAME);
    }
    else {
        return "";
    }
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // REGISTER CALLBACK
    vscode.window.onDidChangeActiveTextEditor(e => {
        let doc = e?.document;
        if (doc) {
            AppState_1.AppState.curTextDocu = doc;
        }
    });
    // REGISTER COMMAND
    CommandSystem_1.CommandSystem.Init(context);
    let filterPath = GetFilterPath();
    if (!fs.existsSync(filterPath)) {
        PopMessage("Not Found: " + filterPath);
        return;
    }
    // LOAD FROM refilter.json
    let save = new SaveService_1.SaveService(filterPath);
    save.LoadAll();
    console.log('(1/2)Resource Folder Loaded Nodes...');
    // CREATE Treeview
    let provider = new REDataProvider(save);
    let dis2 = vscode.window.registerTreeDataProvider("RETreeview", provider);
    let treeview = vscode.window.createTreeView("RETreeview", {
        treeDataProvider: provider,
    });
    AppState_1.AppState.re = provider;
    AppState_1.AppState.treeview = treeview;
    if (!ROOT_PATH) {
        console.log("no workspace");
        return;
    }
    console.log('(2/2)Resource Folder Rendered Treeview...');
    // RENDER Treeview
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map