import {readdirSync} from "fs";
import path from "path";
import axios from "axios";

export default class MinecraftUtils {
    static async getCurrentMinecraftVersion(): Promise<string> {
        // Get installed versions as strings
        const installedVersions: Array<string> = readdirSync(this.getVersionsFolderPath(), {withFileTypes: true})
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);

        // Get a list of Minecraft Versions
        const response = await axios.get("https://meta.fabricmc.net/v2/versions/game");
        const data = await response.data;

        const minecraftVersions: Array<string> = [];
        for (const ele of data) {
            minecraftVersions.push(ele.version);
        }

        // Find the latest version that is currently installed
        let index = Number.MAX_VALUE;
        for (let version of installedVersions) {
            let currentIndex = minecraftVersions.indexOf(version);

            // If this version, is newer than the previous newest, save it's index
            if (currentIndex < index) {
                index = currentIndex;
            }
        }

        const latestVersion = minecraftVersions[index];
        if (latestVersion == undefined) {
            throw new Error("There are no Minecraft versions available in this server. Is this a valid server installation?");
        }

        return latestVersion;
    }

    static getVersionsFolderPath(): string {
        return path.join("versions")
    }
}

