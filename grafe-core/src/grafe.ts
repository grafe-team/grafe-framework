import { ComponentConfigStore } from "./components/componentConfigStore";
import { Config } from "./config/config";
import { Importer } from "./importer/importer";
import { MiddlewareSpawner } from "./middleware/middlewareSpawner";
import { RouteSpawner } from "./route/routeImporter";
import * as path from 'path';
import getCallerFile = require('get-caller-file');
import * as fs from 'fs';
import { LogLevel } from "./logger/logger";

export class Grafe {
    private config: Config;

    public constructor(configPath: string, logLevel: LogLevel = LogLevel.info) {
        const caller = getCallerFile();

        const configFilePath = path.join(path.dirname(caller), configPath);

        this.config = new Config(logLevel);
        this.config.projectBase = path.dirname(configFilePath);
        this.config.codeBase = path.dirname(caller);
        this.config.parseConfigFile(JSON.parse(fs.readFileSync(configFilePath, 'utf8')));

        this.config.addSpawner('middleware', new MiddlewareSpawner(this.config));
        this.config.addSpawner('route', new RouteSpawner(this.config));
    }

    public registerAddon(): void {
        throw new Error('This method is not jet implemented');
    }

    public registerRestProvider(): void {
        throw new Error('This method is not jet implemented');
    }

    public on(hook: string, handler: () => void): void {
        throw new Error('This method is not jet implemented');
    }

    public build(): void {
        ComponentConfigStore.getInstance(this.config.logger);

        const importer = new Importer(this.config.logger);

        importer.importModule(path.join(__dirname, 'test'));
    }
}
