import {readFileSync, writeFileSync} from "fs";
import axios from "axios";
import ModManager from "../mod-manager.js";
import MinecraftVersionError from "../errors/minecraft_version_error.js";
import inquirer from "inquirer";
import PrintUtils from "./print_utils.js";

export default class MinecraftUtils {
    static async getCurrentMinecraftVersion(): Promise<string> {
        return readFileSync(ModManager.FilePaths.VERSION_FILE_PATH, "utf-8");
    }

    static async isValidVersion(version: any) {
        const allMinecraftVersions = await this.getAllMinecraftVersions();
        return allMinecraftVersions.includes(version);
    }

    static async getAllMinecraftVersions(): Promise<Array<string>> {
        // Get a list of Minecraft Versions
        const response = await axios.get("https://meta.fabricmc.net/v2/versions/game");
        const data = await response.data;

        const minecraftVersions: Array<string> = [];
        for (const ele of data) {
            minecraftVersions.push(ele.version);
        }

        return minecraftVersions;
    }

    static async updateCurrentMinecraftVersion(version: string) {
        if (await MinecraftUtils.isValidVersion(version)) {
            writeFileSync(ModManager.FilePaths.VERSION_FILE_PATH, version);
        } else {
            throw new MinecraftVersionError(`Attempted to update version file with invalid version: ${version}`)
        }
    }

    public static async getMinecraftVersionFromInput(question: string) {
        let isVersionValid = false;

        let version: string | undefined = undefined;
        while (!isVersionValid) {
            const answer = await inquirer.prompt([{
                type: "input",
                name: "minecraft_version",
                message: question
            }])
            version = answer.minecraft_version;

            if (await MinecraftUtils.isValidVersion(version)) {
                isVersionValid = true;
            } else {
                PrintUtils.error(`${version} is not a valid Minecraft version for a Fabric server. Please try again`);
            }
        }

        if (version == undefined) {
            throw new MinecraftVersionError("Escaped version input without a valid version")
        }

        return version;
    }

}

