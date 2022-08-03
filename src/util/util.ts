export default class Util {
    static isArrayEmpty(array: Array<any> | undefined): boolean {
        return array === undefined || array.length == 0;
    }

    static stringPrettyify(str: string): string {
        return str // insert a space before all caps
            .replace(/([A-Z])/g, ' $1')
            // uppercase the first character
            .replace(/^./, function(str){ return str.toUpperCase(); })
    }
}
