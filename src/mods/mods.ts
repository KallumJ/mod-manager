import path from "path";
import PrintUtils from "../util/print_utils.js";
import ModSource from "./sources/mod_source.js";
import ModNotFoundError from "../errors/mod_not_found_error.js";
import {readFileSync, unlinkSync, writeFileSync} from "fs";
import Util from "../util/util.js";
import ModManager from "../mod-manager.js";
import MinecraftUtils from "../util/minecraft_utils.js";
import MigrateError from "../errors/migrate_error.js";

export default class Mods {
    private static readonly MOD_SOURCES: Array<ModSource> = [];

    public static registerSource(source: ModSource, envVar?: string) {
        if (envVar != undefined) {
            if (!process.env.hasOwnProperty(envVar)) {
                PrintUtils.warn(`${source.getSourceName()} could not be registered as a mod source, as the required environment variable ${envVar} was not detected. Functionality related to ${source.getSourceName()} will be skipped.`)
                return;
            }
        }
        this.MOD_SOURCES.push(source);
    }

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
                        spinner.stop(`Mod ${mod} not found on ${source.getSourceName()}`)
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
                            const mcVersion = await MinecraftUtils.getCurrentMinecraftVersion();
                            const latestVersion = await source.getLatestVersion(id, mcVersion)
                            await source.install(latestVersion, essential);

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

    public static trackMod(mod: TrackedMod): void {
        // Read current file
        const mods = this.getTrackedMods();

        // Add mod
        mods.push(mod);

        // Write list back to file
        this.writeToModFile(mods);
    }

    public static getTrackedMods(): Array<TrackedMod> {
        const file = readFileSync(ModManager.FilePaths.MOD_FILE_PATH, "utf-8");
        return JSON.parse(file);
    }

    public static writeToModFile(mods: Array<TrackedMod>): void {
        writeFileSync(ModManager.FilePaths.MOD_FILE_PATH, JSON.stringify(mods, null, 4));
    }

    public static isModInstalled(id: string): boolean {
        const modsWithId: Array<TrackedMod> = this.getTrackedMods().filter(mod => mod.id == id);
        return !Util.isArrayEmpty(modsWithId)
    }

    static uninstall(mod: string) {
        // Find mod to uninstall
        const spinner = new PrintUtils.Spinner(`Uninstalling ${mod}...`)
        spinner.start();

        const modToUninstall = this.findMod(mod);
        // IF a matching mod is found, remove it
        if (modToUninstall != undefined) {
            this.silentUninstall(modToUninstall);

            for (let dependency of modToUninstall.dependencies) {
                    if (!this.isDependedOn(dependency)) {
                        const dependencyMod = this.findMod(dependency);
                        if (dependencyMod != undefined) {
                            this.silentUninstall(dependencyMod)
                        }
                    }
            }

            spinner.succeed(`${modToUninstall.name} successfully uninstalled!`)
        } else {
            spinner.error(`${mod} was not found.`)
        }
    }

    static silentUninstall(mod: TrackedMod) {
        let mods: Array<TrackedMod> = this.getTrackedMods();

        // Remove mod from list and uninstall it
        unlinkSync(path.join(ModManager.FilePaths.MODS_FOLDER_PATH, mod.fileName));
        mods = mods.filter(item => !Mods.areModsEqual(item, mod));
        this.writeToModFile(mods);
    }

    static areModsEqual(mod1: TrackedMod, mod2: TrackedMod): boolean {
        return mod1.id === mod2.id;
    }

    static toggleEssential(mod: string) {
        const modToMark = this.findMod(mod);

        if (modToMark != undefined) {
            for (let dependency of modToMark.dependencies) {
                this.toggleEssential(dependency)
            }

            let mods = this.getTrackedMods();
            // Remove mod from list
            mods = mods.filter(item => !Mods.areModsEqual(item, modToMark));

            // Toggle essential status, and write back to file
            modToMark.essential = !modToMark.essential;
            mods.push(modToMark)
            this.writeToModFile(mods);

            if (modToMark.essential) {
                PrintUtils.success(`Marked ${modToMark.name} as essential`)
            } else {
                PrintUtils.success(`Marked ${modToMark.name} as inessential`)
            }
        } else {
            PrintUtils.error(`${mod} not found.`)
        }
    }

