import { GrafeLogger, LogLevel } from "../logger/logger";
import { BasicLogger } from "../logger/logger";
import { Spawner } from "../components/spawner";
import { GrafeConfig, StaticFolderInfo } from "./grafeConfig";
import { StaticFolder } from './staticFolder';
import { RouteTree } from "../routeTree/routeTree";

export class Config {

    public constructor(logLevel: LogLevel) {
        this.logger = new BasicLogger(logLevel);

        this.routeTree = new RouteTree();
    }

    private spawners: Record<string, Spawner> = {};

    public logger: GrafeLogger;

    public staticFolders: StaticFolder[] = [];

    public projectBase: string;

    public codeBase: string;

    public routeTree: RouteTree;

    public addSpawner(forComponent: string, spawner: Spawner) {
        if (this.spawners[forComponent.toUpperCase()]) {
            this.logger.warn(`There is already a spawner for the component "${forComponent}". The old spawner will be overridden. This may cause unforseen problems!`);
        }

        this.spawners[forComponent.toUpperCase()] = spawner;
    }

    public getSpawner(forComponent: string): Spawner {
        return this.spawners[forComponent.toUpperCase()];
    }

    public parseConfigFile(config: GrafeConfig) {
        config.staticFolders?.forEach(folder => {
            // Add the static folder to the static folder array
            // if the folder could not be added tell the user
            if (!this.addStaticFolder(folder)) {
                this.logger.warn(`Unable to use static folder ${folder.folder}! Is the folder reachable?`);
            }
        });

    }

    private addStaticFolder(staticFolderConfig: StaticFolderInfo): boolean {

        const staticFolder = new StaticFolder(staticFolderConfig.folder, this, staticFolderConfig.prefix);

        if (!staticFolder.checkFolder()) {
            return false;
        }

        this.staticFolders.push(staticFolder);
        return true;
    }
}
