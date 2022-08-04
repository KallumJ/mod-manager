import { stringSimilarity } from "string-similarity-js";

export default class Util {
    private static readonly SIMILARITY_THRESHOLD: number = 0.8;

    static isArrayEmpty(array: Array<any> | undefined): boolean {
        return array === undefined || array.length == 0;
    }

    static stringPrettyify(str: string): string {
        return str // insert a space before all caps
            .replace(/([A-Z])/g, ' $1')
            // uppercase the first character
            .replace(/^./, function(str){ return str.toUpperCase(); })
    }

    static areStringsSimilar(master: string, compare: string): boolean {
        master = master.toLowerCase();
        compare = compare.toLowerCase();
        return stringSimilarity(master, compare) >= this.SIMILARITY_THRESHOLD;
    }
}
