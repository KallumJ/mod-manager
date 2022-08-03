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
                    let tableFunc = asTable.configure ({
                        title: x => chalk.cyanBright(Util.stringPrettyify(x)),
                        delimiter: chalk.blueBright(' | '),
                        dash: chalk.blueBright('-')
                    })
                    PrintUtils.info(tableFunc(Mods.getTrackedMods()))
                })
            })
    }

}