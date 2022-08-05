import path from "path";
import PrintUtils from "../util/print_utils.js";
import ModrinthSource from "./sources/modrinth_source.js";
import ModSource from "./sources/mod_source.js";
import ModNotFoundError from "../errors/mod_not_found_error.js";
import {readFileSync, unlinkSync, writeFileSync} from "fs";
import Util from "../util/util.js";
import ModManager from "../mod-manager.js";


export default class Mods {
    private static readonly MOD_SOURCES: Array<ModSource> = [
        new ModrinthSource()
    ];

    public static async install(mod: string, essential: boolean): Promise<void> {
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
                            const modObj: Mod = await source.install(id, essential);
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

    private static trackMod(mod: Mod): void {
        // Read current file
        const mods = this.getTrackedMods();

        // Add mod
        mods.push(mod);

        // Write list back to file
        this.writeFile(mods);
    }

    public static getTrackedMods(): Array<Mod> {
        const file = readFileSync(ModManager.FilePaths.MOD_FILE_PATH, "utf-8");
        return JSON.parse(file);
    }

    public static writeFile(mods: Array<Mod>): void {
        writeFileSync(ModManager.FilePaths.MOD_FILE_PATH, JSON.stringify(mods, null, 4));
    }

    private static isModInstalled(id: string): boolean {
        const modsWithId: Array<Mod> = this.getTrackedMods().filter(mod => mod.id == id);
        return !Util.isArrayEmpty(modsWithId)
    }

    static uninstall(mod: string) {
        // Find mod to uninstall
        const spinner = new PrintUtils.Spinner(`Uninstalling ${mod}...`)

        const modToUninstall = this.findMod(mod);
        // IF a matching mod is found, remove it
        if (modToUninstall != undefined) {
            let mods: Array<Mod> = this.getTrackedMods();

            // Remove mod from list and uninstall it
            unlinkSync(path.join(ModManager.FilePaths.MOD_FILE_PATH, modToUninstall.fileName));
            mods = mods.filter(item => !Mods.areModsEqual(item, modToUninstall));
            this.writeFile(mods);
            spinner.succeed(`${modToUninstall.name} successfully uninstalled!`)
        } else {
            spinner.error(`${mod} was not found.`)
        }




    }
    static areModsEqual(mod1: Mod, mod2: Mod): boolean {
        return mod1.id === mod2.id;
    }

    static toggleEssential(mod: string) {
        const modToMark = this.findMod(mod);

        if (modToMark != undefined) {
            let mods = this.getTrackedMods();
            // Remove mod from list
            mods = mods.filter(item => !Mods.areModsEqual(item, modToMark));

            // Toggle essnetial status, and write back to file
            modToMark.essential = !modToMark.essential;
            mods.push(modToMark)
            this.writeFile(mods);

            if (modToMark.essential) {
                PrintUtils.success(`Marked ${modToMark.name} as essential`)
            } else {
                PrintUtils.success(`Marked ${modToMark.name} as inessential`)
            }
        } else {
            PrintUtils.error(`${mod} not found.`)
        }
    }

    private static findMod(mod: string): Mod | undefined {
        // Replace underscores with spaces
        mod = mod.replaceAll("_", " ");

        let mods: Array<Mod> = this.getTrackedMods();
        for (let modEle of mods) {
            const id = modEle.id.toLowerCase();
            const name = modEle.name.toLowerCase();

            const query = mod.toLowerCase();
            if (id == query || Util.areStringsSimilar(mod, name)) {
                return modEle;
            }
        }

        return undefined;
    }
}