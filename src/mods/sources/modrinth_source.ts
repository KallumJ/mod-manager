import ModSource from "./mod_source.js";
import "string-format"
import {format} from "util";
import MinecraftUtils from "../../util/minecraft_utils.js";
import axios from "axios";
import ModNotFoundError from "../../errors/mod_not_found_error.js";
import Util from "../../util/util.js";
import FileDownloader from "../../io/file_downloder.js";
import DownloadError from "../../errors/download_error.js";

export default class ModrinthSource implements ModSource {
    private static readonly BASE_URL: string = "https://api.modrinth.com/v2";
    private static readonly SEARCH_URL: string = ModrinthSource.BASE_URL + "/search";
    private static readonly INSTALL_URL: string = ModrinthSource.BASE_URL + "/project/%s/version";

    /**
     * Searches Modrinth for the specified query
     * Example shape of data returned by query:
     * {
     * 	"hits": [
     * 		{
     * 			"project_id": "gvQqBUqZ",
     * 			"project_type": "mod",
     * 			"slug": "lithium",
     * 			"author": "jellysquid3",
     * 			"title": "Lithium",
     * 			"description": "No-compromises game logic/server optimization mod",
     * 			"categories": [
     * 				"optimization",
     * 				"fabric"
     * 			],
     * 			"display_categories": [
     * 				"optimization",
     * 				"fabric"
     * 			],
     * 			"versions": [
     * 				"1.16.2",
     * 				"1.16.3",
     * 				"1.16.4",
     * 				"1.16.5",
     * 				"1.17",
     * 				"1.17.1",
     * 				"1.18",
     * 				"1.18.1",
     * 				"1.18.2",
     * 				"1.19",
     * 				"1.19.1"
     * 			],
     * 			"downloads": 223103,
     * 			"follows": 1866,
     * 			"icon_url": "https://cdn.modrinth.com/data/gvQqBUqZ/icon.png",
     * 			"date_created": "2021-01-03T00:56:52.292581Z",
     * 			"date_modified": "2022-07-29T22:18:05.703354Z",
     * 			"latest_version": "1.19.1",
     * 			"license": "lgpl-3",
     * 			"client_side": "optional",
     * 			"server_side": "optional",
     * 			"gallery": []
     * 		}
     * 	],
     * 	"offset": 0,
     * 	"limit": 1,
     * 	"total_hits": 1
     * }
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
            throw new ModNotFoundError(`Mod ${query} could not be found on ${this.getName()}`);
        }

        return results[0].project_id;
    }

    /**
     * Installs the mod with the provided mod id
     * Example shape of data returned by query:
     * [
     *    {
     * 		"id": "ZRR9yqHD",
     * 		"project_id": "gvQqBUqZ",
     * 		"author_id": "uhPSqlnd",
     * 		"featured": false,
     * 		"name": "Lithium 0.8.3",
     * 		"version_number": "mc1.19.1-0.8.3",
     * 		"changelog": "Lithium 0.8.3 is the second release for 1.19.1! It includes a bugfix too!\n\n## Fixes\n- fix: update chunk serialization patch to new mappings\n\nYou can donate on patreon: https://www.patreon.com/2No2Name\n",
     * 		"changelog_url": null,
     * 		"date_published": "2022-07-29T22:18:09.072973Z",
     * 		"downloads": 3592,
     * 		"version_type": "release",
     * 		"files": [
     * 			{
     * 				"hashes": {
     * 					"sha1": "9ef9f10f62d4c19b736fe493f2a11d737fbe3d7c",
     * 					"sha512": "a3b623b4c14f6ba46d1486ffb3d1ba3174e3317b419b2ddfdf7bb572244e706d2e0a37bdce169c94455bec00fd107530ba78d7e611162a632cc6950e6a625433"
     * 				},
     * 				"url": "https://cdn.modrinth.com/data/gvQqBUqZ/versions/mc1.19.1-0.8.3/lithium-fabric-mc1.19.1-0.8.3.jar",
     * 				"filename": "lithium-fabric-mc1.19.1-0.8.3.jar",
     * 				"primary": true,
     * 				"size": 476619
     * 			}
     * 		],
     * 		"dependencies": [],
     * 		"game_versions": [
     * 			"1.19.1"
     * 		],
     * 		"loaders": [
     * 			"fabric"
     * 		]
     * 	}
     * ]
     * @param id the id of the mod
     * @throws DownloadError if an error occurs when downloading
     * @throws ModNotFoundError if there are no versions available for the current Minecraft Version
     */
    async install(id: string): Promise<void> {
        const mcVersion = await MinecraftUtils.getCurrentMinecraftVersion();

        const params = {
            loaders: '["fabric"]',
            game_versions: format('["%s"]', mcVersion)
        }

        const response = await axios.get(format(ModrinthSource.INSTALL_URL, id), {params});
        const results = await response.data;

        if (Util.isArrayEmpty(results)) {
            throw new ModNotFoundError(`Mod with id ${id} has no available versions on ${this.getName()} for Minecraft version ${mcVersion}`);
        }

        const latestFile = results[0].files[0];

        const task: DownloadTask = {
            fileName: latestFile.filename,
            url: latestFile.url
        }

        try {
            FileDownloader.downloadMod(task)
        } catch (e) {
            throw new DownloadError(`An error occurred downloading mod with id ${id} from ${this.getName()}`)
        }
    }

    getName(): string {
        return "Modrinth";
    }


}