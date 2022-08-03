export default interface ModSource {
    search(query: string): Promise<string>;

    install(id: string): Promise<Mod>;

    getSourceName(): string;

    getProjectName(id: string): Promise<string>;
}