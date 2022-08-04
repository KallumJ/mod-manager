import Subcommand from "./subcommand.js";
import {Command} from "commander";
import ModManager from "../mod-manager.js";
import Mods from "../mods/mods.js";

export default class EssentialCommand implements Subcommand {
    registerCommand(program: Command): void {
        program.command("essential")
            .description("Marks mods as essential")
            .argument("<mods...>", "The mods to mark as essential (as names or ids)")
            .action((mods) => {
                ModManager.execute(() => {
                    for (let mod of mods) {
                        Mods.markEssential(mod)
                    }
                })
            })
    }

}