import Subcommand from "./subcommand.js";
import {Command} from "commander";
import ModManager from "../mod-manager.js";
import Mods from "../mods/mods.js";

export default class UninstallCommand implements Subcommand {
    registerCommand(program: Command): void {
        program.command("uninstall")
            .description("Uninstalls the provided mods")
            .argument("<mods...>")
            .action((mods) => {
                ModManager.execute(() => {
                    for (let mod of mods) {
                        Mods.uninstall(mod);
                    }
                })
            })
    }
    
}