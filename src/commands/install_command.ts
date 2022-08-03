import {Command} from "commander";
import Subcommand from "./subcommand.js"
import ModManager from "../mod-manager.js";
import Mods from "../mods/mods.js";

export default class InstallCommand implements Subcommand {
    registerCommand(program: Command): void {
        program.command("install")
            .description("Installs the provided mods")
            .argument("<mods...>", "The mods to install")
            .action((mods) => {
                ModManager.execute(async () => {
                    for (const mod of mods) {
                        await Mods.install(mod);
                    }
                })
            });
    }
}