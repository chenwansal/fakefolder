export class RENode {

    id: number;
    isFolder: boolean;
    name: string;
    truePath: string;
    parentID: number;
    childrenFolder: number[];
    childrenFile: number[];

    constructor(id: number, name: string, isFolder: boolean, truePath: string, parentID: number) {
        this.id = id;
        this.name = name;
        this.isFolder = isFolder;
        this.truePath = truePath;
        this.parentID = parentID;
        this.childrenFolder = [];
        this.childrenFile = [];
    }

    RemoveChild(targetNodeId: number) { 
        this._RemoveChild(this.childrenFolder, targetNodeId);
        this._RemoveChild(this.childrenFile, targetNodeId);
    }

    private _RemoveChild(arr: number[], targetNodeId: number) {
        let index = arr.findIndex(value => value == targetNodeId);
        if (index != -1) {
            arr.slice(index, 1);
        }
    }

}