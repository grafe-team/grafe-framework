import { GrafeLogger } from '../logger/logger';
import { RouteImportConfig } from './routeImportConfig';

export class RouteConfigStore {
    private config: RouteImportConfig = {
        events: {},
        target: undefined,
    };

    public cache: any = {};

    public addEvent(event: string, functionName: string) {
        this.logger.trace(`Adding new Event "${event}" to route`);
        this.config.events[event] = functionName;
    }

    public addTarget(target: any) {
        this.logger.trace(`Adding new target to route`);
        this.config.target = target;
    }

    public getConfig() {
        return this.config;
    }

    public cacheWithName(name: string) {
        this.logger.trace(`Caching current config under the name ${name}`);
        this.cache[name] = this.config;
    }

    public getCached(name: string): RouteImportConfig | undefined {
        this.logger.trace(
            `Checking if there is a configuration with the name "${name}" in the cache!`
        );
        return this.cache[name];
    }

    public reset() {
        this.logger.trace('Resetting configuration injector');
        this.config = {
            events: {},
            target: undefined,
        };
    }

    /*
===============================================================================================
                            Singleton Logic
===============================================================================================
*/

    private static instance: RouteConfigStore;

    private constructor(private logger: GrafeLogger) {}

    public static getInstance(logger?: GrafeLogger): RouteConfigStore {
        if (!RouteConfigStore.instance) {
            if (!logger) {
                throw ReferenceError(
                    'The logger needs to be supplied on the first call of getInstance()!'
                );
            }
            RouteConfigStore.instance = new RouteConfigStore(logger);
        }

        return RouteConfigStore.instance;
    }
}
