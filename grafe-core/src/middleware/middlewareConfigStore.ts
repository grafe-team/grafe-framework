import { GrafeLogger } from '../logger/logger';
import { MiddlewareImportConfig } from './middlewareImportConfig';

export class MiddlewareConfigStore {
    private config: MiddlewareImportConfig = {
        events: {},
        shortCut: '',
        description: '',
        target: undefined,
    };

    public cache: any = {};

    public addEvent(event: string, functionName: string) {
        this.logger.trace(`Adding new Event "${event}" to middleware`);
        this.config.events[event] = functionName;
    }

    public addShortCut(shortCut: any) {
        this.logger.trace(`Adding new short cut to middleware`);
        this.config.shortCut = shortCut;
    }

    public addTarget(target: any) {
        this.logger.trace(`Adding new target to middleware`);
        this.config.target = target;
    }

    public getConfig() {
        return this.config;
    }

    public cacheWithName(name: string) {
        this.logger.trace(`Caching current middleware config under the name ${name}`);
        this.cache[name] = this.config;
    }

    public getCached(name: string): MiddlewareImportConfig | undefined {
        if (!this.cache[name]) {
            this.logger.error(
                `There is no route configuration with the name ${name} in the middleware config store!`
            );
        }
        return this.cache[name];
    }

    public reset() {
        this.logger.trace('Resetting middleware configuration store');
        this.config = {
            events: {},
            shortCut: '',
            description: '',
            target: undefined,
        };
    }

    /*
===============================================================================================
                            Singleton Logic
===============================================================================================
*/

    private static instance: MiddlewareConfigStore;

    private constructor(private logger: GrafeLogger) {}

    public static getInstance(logger?: GrafeLogger): MiddlewareConfigStore {
        if (!MiddlewareConfigStore.instance) {
            if (!logger) {
                throw ReferenceError(
                    'The logger needs to be supplied on the first call of getInstance()!'
                );
            }
            MiddlewareConfigStore.instance = new MiddlewareConfigStore(logger);
        }

        return MiddlewareConfigStore.instance;
    }
}
