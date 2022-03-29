import { RENode } from "../Entity/RENode";
import * as fs from "fs";

export class SaveService {

    public static Instance: SaveService;
    all: RENode[];
    jsonPath: string;

    constructor(refilterJsonPath: string) {
        this.jsonPath = refilterJsonPath;
        this.all = [];
        this.all.push(this.CreateRoot());
        if (SaveService.Instance == null) {
            SaveService.Instance = this;
        } else {
            return;
        }
    }

    private CreateRoot() {
        return new RENode(0, "root", true, "", -1);
    }

    GetCount() {
        return this.all.length;
    }

    Travel(callback: (node: RENode) => void) {
        this.all.forEach(callback);
    }

    AddNode(node: RENode) {
        this.all.push(node);
        this.SaveAll();
        console.log(this.all.length);
    }

    RootNode() {
        return this.all[0];
    }

    RemoveNode(nodeId: number) {
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

    FindNode(nodeId: number) {
        return this.all.find(value => value.id == nodeId);
    }

    FindNodeWithDir(dir: string) {
        return this.all.find(value => value.isFolder && value.name == dir);
    }

    GetFolderNode(): RENode[] {
        let res = this.all.filter(value => value.isFolder);
        return res;
    }

    LoadAll() {
        let jsonPath = this.jsonPath;
        if (!fs.existsSync(jsonPath)) {
            console.log("NO FILTER");
            return;
        }
        let str: string = fs.readFileSync(jsonPath, { encoding: "utf8" });
        try {
            this.all = JSON.parse(str);
            if (this.all.length == 0) {
                this.all.push(this.CreateRoot());
                this.SaveAll();
            }
        } catch {
            this.SaveAll();
        }
    }

    SaveAll() {
        let jsonPath = this.jsonPath;
        let str: string = JSON.stringify(this.all);
        fs.writeFileSync(jsonPath, str, { encoding: "utf-8" });
    }

}