import Subcommand from "./subcommand.js";
import {Command} from "commander";
import ModManager from "../mod-manager.js";
import Mods from "../mods/mods.js";

export default class EssentialCommand implements Subcommand {
    registerCommand(program: Command): void {
        program.command("essential")
            .description("Toggles the mods essential statuses")
            .argument("<mods...>", "The mods to toggle the essential status of (as names or ids)")
            .action((mods) => {
                ModManager.execute(() => {
                    for (let mod of mods) {
                        Mods.toggleEssential(mod)
                    }
                })
            })
    }

}