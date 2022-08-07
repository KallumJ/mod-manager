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
            .action((version) => {
                ModManager.execute(async () => {
                        // If no version is provided, prompt user for one
                        if (version === "" || version == undefined) {
                            version = await MinecraftUtils.getMinecraftVersionFromInput("What Minecraft version would you like to migrate to?");
                        }

                        // If version is valid, check if migration is possible
                        if (await MinecraftUtils.isValidVersion(version)) {
                            const possible = await Mods.isMigratePossible(version);

                            if (possible) {
                                PrintUtils.success(`It is possible to migrate to version ${version}`)
                            } else {
                                PrintUtils.error(`It is not possible to migrate to version ${version}`)
                            }
                        } else {
                            PrintUtils.error(`${version} is not a valid Minecraft version`);
                        }
                    }
                )
            })
    }
}