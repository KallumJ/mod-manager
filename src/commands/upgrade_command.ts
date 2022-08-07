import Subcommand from "./subcommand.js";
import {Command} from "commander";
import ModManager from "../mod-manager.js";
import Mods from "../mods/mods.js";

export default class UpgradeCommand implements Subcommand {
    registerCommand(program: Command): void {
        program.command("update")
            .description("Checks for and updates mods that have a newer available version")
            .action(() => {
                ModManager.execute(async() => {
                    await Mods.update();
                })
            })
    }

}