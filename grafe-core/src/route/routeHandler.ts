import { exception } from 'console';
import { GrafeLogger } from '../logger/logger';
import { HttpMethods } from './httpMethods';
import { RouteImportConfig } from './routeImportConfig';

export class RouteHandler {
    public constructor(
        private routeInstance: any,
        private routeConfig: RouteImportConfig,
        private logger: GrafeLogger
    ) {}

    public onGet(...parameters: any) {
        this.onCall('get', ...parameters);
    }

    public onPost(...parameters: any) {
        this.onCall('post', ...parameters);
    }

    public onPut(...parameters: any) {
        this.onCall('put', ...parameters);
    }

    public onDelete(...parameters: any) {
        this.onCall('delete', ...parameters);
    }

    public onHead(...parameters: any) {
        this.onCall('head', ...parameters);
    }

    public onConnect(...parameters: any) {
        this.onCall('connect', ...parameters);
    }

    public onOptions(...parameters: any) {
        this.onCall('options', ...parameters);
    }

    public onTrace(...parameters: any) {
        this.onCall('trace', ...parameters);
    }

    public onPatch(...parameters: any) {
        this.onCall('patch', ...parameters);
    }

    private onCall(method: HttpMethods, ...parameters: any) {
        let result: any;
        try {
            const eventFunctionName = this.getEventFunction(method);
            if (eventFunctionName === -1) {
                // Route not found
                this.logger.debug(
                    `Got call on "${method}" but there was no listener`
                );
                return;
            }
            result = this.routeInstance[eventFunctionName](...parameters);
        } catch (error) {
            this.callErrorIfExists(error);
        }

        // if it is an async function we have to catch
        // the error instead of try and catch
        if (
            result instanceof Promise ||
            (result && result.then === 'function')
        ) {
            result.catch((error: Error) => {
                this.callErrorIfExists(error);
            });
        }
    }

    private callErrorIfExists(error: Error) {
        const eventFunctionName = this.getEventFunction('error');
        if (eventFunctionName === -1) {
            this.logger.error(`A unhandled Error occurred: ${error}`);
            // throw error;
            return;
        }
        this.routeInstance[eventFunctionName](error);
    }

    private getEventFunction(event: string): string | -1 {
        if (!this.routeConfig.events[event]) {
            return -1;
        }

        return this.routeConfig.events[event];
    }
}
