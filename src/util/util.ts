export default class Util {
    static isArrayEmpty(array: Array<any> | undefined): boolean {
        return array === undefined || array.length == 0;
    }
}
