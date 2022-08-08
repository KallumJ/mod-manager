import Subcommand from "./subcommand.js";
import {Command} from "commander";
import ModManager from "../mod-manager.js";
import Mods from "../mods/mods.js";
import MinecraftUtils from "../util/minecraft_utils.js";
import PrintUtils from "../util/print_utils.js";

export default class MigratePossibleCommand implements Subcommand {
    registerCommand(program: Command): void {
        program.command("migrate-possible")
            .description("Reports whether it is possible to upgrade to the provided Minecraft version")
            .argument("[version]", "The Minecraft version to try and migrate to")
            .option("-f, --force", "Checks whether a force migration is possible, where only essential mods are included", false)
            .action((version, options) => {
                ModManager.execute(async () => {
                        const force = options.force;

                        // If no version is provided, prompt user for one
                        if (version === "" || version == undefined) {
                            version = await MinecraftUtils.getMinecraftVersionFromInput("What Minecraft version would you like to migrate to?");
                        }

                        try {
                            await Mods.isMigratePossible(version, force);
                        } catch (e) {
                            PrintUtils.error(e.message)
                        }
                    }
                )
            })
    }
}