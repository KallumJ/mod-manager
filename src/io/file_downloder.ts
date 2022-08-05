import path from "path";
import * as https from "https";
import {createWriteStream} from "fs";
import DownloadError from "../errors/download_error.js";
import ModManager from "../mod-manager.js";


export default class FileDownloader {
    static downloadMod(task: DownloadTask): void {
        https.get(task.url, res => {
            const filePath = path.join(ModManager.FilePaths.MODS_FOLDER_PATH, task.fileName);
            const writeStream = createWriteStream(filePath);
            res.pipe(writeStream);
            writeStream.on("finish", () => writeStream.close());
            writeStream.on('error', () => {
                throw new DownloadError(`Failed to download ${task.fileName} from ${task.url}`)
            })
        })
    }
}