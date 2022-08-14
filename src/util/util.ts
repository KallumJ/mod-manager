import {stringSimilarity} from "string-similarity-js";
import inquirer from "inquirer";

export default class Util {
    private static readonly SIMILARITY_THRESHOLD: number = 0.8;

    static isArrayEmpty(array: Array<any> | undefined): boolean {
        return array === undefined || array.length == 0;
    }

    static stringPrettyify(str: string): string {
        return str // insert a space before all caps
            .replace(/([A-Z])/g, ' $1')
            // uppercase the first character
            .replace(/^./, function (str) {
                return str.toUpperCase();
            })
    }

    static areStringsSimilar(master: string, compare: string): boolean {
        master = master.toLowerCase();
        compare = compare.toLowerCase();
        return stringSimilarity(master, compare) >= this.SIMILARITY_THRESHOLD;
    }

    static async getYesNoFromUser(question: string) {
        const answer = await inquirer.prompt([{
            type: "input",
            name: "confirm",
            message: question,
            async validate(input: any): Promise<string | boolean> {
                const lowerInput = input.toLowerCase();
                const valid = lowerInput === "y" || lowerInput === "n" ;
                if (!valid) {
                    return "Please answer either y or n"
                }
                return valid
            },
        }])
        return Util.getBoolFromYesNo(answer.confirm);
    }

    private static getBoolFromYesNo(answer: string) {
        if (answer.toLowerCase() === "y") {
            return true;
        } else if (answer.toLowerCase() === "n") {
            return false
        } else {
            throw new Error("Invalid answer to get a boolean value from")
        }
    }
}
