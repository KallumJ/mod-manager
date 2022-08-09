import path from "path";
import {readFileSync, unlinkSync} from "fs";
import DownloadError from "../errors/download_error.js";
import ModManager from "../mod-manager.js";
import {createHash} from "crypto";
import { DownloaderHelper } from "node-downloader-helper";


export default class FileDownloader {
    static async downloadMod(version: Version): Promise<void> {
        try {
            // Error out if url is null
            if (version.url == null) {
                throw new Error("URL was null");
            }

            // Download the file
            const downloader = new DownloaderHelper(version.url, ModManager.FilePaths.MODS_FOLDER_PATH, {
                fileName: version.fileName
            }).on("error", err => {
                throw err;
            });
            await downloader.start()

            // Check the checksum
            if (version.checksum != undefined || version.checksum != "") {
                const filePath = path.join(ModManager.FilePaths.MODS_FOLDER_PATH, version.fileName);
                const hash = this.getHashForFile(filePath)

                if (hash != version.checksum) {
                    unlinkSync(filePath);
                    throw new DownloadError("The hash for this file does not match the checksum provided")
                }
            }
        } catch (e) {
            throw new DownloadError(`Failed to download ${version.fileName} from ${version.url}`)
        }
    }

    private static getHashForFile(filePath: string) {
        const hash = createHash("sha1")

        const file = readFileSync(filePath);
        hash.update(file);

        return hash.digest("hex").toString();
    }
}