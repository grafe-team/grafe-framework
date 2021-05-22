import { Config, Middleware, Route, RoutePart } from "./config";
import { readAllFilesStats } from './file';
import * as path from 'path';

export function createRouteTree(config: Config): Config {
    
    const filesStats = readAllFilesStats(config.routePath);

    const routeTree: RoutePart = {};

    filesStats.forEach(file => {

        if (file.isDirectory) {
            createRoutePart(file.path);
        } else  if (file.isFile) {
            // the method needs to be stripped and middlewares need to be stripped of the name
            createRoute(file.path, undefined);
        }

    });

    return config;
}

function createRoutePart(directoryPath: string): RoutePart {

}

function createRoute(fileName: string, mw: Middleware[]): Route {
    
}
