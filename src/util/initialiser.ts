import {existsSync, mkdirSync, writeFileSync} from "fs";
import path from "path";
import Mods from "../mods/mods.js";
import PrintUtils from "./print_utils.js";
import ModManager from "../mod-manager.js";

export default class Initialiser {
    private static readonly MOD_MANAGER_FOLDER = ".mod-manager"

    public static initialise(): void {
        if (!this.isInitialised()) {
            if (this.isDirFabricServer()) {
                const success: boolean = this.setupFolderStructure();

                if (success) {
                    PrintUtils.success("Sucessfully initialised Mod Manager!");

                    // Initialise a logger when Mod Manager is initialised
                    if (ModManager.logger == null) {
                        ModManager.logger = ModManager.createLogger();
                    }

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
        const serverProperties = path.join("server.properties");
        const fabric = path.join(".fabric");

        return existsSync(serverProperties) && existsSync(fabric);
    }

    private static setupFolderStructure(): boolean {
        if (!existsSync(this.getModManagerFolderPath())) {
            mkdirSync(this.getModManagerFolderPath());
            writeFileSync(Mods.getModFilePath(), "[]");
            mkdirSync(path.join(this.getModManagerFolderPath(), "logs"))
            return true;
        } else {
            return false;
        }
    }

    public static getModManagerFolderPath(): string {
        return path.join(this.MOD_MANAGER_FOLDER);
    }

}