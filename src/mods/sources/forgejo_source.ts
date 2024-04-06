import axios from "axios";
import ModSource from "./mod_source.js";
import Util from "../../util/util.js";
import { ForgejoFile, ForgejoFiles, ForgejoPackage } from "../../types/forgejo.js";
import { parse } from "properties-parser"
import ModNotFoundError from "../../errors/mod_not_found_error.js";
import MinecraftUtils from "../../util/minecraft_utils.js";
import { format } from "util";
import Mods from "../mods.js";
import FileDownloader from "../../io/file_downloder.js";
import DownloadError from "../../errors/download_error.js";

export default class ForgejoSource implements ModSource {
    private static readonly BASE_URL: string = "https://git.bits.team/api/v1";
    private static readonly SEARCH_URL: string = ForgejoSource.BASE_URL + "/packages/Bits"
    private static readonly VERSION_URL: string = ForgejoSource.BASE_URL + "/repos/%s/%s/media/gradle.properties"
    private static readonly REPO_URL: string = ForgejoSource.BASE_URL + "/repositories/%s"
    private static readonly FILES_URL: string = ForgejoSource.BASE_URL + "/packages/%s/%s/%s/%s/files"

    private async findPackage(query: string, mcVersion: string): Promise<{package: ForgejoPackage, project_id: string} | undefined> {
        let page = 1;
        let pagesLeft = true;
        while (pagesLeft) {
            pagesLeft = false

            const params = {
                q: query,
                page
            }
            const response: ForgejoPackage[] = await this.makeRequest(ForgejoSource.SEARCH_URL, params);

            for (const mod of response) {
                const versionParams = {
                    ref: mod.version
                }

                const url = format(ForgejoSource.VERSION_URL, mod.owner.username, mod.repository.name)

                const versionResponse = await this.makeRequest(url, versionParams).catch(_ => "");
                const ver = parse(versionResponse)

                if (ver["minecraft_version"] == mcVersion) {
                    return {
                        package: mod, 
                        project_id: mod.repository.id.toString()
                    }
                }
            }

            if (!Util.isArrayEmpty(response)) {
                pagesLeft = true;
            }
            
            page++
        }

        return undefined;
    }

    async search(query: string = "BitsVanilla"): Promise<string> {
        const mcVersion = await MinecraftUtils.getCurrentMinecraftVersion();

        let mod = await this.findPackage(query, mcVersion);

        if (!mod) {
            throw new ModNotFoundError(`Mod ${query} could not be found on Forgejo`)
        }

        return mod.project_id;
    }
    async install(version: Version, essential: boolean): Promise<void> {
        try {
            if (Mods.isModInstalled(version.modId)) {
                return;
            }

            await FileDownloader.downloadMod(version)

            const mod = {
                name: await this.getProjectName(version.modId),
                id: version.modId,
                fileName: version.fileName,
                version: version.versionNumber,
                source: this.getSourceName(),
                essential: essential,
                dependencies: []
            }

            Mods.trackMod(mod)
        } catch (e) {
            throw new DownloadError(`An error occured downloading mod with id ${version.modId} from ${this.getSourceName()}`)
        }
    }
    getSourceName(): string {
        return "Forgejo";
    }
    async getProjectName(id: string): Promise<string> {
        const response = await this.makeRequest(format(ForgejoSource.REPO_URL, id))
        return response.name;
    }
    async getLatestVersion(id: string = "34", mcVersion: string = "24w13a"): Promise<Version> {
        const projectName = await this.getProjectName(id)

        const mod = await this.findPackage(projectName, mcVersion)

        if (!mod) {
            throw new ModNotFoundError(`Mod with id ${id} has no available versions on ${this.getSourceName()} for Minecraft version ${mcVersion}`);
        }

        let filesUrl = format(ForgejoSource.FILES_URL, mod.package.owner.username, mod.package.type, mod.package.name, mod.package.version)

        let filesResponse: ForgejoFiles = await this.makeRequest(filesUrl);

        if (Util.isArrayEmpty(filesResponse)) {
            throw new ModNotFoundError(`Mod ${mod.package.name} has no files on Forgejo`)
        }

        let latestFile: ForgejoFile | undefined = undefined;
        for (const file of filesResponse) {
            if (file.name.endsWith(".jar")) {
                latestFile = file
                break;
            }
        }

        if (!latestFile) {
            throw new ModNotFoundError(`Mod ${mod.package.name} has no jar files on Forgejo`)
        }

        const downloadUrl = mod.package.html_url + `/files/${latestFile.id}`

        const version = {
            modId: mod.project_id,
            versionNumber: mod.package.version,
            fileName: latestFile.name,
            url: downloadUrl,
            dependencies: [],
            checksum: latestFile.sha1
        }

        return version
    }

    private async makeRequest(url: string, params?: object) {
         if (process.env.FORGEJO_API_KEY == undefined) {
             throw new Error("Attempted Forgejo api calls with undefined api key environment variable (FORGEJO_API_KEY)")
         }

        params = Object.assign({}, {"access_token": process.env.FORGEJO_API_KEY}, params)

        const response = await axios.get(url, {
            params
        })

        return await response.data;
    }
}