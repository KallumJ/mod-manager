import chalk from "chalk";

export default class PrintUtils {
    static info(print: string) {
        console.log(chalk.white(print));
    }

    static warn(print: string) {
        console.log(chalk.yellowBright(print));
    }

    static success(print: string) {
        console.log(chalk.greenBright(print));
    }

    static error(print: string) {
        console.log(chalk.redBright(print));
    }
}