import { Command } from "commander";

export default interface Subcommand {
    registerCommand(program: Command): void;
}