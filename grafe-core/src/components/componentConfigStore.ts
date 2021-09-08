import { GrafeLogger } from '../logger/logger';

export class ComponentConfigStore {
    public currentConfig: any = {};
    
    private config: Record<string, any> = {};

    public safeCurrentConfig(target: string) {
        if (this.config[target]) {
            this.logger.error(`There is already a configuration under the the target "${target}". The old configuration will be overwritten!`);
        }
        this.config[target] = this.currentConfig;
        this.currentConfig = {};
    }

    public getConfigOf(target: string) {
        if (!this.config[target]) {
            this.logger.error(`There is no configuration for the target "${target}"!`);
            return undefined;
        }
        return this.config[target];
    }

    /*
    ===============================================================================================
                                Singleton Logic
    ===============================================================================================
    */

    private static instance: ComponentConfigStore;

    private constructor(private logger: GrafeLogger) {}

    public static getInstance(logger?: GrafeLogger): ComponentConfigStore {
        if (!ComponentConfigStore.instance) {
            if (!logger) {
                throw ReferenceError(
                    'The logger needs to be supplied on the first call of getInstance()!'
                );
            }
            ComponentConfigStore.instance = new ComponentConfigStore(logger);
        }

        return ComponentConfigStore.instance;
    }
}
