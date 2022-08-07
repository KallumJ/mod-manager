import path from "path";
import * as https from "https";
import {createWriteStream} from "fs";
import DownloadError from "../errors/download_error.js";
import ModManager from "../mod-manager.js";


export default class FileDownloader {
    static downloadMod(version: Version): void {
        https.get(version.url, res => {
            const filePath = path.join(ModManager.FilePaths.MODS_FOLDER_PATH, version.fileName);
            const writeStream = createWriteStream(filePath);
            res.pipe(writeStream);
            writeStream.on("finish", () => writeStream.close());
            writeStream.on('error', () => {
                throw new DownloadError(`Failed to download ${version.fileName} from ${version.url}`)
            })
        })
    }
}