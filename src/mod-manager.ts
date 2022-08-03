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


export default class ModManager {
    public static logger: Logger | null = null;
    private static readonly LOG_FILE: string = path.join(Initialiser.getModManagerFolderPath(), "logs", `${new Date().valueOf()}.log.json`);

    private static program: Command = new Command();

    private static subcommands: Array<Subcommand> = [
        new InitCommand(),
        new InstallCommand(),
        new ListCommand()
    ];

    static init() {
        if (Initialiser.isInitialised()) {
            this.logger = ModManager.createLogger();
        }

        this.program
            .name('mod-manager')
            .description('A package (mod) manager for Fabric Minecraft Servers');

        for (const command of this.subcommands) {
            command.registerCommand(this.program);
        }

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
        let logger = pino({base: {pid: undefined, hostname: undefined}}, pino.destination({dest: this.LOG_FILE}));
        process.on("uncaughtException", error => {
            PrintUtils.error(error.message, error);
            setTimeout(() => process.exit(1), 1)
        })

        return logger;
    }
}

ModManager.init();


