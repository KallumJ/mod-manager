import {Command} from "commander";
import Initialiser from "../util/initialiser.js";
import Subcommand from "./subcommand.js";

export default class InitCommand implements Subcommand {
    registerCommand(program: Command) {
        program.command("init")
            .description("Initialises mod manager")
            .action(async () => {
                await Initialiser.initialise();
            });
    }
}