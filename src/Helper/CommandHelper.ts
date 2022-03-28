const PROJECT_NAME = "another-folder-view";

export class CommandHelper {

    static GetFullCommand(cmd: string) {
        return PROJECT_NAME + "." + cmd;
    }
}