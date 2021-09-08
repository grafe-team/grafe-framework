import { GrafeLogger } from '../logger/logger';
import { MiddlewareHandler } from './middlewareHandler';
import { MiddlewareImportConfig } from './middlewareImportConfig';
import { Spawner } from '../components/spawner';
import { Config } from '../config/config';

export class MiddlewareSpawner implements Spawner  {
    public constructor(private config: Config) {
    }

    public spawn(config: MiddlewareImportConfig): MiddlewareHandler {
        const instance = new config.target;

        return new MiddlewareHandler(instance, config, this.config.logger);
    }

}
