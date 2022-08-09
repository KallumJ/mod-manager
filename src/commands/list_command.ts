import Subcommand from "./subcommand.js";
import {Command} from "commander";
import ModManager from "../mod-manager.js";
import asTable from "as-table";
import Mods from "../mods/mods.js";
import PrintUtils from "../util/print_utils.js";
import chalk from "chalk";
import Util from "../util/util.js";

export class ListCommand implements Subcommand {
    registerCommand(program: Command): void {
        program.command("list")
            .description("Lists installed mods")
            .action(() => {
                ModManager.execute(() => {
                    const tableFunc = asTable.configure({
                        title: x => chalk.cyanBright(Util.stringPrettyify(x)),
                        delimiter: chalk.blueBright(' | '),
                        dash: chalk.blueBright('-')
                    })

                    const mods = Mods.getTrackedMods();

                    if (!Util.isArrayEmpty(mods)) {
                        PrintUtils.info("Tracked Mods:")
                        PrintUtils.info(tableFunc(mods))
                    } else {
                        PrintUtils.warn("There are no mods tracked yet! Try mod-manager install -h to figure out more!")
                    }

                    const untrackedMods = Mods.getUntrackedMods();
                    if (!Util.isArrayEmpty(untrackedMods)) {
                        PrintUtils.warn("\nUntracked Mods: ")
                        for (let untrackedMod of untrackedMods) {
                            PrintUtils.warn(untrackedMod)
                        }
                    }
                })
            })
    }

}