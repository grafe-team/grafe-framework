export interface GrafeConfig {
    tests?: boolean;
    staticFolders?: StaticFolderInfo[];
}

export interface StaticFolderInfo {
    folder: string;
    prefix?: string;
} 