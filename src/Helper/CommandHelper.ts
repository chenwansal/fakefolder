const PROJECT_NAME = "fakefolder";

export class CommandHelper {

    static GetFullCommand(cmd: string) {
        return PROJECT_NAME + "." + cmd;
    }
}