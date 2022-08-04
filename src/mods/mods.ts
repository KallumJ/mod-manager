import path from "path";
import Initialiser from "../util/initialiser.js";
import PrintUtils from "../util/print_utils.js";
import ModrinthSource from "./sources/modrinth_source.js";
import ModSource from "./sources/mod_source.js";
import ModNotFoundError from "../errors/mod_not_found_error.js";
import {readFileSync, unlinkSync, writeFileSync} from "fs";
import Util from "../util/util.js";


export default class Mods {
    public static readonly MOD_FILE = "mods.json";
    public static readonly MODS_FOLDER_PATH: string = path.join("mods");
    private static readonly MOD_SOURCES: Array<ModSource> = [
        new ModrinthSource()
    ];

    public static async install(mod: string): Promise<void> {
        let success: boolean = false;

        // Go through each mod source
        for (const source of this.MOD_SOURCES) {
            // If we have not yet successfully installed the queried mod
            if (!success) {
                const spinner = new PrintUtils.Spinner(`Searching for ${mod}...`);
                spinner.start();

                // Search for the mod
                let id: string | undefined;
                try {
                    id = await source.search(mod);
                } catch (e) {
                    if (e instanceof ModNotFoundError) {
                        spinner.stop(`Mod not found on ${source.getSourceName()}`)
                    } else {
                        spinner.error(`An error occurred searching for ${mod} on ${source.getSourceName()}. Skipping ${source.getSourceName()}`)
                        // Try the next source
                        continue;
                    }
                }

                // If a mod is found, install it
                if (id != undefined) {
                    const projectName = await source.getProjectName(id);

                    // If mod is not already installed
                    if (!this.isModInstalled(id)) {
                        spinner.updateText(`Installing ${projectName}...`)
                        try {
                            const modObj: Mod = await source.install(id);
                            this.trackMod(modObj);

                            spinner.succeed(`Successfully installed ${projectName}`);
                            success = true;
                        } catch (e) {
                            // Log the error, and continue to next source
                            spinner.error(e);
                        }
                    } else {
                        spinner.error(`Mod ${projectName} is already installed.`)
                    }
                }
            }
        }
    }

    public static getModFilePath(): string {
        return path.join(Initialiser.getModManagerFolderPath(), this.MOD_FILE);
    }

    private static trackMod(mod: Mod): void {
        // Read current file
        const mods = this.getTrackedMods();

        // Add mod
        mods.push(mod);

        // Write list back to file
        this.writeFile(mods);
    }

    public static getTrackedMods(): Array<Mod> {
        const file = readFileSync(this.getModFilePath(), "utf-8");
        return JSON.parse(file);
    }

    public static writeFile(mods: Array<Mod>): void {
        writeFileSync(this.getModFilePath(), JSON.stringify(mods, null, 4));
    }

    private static isModInstalled(id: string): boolean {
        const modsWithId: Array<Mod> = this.getTrackedMods().filter(mod => mod.id == id);
        return !Util.isArrayEmpty(modsWithId)
    }

    static uninstall(mod: string) {
        let mods: Array<Mod> = this.getTrackedMods();

        // Replace underscores with spaces
        mod = mod.replaceAll("_", " ");

        // Find mod to uninstall
        const spinner = new PrintUtils.Spinner(`Uninstalling ${mod}...`)
        let modToUninstall: Mod | undefined = undefined;
        for (let modEle of mods) {
            const id = modEle.id.toLowerCase();
            const name = modEle.name.toLowerCase();

            const query = mod.toLowerCase();
            if (id == query || name == query) {
                modToUninstall = modEle;
                break;
            }
        }

        // IF a matching mod is found, remove it
        if (modToUninstall != undefined) {
            // Remove mod from list and uninstall it
            unlinkSync(path.join(this.MODS_FOLDER_PATH, modToUninstall.fileName));
            mods = mods.filter(item => item !== modToUninstall);
            this.writeFile(mods);
            spinner.succeed(`${modToUninstall.name} successfully uninstalled!`)
        } else {
            spinner.error(`${mod} was not found.`)
        }




    }
}