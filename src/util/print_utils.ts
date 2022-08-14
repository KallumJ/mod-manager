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

        public stop(print: string) {
            this.updateText(print);
            this.spinner.stopAndPersist();
        }

        public pause() {
            this.spinner.stop();
        }

        public error(print: string | Error) {
            if (print instanceof Error) {
                this.spinner.fail(print.message)
                if (ModManager.logger != null) {
                    ModManager.logger.error(print)
                }
            } else {
                this.spinner.fail(print);
            }
        }

        public succeed(print: string) {
            this.spinner.succeed(print);
        }

        public warn(print: string) {
            this.spinner.warn(print);
        }

        public info(print: string) {
            this.spinner.info(`ℹ️ ${print}`);
        }

        public updateText(text: string) {
            this.spinner.start(text);
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

    static error(print: string | Error, err?: Error) {
        // If provided an error
        if (print instanceof Error) {
            // Output the error message
            console.log(chalk.redBright(print.message));

            // If no accompanying error to log was passed, log this one
            if (err == null) {
                err = print;
            }
        } else {
            // If a string is provided, output to user
            console.log(chalk.redBright(print));
        }

        // If there is an error to log, log it
        if (err instanceof Error) {
            if (ModManager.logger != null) {
                ModManager.logger.error(err)
            }
        }
    }
}