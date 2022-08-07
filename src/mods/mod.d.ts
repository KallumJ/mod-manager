declare global {
    // DONT FORGET TO UPDATE CONSTRUCTORS WHEN MOD SIGNATURE CHANGES
    type Mod = {
        id: string
        name: string
        fileName: string,
        version: string
        source: string,
        essential: boolean
    }

    type Version = {
        id: string
        fileName: string,
        url: string
        version_number: string
    }
}

export {}