    /**
     * Finds the mod based on the provided id or name
     * @param mod the id or mod name
     * @return the found Mod, or undefined if no mod was found
     */
    private static findMod(mod: string): TrackedMod | undefined {
        // Replace underscores and dashes with spaces
        mod = mod.replaceAll("_", " ");
        mod = mod.replaceAll("-", " ")

        let mods: Array<TrackedMod> = this.getTrackedMods();
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

    static async update() {
        const trackedMods = this.getTrackedMods();

        if (Util.isArrayEmpty(trackedMods)) {
            PrintUtils.error("There are no mods currently installed. Try `mod-manager install -h` to learn more!")
            return;
        }

        const mcVersion = await MinecraftUtils.getCurrentMinecraftVersion();

        // For every tracked mod
        for (let mod of trackedMods) {
            const spinner = new PrintUtils.Spinner(`Checking for newer version of ${mod.name}`)
            spinner.start();

            // Get the latest version
            const source = this.getSourceFromName(mod.source);
            let latestVersion: Version | undefined  = undefined;
            try {
                latestVersion = await source.getLatestVersion(mod.id, mcVersion);

                // If the latest version has a different version number, it must be newer, install it.
                if (latestVersion.versionNumber != mod.version) {
                    spinner.updateText(`Newer version for ${mod.name} found. Installing...`)
                    this.silentUninstall(mod);

                    await source.install(latestVersion, mod.essential);

                    spinner.succeed(`Successfully updated ${mod.name}`)

                    // Else, the latest version is already installed, do nothing.
                } else {
                    throw new ModNotFoundError("There is no newer version available.");
                }
            } catch (e) {
                spinner.info(`${mod.name} already has the latest version installed!`)
            }
        }
    }

    static getSourceFromName(name: string): ModSource {
        const source = this.MOD_SOURCES.filter(src => src.getSourceName() === name)[0];
        if (source == undefined) {
            throw new Error(`There is no source registered with the name ${name}`)
        }

        return source
    }

    static async isMigratePossible(version: string, force: boolean): Promise<boolean> {
        const mods = !force ? this.getTrackedMods() : this.getEssentialMods();

        if (Util.isArrayEmpty(mods)) {
            const msg = !force ? "" +
                "There are no mods installed, try `mod-manager install -h` to learn more!" : "" +
                "There are no mods installed that are marked essential. Try `mod-manager essential -h` to learn more!";

            throw new Error(msg)
        }

        if (!await MinecraftUtils.isValidVersion(version)) {
            throw new Error(`${version} is not a valid Minecraft version`)
        }

        let availableList = [];

        // For every tracked mod
        for (let mod of mods) {
            // Get the latest version for each mod on the provided minecraft version
            const spinner = new PrintUtils.Spinner(`Checking ${mod.name}...`);
            spinner.start();

            const source = this.getSourceFromName(mod.source);
            try {
                await source.getLatestVersion(mod.id, version)
                // Report and record that this mod is available
                spinner.succeed(`${mod.name} is available on Minecraft ${version}`)
                availableList.push(true)
            } catch (e) {
                // Report and record that this mod is not available
                spinner.error(`${mod.name} is not available on Minecraft ${version}`)
                availableList.push(false);
            }
        }

        // Filter out all the true's from the list
        availableList = availableList.filter(available => !available)

        // If the array is empty, all the mods reported as available, and a migration is possible
        const possible = Util.isArrayEmpty(availableList);

        // Report and return whether it is possible
        if (possible) {
            PrintUtils.success(`It is possible to migrate to version ${version}`)
        } else {
            PrintUtils.error(`It is not possible to migrate to version ${version}`)
        }

        return possible;
    }

    private static getEssentialMods() {
        return this.getTrackedMods().filter(mod => mod.essential);
    }

    /**
     * Migrates to the provided version of minecraft
     * @param version the Minecraft version to migrate to
     * @param force true if this is a force migration, false otherwise
     */
    static async migrate(version: string, force: boolean) {
        const mods = this.getTrackedMods();

        if (Util.isArrayEmpty(mods)) {
            throw new MigrateError("There are no mods installed right now. Try `mod-manager install -h` to learn more!")
        }

        if (!await MinecraftUtils.isValidVersion(version)) {
            throw new MigrateError(`${version} is not a valid version of Minecraft`)
        }

        if (!await Mods.isMigratePossible(version, force)) {
            throw new MigrateError(`It is not possible to migrate to ${version}.`)
        }

        // For every tracked mod
        for (let mod of mods) {
            const source = this.getSourceFromName(mod.source);

            const spinner = new PrintUtils.Spinner(`Uninstalling ${mod.name} ${mod.version}...`);
            spinner.start();

            try {
                // Uninstall it
                this.silentUninstall(mod);

                // Get the latest version
                const latestVersion = await source.getLatestVersion(mod.id, version)

                // Install the new mod
                spinner.updateText(`Installing ${mod.name} ${latestVersion.versionNumber}..`)
                await source.install(latestVersion, mod.essential)

                spinner.succeed(`Successfully installed ${mod.name} ${mod.version}`)
            } catch (e) {
                // If a mod is not available, but is essential, throw error, else, warn user, and continue.
                if (mod.essential) {
                    throw new Error("Attempted to migrate a mod that is not available for migration")
                } else {
                    spinner.warn(`${mod.name} is not available. Discarding...`)
                }
            }
        }

        await MinecraftUtils.updateCurrentMinecraftVersion(version)
        PrintUtils.success(`Successfully migrated to ${version}`)
    }

    private static isDependedOn(dependency: string) {
        const trackedMods = this.getTrackedMods();

        for (let trackedMod of trackedMods) {
            if (trackedMod.dependencies.includes(dependency)) {
                return true;
            }
        }
        return false;
    }
}