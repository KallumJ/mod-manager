import { Command } from "commander";

export default abstract class Subcommand {
    abstract registerCommand(program: Command): void;
    abstract execute(): void;
}