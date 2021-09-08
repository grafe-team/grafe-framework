import getCallerPath = require('get-caller-file');
import { GrafeLogger } from '../logger/logger';
import { RouteHandler } from './routeHandler';
import { RouteImportConfig } from './routeImportConfig';
import { Spawner } from '../components/spawner';
import { Config } from '../config/config';

export class RouteSpawner implements Spawner {
    public constructor(private config: Config) {
    }

    public spawn(config: RouteImportConfig): RouteHandler {
        const instance = new config.target;

        return new RouteHandler(instance, config, this.config.logger);
    }
}
