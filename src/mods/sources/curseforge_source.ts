import ModSource from "./mod_source.js";
import axios from "axios";
import MinecraftUtils from "../../util/minecraft_utils.js";
import ModNotFoundError from "../../errors/mod_not_found_error.js";
import Util from "../../util/util.js";
import {format} from "util";
import Mods from "../mods.js";
import FileDownloader from "../../io/file_downloder.js";
import DownloadError from "../../errors/download_error.js";

export class CurseforgeSource implements ModSource {
    private static readonly BASE_URL: string = "https://api.curseforge.com/v1";
    private static readonly SEARCH_URL: string = `${CurseforgeSource.BASE_URL}/mods/search`;
    private static readonly GET_MOD_URL: string = `${CurseforgeSource.BASE_URL}/mods/%s`
    private static readonly GET_FILE_URL: string = `${CurseforgeSource.BASE_URL}/mods/%s/files/%s`
    private static readonly DOWNLOAD_CDN_URL: string = "https://edge.forgecdn.net/files/%s/%s/%s";

    private static readonly MINECRAFT_ID: number = 432;
    private static readonly FABRIC_TYPE: number = 4;

    /**
     * Gets the latest version of the mod
     * Example shape of data returned by GET_MOD query: https://controlc.com/faaf3b24
     * Example shape of data returned by GET_FILE query: https://controlc.com/a841fc0b
     * @param id the mod id of the mod
     * @param mcVersion the Minecraft version to check for
     * @throws ModNotFoundError if there are no versions available for the provided Minecraft Version
     */
    async getLatestVersion(id: string, mcVersion: string): Promise<Version> {
        const modResponse = await this.makeRequest(format(CurseforgeSource.GET_MOD_URL, id));
        const latestFiles: Array<any> = modResponse.data.latestFilesIndexes;

        const latestFilesArr = latestFiles.filter(file => file.gameVersion === mcVersion);
        if (Util.isArrayEmpty(latestFilesArr)) {
            throw new ModNotFoundError(`Mod with id ${id} has no available versions on ${this.getSourceName()} for Minecraft version ${mcVersion}`)
        }

        const fileId = latestFilesArr[0].fileId;
        const fileResponse = await this.makeRequest(format(CurseforgeSource.GET_FILE_URL, id, fileId))
        const fileObj = fileResponse.data;

        const dependencies = [];
        if (!Util.isArrayEmpty(fileObj.dependencies)) {
            for (let dependency of fileObj.dependencies) {
                // If dependency is required
                if (dependency.relationType == 3) {
                    dependencies.push(await this.getLatestVersion(dependency.modId, mcVersion));
                }
            }
        }

        const downloadUrl = fileObj.downloadUrl != null ? fileObj.downloadUrl : this.constructDownloadUrl(id, fileObj.fileName);

        return {
            modId: id.toString(),
            fileName: fileObj.fileName,
            url: downloadUrl,
            versionNumber: fileObj.displayName,
            dependencies: dependencies
        }
    }

    /**
     * Gets the name of the mod with the provided id
     * @param id the mod id
     */
    async getProjectName(id: string): Promise<string> {
        const response = await this.makeRequest(format(CurseforgeSource.GET_MOD_URL, id))
        return response.data.name;
    }

    getSourceName(): string {
        return "Curseforge";
    }

    /**
     * Installs the provided Version
     * @param version the Version to install
     * @param essential whether this mod is essential or not
     * @throws DownloadError if an error occurs when downloading
     */
    async install(version: Version, essential: boolean): Promise<void> {
        try {
            if (Mods.isModInstalled(version.modId)) {
                return;
            }

            const dependencies = [];
            if (!Util.isArrayEmpty(version.dependencies)) {
                for (let dependency of version.dependencies) {
                    await this.install(dependency, essential);
                    dependencies.push(dependency.modId)
                }
            }
            FileDownloader.downloadMod(version)

            const mod = {
                name: await this.getProjectName(version.modId),
                id: version.modId,
                fileName: version.fileName,
                version: version.versionNumber,
                source: this.getSourceName(),
                essential: essential,
                dependencies: dependencies
            }

            Mods.trackMod(mod);
        } catch (e) {
            throw new DownloadError(`An error occurred downloading mod with id ${version.modId} from ${this.getSourceName()}`)
        }
    }

    /**
     * Searches for a mod matching the provided query
     * Example response from query: https://controlc.com/ac06bc3d
     * @param query the query to search for
     */
    async search(query: string): Promise<string> {
        const mcVersion = await MinecraftUtils.getCurrentMinecraftVersion();

        const params = {
            gameId: CurseforgeSource.MINECRAFT_ID,
            gameVersion: mcVersion,
            modLoaderType: CurseforgeSource.FABRIC_TYPE,
            pageSize: 1,
            searchFilter: query
        }

        const response = await this.makeRequest(CurseforgeSource.SEARCH_URL, params);
        const results = response.data;

        if (Util.isArrayEmpty(results)) {
            throw new ModNotFoundError(`Mod ${query} could not be found on ${this.getSourceName()}`);
        }

        return results[0].id;
    }

    private async makeRequest(url: string, params?: object) {
        if (process.env.CURSEFORGE_API_KEY == undefined) {
            throw new Error("Attempted Curseforge api calls with undefined api key environment variable (CURSEFORGE_API_KEY)")
        }

        if (params == undefined) {
            params = {}
        }

        const response = await axios.get(url, {
            headers: {
                "x-api-key": process.env.CURSEFORGE_API_KEY
            },
            params
        })
        return await response.data;
    }

    private constructDownloadUrl(id: string, fileName: string) {
        // Some mods have a null download link. Download links follow a pattern such that we can
        // create the URL ourselves in those rare cases. If download link is invalid, download
        // will gracefully fail
        const first = id.toString().substring(0, 4);
        let last = id.toString().substring(4);

        if (last.charAt(0) == '0') {
            last = last.replace("0", "");
        }

        return format(CurseforgeSource.DOWNLOAD_CDN_URL, first, last, fileName);
    }
}

