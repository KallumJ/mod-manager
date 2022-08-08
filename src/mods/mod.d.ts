declare global {
    // DONT FORGET TO UPDATE CONSTRUCTORS WHEN MOD SIGNATURE CHANGES
    type Mod = {
        id: string
        name: string
        fileName: string,
        version: string
        source: string,
        essential: boolean,
    }

    type Version = {
        modId: string
        fileName: string,
        url: string
        versionNumber: string,
        dependencies: Array<Version>
    }
}

export {}