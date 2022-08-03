export default interface ModSource {
    search(query: string): Promise<string>;
    install(id: string): Promise<void>;
    getName(): string;
}