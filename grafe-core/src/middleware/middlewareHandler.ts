import { exception } from 'console';
import { GrafeLogger } from '../logger/logger';
import { MiddlewareEvents } from './middlewareEvents';
import { MiddlewareImportConfig } from './middlewareImportConfig';

export class MiddlewareHandler {
    public constructor(
        private middlewareInstance: any,
        private middlewareConfig: MiddlewareImportConfig,
        private logger: GrafeLogger
    ) {}

    public onRequest(...parameters: any) {
        this.onCall('request', ...parameters);
    }

    private onCall(event: MiddlewareEvents, ...parameters: any) {
        let result: any;
        try {
            const eventFunctionName = this.getEventFunction(event);
            if (eventFunctionName === -1) {
                // Route not found
                this.logger.debug(
                    `Got call on "${event}" but there was no listener`
                );
                return;
            }
            result = this.middlewareInstance[eventFunctionName](...parameters);
        } catch (error) {
            this.callErrorIfExists(error, event);
        }

        // if it is an async function we have to catch
        // the error instead of try and catch
        if (
            result instanceof Promise ||
            (result && result.then === 'function')
        ) {
            result.catch((error: Error) => {
                this.callErrorIfExists(error, event);
            });
        }
    }

    private callErrorIfExists(error: Error, handledEvent: MiddlewareEvents): boolean {
        const eventFunctionName = this.getEventFunction('error');
        if (eventFunctionName === -1) {
            this.logger.error(`A unhandled Error occurred while handeling the event "${handledEvent}": ${error}`);
            // throw error;
            return;
        }
        this.middlewareInstance[eventFunctionName](error);
    }

    private getEventFunction(event: string): string | -1 {
        if (!this.middlewareConfig.events[event]) {
            return -1;
        }

        return this.middlewareConfig.events[event];
    }
}
