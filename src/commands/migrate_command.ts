import Subcommand from "./subcommand.js";
import {Command} from "commander";
import ModManager from "../mod-manager.js";
import MinecraftUtils from "../util/minecraft_utils.js";
import Mods from "../mods/mods.js";
import PrintUtils from "../util/print_utils.js";
import MigrateError from "../errors/migrate_error.js";

export default class MigrateCommand implements Subcommand {
    registerCommand(program: Command): void {
        program.command("migrate")
            .description("Migrates all mods to provided Minecraft version")
            .argument("[version]", "The Minecraft version to try and migrate to")
            .option("-f, --force", "Migrates all mods, but discards any non essential mods that are not available", false)
            .action((version, options) => {
                ModManager.execute(async () => {
                    const force = options.force;

                    // If no version is provided, prompt user for one
                    if (version === "" || version == undefined) {
                        version = await MinecraftUtils.getMinecraftVersionFromInput("What Minecraft version would you like to migrate to?");
                    }

                    // Start the migration
                    try {
                        await Mods.migrate(version, force)
                    } catch (e) {
                        if (e instanceof MigrateError) {
                            PrintUtils.error(e.message)
                        } else {
                            throw e;
                        }
                    }
                })
            })
    }

}