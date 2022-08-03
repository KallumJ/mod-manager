import path from "path";
import * as https from "https";
import {createWriteStream} from "fs";
import DownloadError from "../errors/download_error.js";


export default class FileDownloader {
    private static readonly MODS_FOLDER_PATH: string = path.join("mods");

    static downloadMod(task: DownloadTask): void {
        https.get(task.url, res => {
            const filePath = path.join(this.MODS_FOLDER_PATH, task.fileName);
            const writeStream = createWriteStream(filePath);
            res.pipe(writeStream);
            writeStream.on("finish", () => writeStream.close());
            writeStream.on('error', () => {
                throw new DownloadError(`Failed to download ${task.fileName} from ${task.url}`)
            })
        })
    }
}