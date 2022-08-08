/*import ModSource from "./mod_source.js";
import axios from "axios";
import MinecraftUtils from "../../util/minecraft_utils.js";
import ModNotFoundError from "../../errors/mod_not_found_error.js";

export class CurseforgeSource implements ModSource {
    private static readonly BASE_URL: string = "https://api.curseforge.com";
    private static readonly SEARCH_URL: string = `${CurseforgeSource.BASE_URL}/v1/mods/search`;

    private static readonly MINECRAFT_ID: number = 432;
    private static readonly FABRIC_TYPE: number = 4;

    getLatestVersion(id: string, mcVersion: string): Promise<Version> {
        const response = await

        return Promise.resolve(undefined);
    }

    getProjectName(id: string): Promise<string> {
        return Promise.resolve("");
    }

    getSourceName(): string {
        return "Curseforge";
    }

    install(version: Version, essential: boolean): Promise<Mod> {
        return Promise.resolve(undefined);
    }

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

        const id = response.data[0].id;

        if (id == undefined) {
            throw new ModNotFoundError(`Mod ${query} could not be found on ${this.getSourceName()}`);
        }

        return id;
    }

    private async makeRequest(url: string, params: object) {
        if (process.env.CURSEFORGE_API_KEY == undefined) {
            throw new Error("Attempted Curseforge api calls with undefined api key environment variable (CURSEFORGE_API_KEY)")
        }

        const response = await axios.get(url, {
            headers: {
                "x-api-key": process.env.CURSEFORGE_API_KEY
            },
            params
        })
        return await response.data;
    }

}
*/
