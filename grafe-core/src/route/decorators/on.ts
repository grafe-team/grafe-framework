import { HttpMethods } from '../httpMethods';
import { RouteConfigStore } from '../routeConfigStore';

/**
 * The decorated function will be called if a get request is made on this path
 * @param event
 */
function on(event: 'get'): any;

/**
 * The decorated function will be called if a post request is made on this path
 * @param event
 */
function on(event: 'post'): any;

/**
 * The decorated function will be called if a put request is made on this path
 * @param event
 */
function on(event: 'put'): any;

/**
 * The decorated function will be called if a delete request is made on this path
 * @param event
 */
function on(event: 'delete'): any;

/**
 * The decorated function will be called if a head request is made on this path
 * @param event
 */
function on(event: 'head'): any;

/**
 * The decorated function will be called if a connect request is made on this path
 * @param event
 */
function on(event: 'connect'): any;

/**
 * The decorated function will be called if a options request is made on this path
 * @param event
 */
function on(event: 'options'): any;

/**
 * The decorated function will be called if a trace request is made on this path
 * @param event
 */
function on(event: 'trace'): any;

/**
 * The decorated function will be called if a patch request is made on this path
 * @param event
 */
function on(event: 'patch'): any;

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
    event: HttpMethods,
    config?: {
        maxTimeout?: number;
    }
): any {
    return function (target: any, name: any, descriptor: any): any {
        // this is the decorator
        // do something with 'target' and 'value'...
        RouteConfigStore.getInstance().addEvent(event, name);
    };
}

export { on };
