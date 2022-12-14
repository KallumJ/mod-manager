import {existsSync, mkdirSync, writeFileSync} from "fs";
import path from "path";
import PrintUtils from "./print_utils.js";
import ModManager from "../mod-manager.js";
import MinecraftUtils from "./minecraft_utils.js";

export default class Initialiser {
    public static async initialise(): Promise<void> {
        if (!this.isInitialised()) {
            if (this.isDirFabricServer()) {
                const success: boolean = this.setupFolderStructure();

                if (success) {
                    const version = await MinecraftUtils.getMinecraftVersionFromInput("What Minecraft version is your server running?");
                    await MinecraftUtils.updateCurrentMinecraftVersion(version)

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
        return existsSync(ModManager.FilePaths.MOD_MANAGER_FOLDER_PATH);
    }

    private static isDirFabricServer(): boolean {
        const serverProperties = path.join("server.properties");
        const fabric = path.join(".fabric");

        return existsSync(serverProperties) && existsSync(fabric);
    }

    private static setupFolderStructure(): boolean {
        if (!existsSync(ModManager.FilePaths.MOD_MANAGER_FOLDER_PATH)) {
            mkdirSync(ModManager.FilePaths.MOD_MANAGER_FOLDER_PATH);
            writeFileSync(ModManager.FilePaths.MOD_FILE_PATH, "[]");
            mkdirSync(ModManager.FilePaths.LOGS_FOLDER)
            writeFileSync(ModManager.FilePaths.VERSION_FILE_PATH, "")
            return true;
        } else {
            return false;
        }
    }
}