import chalk from "chalk";
import ora, {Ora} from "ora";
import ModManager from "../mod-manager.js";

export default class PrintUtils {

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

    static info(print: string) {
        console.log(chalk.white(print));
    }

    static warn(print: string) {
        console.log(chalk.yellowBright(print));
    }

    static success(print: string) {
        console.log(chalk.greenBright(print));
    }

    static error(print: string, err?: Error) {
        console.log(chalk.redBright(print));

        if (err instanceof Error) {
            if (ModManager.logger != null) {
                ModManager.logger.error(err)
            }
        }
    }
}