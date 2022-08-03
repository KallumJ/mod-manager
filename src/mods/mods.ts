import path from "path";
import Initialiser from "../util/initialiser.js";
import PrintUtils from "../util/print_utils.js";
import ModrinthSource from "./sources/modrinth_source.js";
import ModSource from "./sources/mod_source.js";
import ModNotFoundError from "../errors/mod_not_found_error.js";


export default class Mods {
    public static readonly MOD_FILE = "mods.json";
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
                let id;
                try {
                    id = await source.search(mod);
                } catch (e) {
                    if (e instanceof ModNotFoundError) {
                        spinner.updateText(`Mod not found on ${source.getName()}`)
                    } else {
                        spinner.error(`An error occurred searching for ${mod} on ${source.getName()}. Skipping ${source.getName()}`)
                        // Try the next source
                        continue;
                    }
                }

                // If a mod is found, install it
                if (id != undefined) {
                    spinner.updateText(`Installing ${mod}...`)
                    try {
                        await source.install(id);
                        spinner.succeed(`Successfully installed ${mod}`);
                    } catch (e) {
                        // Log the error, and continue to next source
                        spinner.error(e);
                    }
                }
            }
        }
    }

    public static getModFilePath(): string {
        return path.join(Initialiser.getModManagerFolderPath(), this.MOD_FILE);
    }
}