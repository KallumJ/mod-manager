import { existsSync, mkdirSync } from "fs";
import PrintUtils from "./print_utils.js";

export default class Initialiser {
    private static readonly MOD_MANAGER_FOLDER = ".mod-manager"

    public static initialise(): void {
        if (!this.isInitialised()) {
            if (this.isDirFabricServer()) {
                const success: boolean = this.setupFolderStructure();

                if (success) {
                    PrintUtils.success("Sucessfully initialised Mod Manager!");
                } else {
                    PrintUtils.error("Unable to set up the Mod Manager folder structure");
                }
            } else {
                PrintUtils.error("Unable to initialise Mod Manager as this is not a Fabric Minecraft Server");
            }
        } else {
            PrintUtils.warn("Mod Manager is already initialised!");
        }
    }

    public static isInitialised(): boolean {
        return existsSync(this.getModManagerFolderPath());
    }

    private static isDirFabricServer(): boolean {
        const workingDirectory = process.cwd();

        const serverProperties = `${workingDirectory}/server.properties`;
        const fabric = `${workingDirectory}/.fabric`;

        return existsSync(serverProperties) && existsSync(fabric);
    }

    private static setupFolderStructure(): boolean {
        if (!existsSync(this.getModManagerFolderPath())) {
            mkdirSync(this.getModManagerFolderPath());
            return true;
        } else {
            return false;
        }
    }

    private static getModManagerFolderPath(): string {
        const workingDirectory = process.cwd();

        return `${workingDirectory}/${this.MOD_MANAGER_FOLDER}`;
    }

}