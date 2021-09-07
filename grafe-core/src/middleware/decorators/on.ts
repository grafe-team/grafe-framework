import { MiddlewareConfigStore } from '../middlewareConfigStore';
import { MiddlewareEvents } from '../middlewareEvents';

/**
 * The decorated function will be called when the middleware needs to handle
 * a new request
 *
 * The function will be provided with the request object
 * @param event
 */
 function on(event: 'request'): any;

/**
 * The decorated function will be called when an error ocurred.
 *
 * The function will be provided with the error object that was thrown
 * @param event
 */
function on(event: 'error'): any;

/**
 * The decorated function will be called when grafe stops. You have a total of 15 seconds
 * before the grafe force quits
 * @param event
 */
function on(event: 'destroy'): any;

/**
 * The decorated function will be called when your code takes longer than the timeout specified.
 *
 * The timeout has to be specified in ms. By default grafe will wait for 1.5s (1500) before calling the timeout
 * @param event
 */
function on(
    event: 'timeout',
    config: {
        maxTimeout: number;
    }
): any;

function on(
    event: MiddlewareEvents,
    config?: {
        maxTimeout?: number;
    }
): any {
    return function (target: any, name: any, descriptor: any): any {
        // this is the decorator
        // do something with 'target' and 'value'...
        MiddlewareConfigStore.getInstance().addEvent(event, name);
    };
}

export { on };
