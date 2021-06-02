import { Config, Route, RoutePart } from './config';
import { Express } from 'express';

/**
 * Reigsters the routes in the routeTree in Express
 *
 * ! will through an error if no routeTree is there
 * ! is not protected against stack overflows
 *
 * @param config The grafe config with a routeTree
 * @param express The express Aplicaion where the routes will be registered in
 */
export function buildRoutes(config: Config, express: Express): void {
    buildRoutePart(config.routeTree, '/', express);
}

/**
 * A recursive function that goes through the route tree, builds the routes and registers them in express
 *
 * @param routePart The routePart that you currently work on
 * @param route The path that was already take. For example: /api/v2/test
 * @param express The express aplication where the route should be register in
 */
function buildRoutePart(routePart: RoutePart, route: string, express: Express) {
    for (const key in routePart) {
        if (routePart[key].method !== undefined) {
            registerRoute(routePart[key] as Route, route, express);
        } else {
            buildRoutePart(routePart[key], route + key + '/', express);
        }
    }
}

/**
 * Register a route in Express
 *
 * Examples:
 *
 * registerRotue({endpoint: 'test'}, '/test', ...);
 * will result in => /test
 *
 * registerRotue({endpoint: 'test'}, '/', ...);
 * will alsoresutl in => /test
 *
 * @param route The route object that you got from the routeTree
 * @param prevRoutePath A string representing the path you took in the routeTree
 * @param express The express application where the route should be registered
 * @return void
 */
function registerRoute(
    route: Route,
    prevRoutePath: string,
    express: Express
): void {
    let endpoint: string;

    if (prevRoutePath.endsWith(route.endpoint)) {
        endpoint = prevRoutePath;
    } else {
        endpoint = prevRoutePath + route.endpoint;
    }

    const mws: ((req: any, res: any, next: any) => void)[] = [];

    route.middlewares.forEach((mw) => {
        mws.push(mw.func);
    });

    // eslint-disable-next-line
  const routeFunction = require(route.link);

    if (typeof routeFunction !== 'function') {
        console.error(
            `File ${route.link} can not be imorted because it does not export a function!`
        );
        return;
    }

    if (mws.length > 0) {
        express[route.method](endpoint, ...mws, routeFunction);
    } else {
        express[route.method](endpoint, routeFunction);
    }

    console.log(`Registered route ${route.method} ${endpoint}`);
}
