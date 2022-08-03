import chalk from "chalk";
import ora, { Ora } from "ora";
import ModManager from "../mod-manager.js";

export default class PrintUtils {

    static info(print: string) {
        if (ModManager.logger != null) {
            ModManager.logger.info(print);
        }

        console.log(chalk.white(print));
    }

    static warn(print: string) {
        if (ModManager.logger != null) {
            ModManager.logger.warn(print)
        }

        console.log(chalk.yellowBright(print));
    }

    static success(print: string) {
        if (ModManager.logger != null) {
            ModManager.logger.info(print)
        }

        console.log(chalk.greenBright(print));
    }

    static error(print: string) {
        if (ModManager.logger != null) {
            ModManager.logger.error(print);
        }

        console.log(chalk.redBright(print));
    }

    static Spinner = class {
        private spinner: Ora;

        constructor(text: string | null | undefined) {
            if (text == null || undefined) {
                text = "";
            }
            
            this.spinner = ora(text);
        }

        public start() {
            this.spinner.start();
        }

        public stop() {
            this.spinner.stop();
        }

        public error() {
            this.spinner.fail();
        }

        public succeed() {
            this.spinner.succeed();
        }

        public updateText(text: string) {
            this.spinner.info(text);
        }

        public clear() {
            this.spinner.clear();
        }
    }
}