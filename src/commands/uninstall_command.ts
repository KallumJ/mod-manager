import Subcommand from "./subcommand.js";
import {Command} from "commander";
import ModManager from "../mod-manager.js";
import Mods from "../mods/mods.js";

export default class UninstallCommand implements Subcommand {
    registerCommand(program: Command): void {
        program.command("uninstall")
            .description("Uninstalls the provided mods")
            .argument("<mods...>", "The mods to uninstall (as names or ids)")
            .action((mods) => {
                ModManager.execute(async () => {
                    for (let mod of mods) {
                        await Mods.uninstall(mod);
                    }
                })
            })
    }

}