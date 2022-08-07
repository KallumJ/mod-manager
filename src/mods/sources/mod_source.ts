export default interface ModSource {
    search(query: string): Promise<string>;

    install(version: Version, essential: boolean): Promise<Mod>;

    getSourceName(): string;

    getProjectName(id: string): Promise<string>;

    getLatestVersion(id: string, mcVersion: string): Promise<Version>;
}