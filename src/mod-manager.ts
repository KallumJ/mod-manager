#!/usr/bin/env node
import { Command } from "commander";
import InitCommand from "./commands/init_command.js";
import InstallCommand from "./commands/install_command.js";
import Subcommand from "./commands/subcommand.js";
import Initialiser from "./util/initialiser.js";
import PrintUtils from "./util/print_utils.js";
//import PrettyError from "pretty-error";

export default class ModManager {
  private static program: Command = new Command();

  private static subcommands: Array<Subcommand> = [
    new InitCommand(),
    new InstallCommand()
  ];

  static init() {
    //const pe = new PrettyError();
    //pe.start();

    this.program
      .name('mod-manager')
      .description('A package (mod) manager for Fabric Minecraft Servers');

    for (const command of this.subcommands) {
      command.registerCommand(this.program);
    }

    this.program.parse();
  }

  static execute(callback: () => any): void {
    if (Initialiser.isInitialised()) {
      callback();
    } else {
      PrintUtils.error("Mod Manager is not initialised");
    }
  }
}

ModManager.init();


