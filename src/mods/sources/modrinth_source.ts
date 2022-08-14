import ModSource from "./mod_source.js";
import "string-format"
import {format} from "util";
import MinecraftUtils from "../../util/minecraft_utils.js";
import axios from "axios";
import ModNotFoundError from "../../errors/mod_not_found_error.js";
import Util from "../../util/util.js";
import FileDownloader from "../../io/file_downloder.js";
import DownloadError from "../../errors/download_error.js";
import Mods from "../mods.js";

export default class ModrinthSource implements ModSource {
    private static readonly BASE_URL: string = "https://api.modrinth.com/v2";
    private static readonly SEARCH_URL: string = ModrinthSource.BASE_URL + "/search";
    private static readonly LIST_VERSIONS_URL: string = ModrinthSource.BASE_URL + "/project/%s/version";
    private static readonly PROJECT_URL: string = ModrinthSource.BASE_URL + "/project/%s";
    private static readonly SINGLE_VERSION_URL: string = `${ModrinthSource.BASE_URL}/version/%s`;

    /**
     * Searches Modrinth for the specified query
     * Example shape of data returned by query: https://controlc.com/e04a9fb9
     * @param query the query to search for
     * @throws ModNotFoundError if the query returns no results.
     * @returns The mod id of the found mod
     */
    async search(query: string): Promise<string> {
        const mcVersion = await MinecraftUtils.getCurrentMinecraftVersion();

        const params = {
            query: query,
            limit: 1,
            facets: format('[["categories:fabric"],["versions:%s"]]', mcVersion)
        }

        const response = await axios.get(ModrinthSource.SEARCH_URL, {params});
        const results = await response.data.hits;

        if (Util.isArrayEmpty(results)) {
            throw new ModNotFoundError(`Mod ${query} could not be found on ${this.getSourceName()}`);
        }

        return results[0].project_id;
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
            await FileDownloader.downloadMod(version)

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

    getSourceName(): string {
        return "Modrinth";
    }

    /**
     * Gets the name of the project with the provided id
     * Example Shape of data from the query: https://controlc.com/7a9d5ff3
     * @param id the id to get the name of
     * @return The found project name
     */
    async getProjectName(id: string): Promise<string> {
        const response = await axios.get(format(ModrinthSource.PROJECT_URL, id));
        return await response.data.title;
    }

    /**
     * Gets the latest version of the mod
     * Example shape of data returned by query: https://controlc.com/ee4a2c1c
     * @param id the project id of the mod
     * @param mcVersion the minecraft version to check for
     * @throws ModNotFoundError if there are no versions available for the provided Minecraft Version
     */
    async getLatestVersion(id: string, mcVersion: string): Promise<Version> {
        const params = {
            loaders: '["fabric"]',
            game_versions: format('["%s"]', mcVersion)
        }

        const response = await axios.get(format(ModrinthSource.LIST_VERSIONS_URL, id), {params});
        const results = await response.data;

        if (Util.isArrayEmpty(results)) {
            throw new ModNotFoundError(`Mod with id ${id} has no available versions on ${this.getSourceName()} for Minecraft version ${mcVersion}`);
        }
        const latestVersion = results[0];

        const dependencies = [];
        if (!Util.isArrayEmpty(latestVersion.dependencies)) {
            for (let dependency of latestVersion.dependencies) {
                if (dependency.dependency_type === "required") {
                    const projectId = dependency.project_id;
                    const versionId = dependency.version_id;

                    dependencies.push(await this.getDependency(projectId, versionId, mcVersion))
                }
            }
        }

        const latestFile = latestVersion.files[0];
        const checksum = latestFile.hashes.sha1;

        return {
            modId: latestVersion.project_id,
            versionNumber: latestVersion.version_number,
            fileName: latestFile.filename,
            url: latestFile.url,
            dependencies: dependencies,
            checksum: checksum
        };
    }

    async getDependency(projectId: string | undefined, versionId: string | undefined, mcVersion: string): Promise<Version> {
        if (projectId != undefined) {
            return this.getLatestVersion(projectId, mcVersion)
        } else if (versionId != undefined) {
            const projectId = await this.getProjectFromVersionId(versionId);
            return this.getLatestVersion(projectId, mcVersion);
        } else {
            throw new Error("Dependency found with no project or version id")
        }
    }

    /**
     * Gets a version object from the provided version id
     * Example response from query:
     * {
     * 	"id": "3KmOcp6b",
     * 	"project_id": "P7dR8mSH",
     * 	"author_id": "JZA4dW8o",
     * 	"featured": false,
     * 	"name": "[1.19] Fabric API 0.58.0+1.19",
     * 	"version_number": "0.58.0+1.19",
     * 	"changelog": "- Bump version (modmuss50)\n- Enable parallel builds by default. Update remotesign to a parallel capable version. Set org.gradle.parallel.threads in actions as we are IO bound. (modmuss50)\n- fix custom dimension not loaded on world preset other than default (#2387) (deirn)\n- Fix inconsistent ordering of item attribute modifiers by using a linked hashmap (#2380) (Technici4n)\n- Fix incorrect check in GlobalReceiverRegistry (#2363) (apple502j)\n- Make disconnected screen reason text scrollable (#2349) (deirn, modmuss50)\n- Fix Indigo AO calculation (#2344) (PepperCode1)\n",
     * 	"changelog_url": null,
     * 	"date_published": "2022-07-21T20:10:41.654884Z",
     * 	"downloads": 16745,
     * 	"version_type": "release",
     * 	"files": [
     * 		{
     * 			"hashes": {
     * 				"sha512": "9c948488852e3bcf7a84fef26465bf0bcfbba17fb03e6b56ae11cf82d1ae6abbfb4c569bf3f1d088c6c3c5219d37c2699afc9013926f588263210a19f8d6e235",
     * 				"sha1": "6d29acc99b293b2be7060df6d7c887812bd54e46"
     * 			},
     * 			"url": "https://cdn.modrinth.com/data/P7dR8mSH/versions/0.58.0+1.19/fabric-api-0.58.0%2B1.19.jar",
     * 			"filename": "fabric-api-0.58.0+1.19.jar",
     * 			"primary": false,
     * 			"size": 1496048
     * 		}
     * 	],
     * 	"dependencies": [],
     * 	"game_versions": [
     * 		"1.19"
     * 	],
     * 	"loaders": [
     * 		"fabric"
     * 	]
     * }
     * @param versionId the version id to transform into an object
     * @return the Version object
     */
    async getProjectFromVersionId(versionId: string): Promise<string> {
        const response = await axios.get(format(ModrinthSource.SINGLE_VERSION_URL, versionId));
        const latestVersion = await response.data;
        return latestVersion.project_id;
    }
}