export default interface ModSource {
    search(query: string): Promise<string>;

    install(id: string, essential: boolean): Promise<Mod>;

    getSourceName(): string;

    getProjectName(id: string): Promise<string>;
}