import { ComponentConfigStore } from '../../components/componentConfigStore';
import { MiddlewareConfig } from '../middlewareConfig';

export function Middleware(config?: MiddlewareConfig): any {
    return function (target: any, name: any, descriptor: any) {
        const configStore = ComponentConfigStore.getInstance();
        
        // the Object.keys functions throwns an error if the object is null
        // or undefined
        if (config !== null && config !== undefined) {
            // dynamically copy all elements of config to the current config.
            // we are doing it so that if we change the middlewareConfig that
            // we dont need to edit this part here to.
            Object.keys(config).forEach(key => {
                // i need to cast it to any because typescript wont let
                // me access it with only the []
                configStore.currentConfig[key] = (config as any)[key];
            });
        }

        configStore.currentConfig.target = target;
        configStore.currentConfig.type = 'MIDDLEWARE';
        configStore.safeCurrentConfig(target.name);
    };
}
