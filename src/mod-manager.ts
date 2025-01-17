#!/usr/bin/env node
import {Command} from "commander";
import InitCommand from "./commands/init_command.js";
import InstallCommand from "./commands/install_command.js";
import Subcommand from "./commands/subcommand.js";
import Initialiser from "./util/initialiser.js";
import PrintUtils from "./util/print_utils.js";
import path from "path";
import {Logger, pino} from "pino"
import {ListCommand} from "./commands/list_command.js";
import UninstallCommand from "./commands/uninstall_command.js";
import EssentialCommand from "./commands/essential_command.js";
import {readFileSync, unlinkSync} from "fs";
import UpdateCommand from "./commands/update_command.js";
import MigratePossibleCommand from "./commands/migrate_possible.js";
import MigrateCommand from "./commands/migrate_command.js";
import ModrinthSource from "./mods/sources/modrinth_source.js";
import Mods from "./mods/mods.js";
import {CurseforgeSource} from "./mods/sources/curseforge_source.js";
import MinecraftUtils from "./util/minecraft_utils.js";
import chalk from "chalk";
import ForgejoSource from "./mods/sources/forgejo_source.js";

export default class ModManager {
    public static logger: Logger | null = null;
    static FilePaths = class {
        public static readonly MOD_MANAGER_FOLDER_PATH = path.join(".mod-manager");
        public static readonly LOGS_FOLDER = path.join(this.MOD_MANAGER_FOLDER_PATH, "logs");
        public static readonly LOG_FILE: string = path.join(this.LOGS_FOLDER, `${new Date().valueOf()}.log.json`);
        public static readonly MOD_FILE_PATH = path.join(this.MOD_MANAGER_FOLDER_PATH, "mods.json");
        public static readonly VERSION_FILE_PATH = path.join(this.MOD_MANAGER_FOLDER_PATH, "version")
        public static readonly MODS_FOLDER_PATH = path.join("mods")
    }
    private static program: Command = new Command();
    private static subcommands: Array<Subcommand> = [
        new InitCommand(),
        new InstallCommand(),
        new ListCommand(),
        new UninstallCommand(),
        new EssentialCommand(),
        new UpdateCommand(),
        new MigratePossibleCommand(),
        new MigrateCommand()
    ];

    static async init() {
        if (Initialiser.isInitialised()) {
            this.logger = ModManager.createLogger();
        }

        const version = Initialiser.isInitialised() ?
            await MinecraftUtils.getCurrentMinecraftVersion() :
            chalk.redBright("Not Initialised. See `mod-manager init -h` for more details!")

        this.program
            .name('mod-manager')
            .description('A package (mod) manager for Fabric Minecraft Servers')
            .version(`Minecraft server version: ${version}`, "-v, --version", "Reports the version of the Minecraft server");


        for (const command of this.subcommands) {
            command.registerCommand(this.program);
        }

        Mods.registerSource(new ModrinthSource())
        Mods.registerSource(new CurseforgeSource(), "CURSEFORGE_API_KEY")
        Mods.registerSource(new ForgejoSource(), "FORGEJO_API_KEY", true)

        this.program.showSuggestionAfterError();
        this.program.showHelpAfterError();

        this.program.parse();
    }

    static execute(callback: () => any): void {
        if (Initialiser.isInitialised()) {
            callback();
        } else {
            PrintUtils.error("Mod Manager is not initialised");
        }
    }

    static createLogger(): Logger {
        let logger = pino({
                base: {
                    pid: undefined,
                    hostname: undefined
                }
            },
            pino.destination({
                dest: ModManager.FilePaths.LOG_FILE,
                sync: true
            })
        );

        process.on("uncaughtException", error => {
            PrintUtils.error(`[FATAL]: ${error.message}`, error);
            setTimeout(() => process.exit(1), 1)
        })

        // If no errors are logged, cleanup the log file when the process exits
        process.on("exit", () => {
            // If file is only whitespace, i.e. blank
            if (!readFileSync(ModManager.FilePaths.LOG_FILE, "utf-8")?.trim().length) {
                unlinkSync(ModManager.FilePaths.LOG_FILE)
            }
        })

        return logger;
    }
}

ModManager.init();


