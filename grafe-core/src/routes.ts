import { Config, Middleware, Route, RoutePart } from "./config";
import { readAllFilesStats } from './file';

/**
 * Builds the routeTree. It reads all the directories in the routePath and acoridng to the file-/dirnames it builds up a tree
 * 
 * This tree will then be added to the config 
 * 
 * ! The config will be edited in this function
 * 
 * @param config 
 * @returns 
 */
export function createRouteTree(config: Config): Config {
    const routeTree: RoutePart = {};

    _createRouteTree(config.routePath, routeTree, [], config.middlewares);

    config.routeTree = routeTree;

    return config;
}


/**
 * Builds the routeTree in a recursive way
 * 
 * @param parseDir The dir that is to be parsed
 * @param routePart The routePart where all new Parts/Routes should be attached to 
 * @param inheritedMiddlewares All the middlewares that should be inherited from the part above
 * @param allMiddlewares All middlewares available
 */
function _createRouteTree(parseDir: string, routePart: RoutePart, inheritedMiddlewares: Middleware[], allMiddlewares: Middleware[]): void {
    const filesStats = readAllFilesStats(parseDir);

    filesStats.forEach(file => {
        if (file.isDirectory) {
            const dirParseInfo = parseDirectoryName(file.name, inheritedMiddlewares, allMiddlewares);

            if (dirParseInfo.ignored) {
                return;
            }

            const newRoutePart: RoutePart = {};
            routePart[dirParseInfo.route] = newRoutePart;

            _createRouteTree(file.path, newRoutePart, inheritedMiddlewares, allMiddlewares);
        } else  if (file.isFile) {
            // parse the file name
            let parseInfo: {
                route: Route;
                ignored: boolean;
            };

            try {
                parseInfo = parseFileName(file.name, inheritedMiddlewares, allMiddlewares);
            } catch (error) {
                console.error(`An error accoured while parsing the file ${file.path}. This file will be skipped! Error: ${error}`);
                return; // skip this file
            }

            if (parseInfo.ignored) {
                return;
            }

            routePart[parseInfo.route.endpoint] = parseInfo.route;
        }

    });
}

/**
 * Parses the name of a directory. Checks if middlewares should be used or if the directory should be ignored.
 * 
 * If a directory begins with a _ it will be ignored. The only exeption is if it starts with _mw
 * Since you cant use a ':' as a directory name in windows we opted to replace it with a %-
 * 
 * Examples:
 *  test => {ignored: false, middlewares: [], route: 'test'}
 *  _mw.dc.usr => {ignored: false, middlewares: [{...}, {...}], route: ''}
 * _test => {ignored: true, middlewares: [], route: ''}
 * %test => {ignored: false, middlewares: [], route: ':test'}
 * 
 * !if the middleware short can not be cound in allMiddlewares it will be ignored and a warning will be logged
 * 
 * !the directoryName string will edited in this function
 * 
 * @param directoryName The name of the direectory
 * @param inheritedMiddlewares The parse result acourding to the rules above
 * @param allMiddlewares All the middlewares in this project
 */
function parseDirectoryName(directoryName: string, inheritedMiddlewares: Middleware[], allMiddlewares: Middleware[]): {ignored: boolean, middlewares: Middleware[], route: string} {

    directoryName = directoryName.trim().replace(/%/g, ':');

    if (directoryName.startsWith('_mw.')) {
       // add middlewares 
        const directoryParts = directoryName.split('.');

        directoryParts.shift();

        let middlewars = populateMiddlewares(directoryParts, allMiddlewares);

        middlewars = combineMiddlewareArrays(middlewars, inheritedMiddlewares);

        return {
            ignored: false,
            middlewares: middlewars,
            route: ''
        };
    }

    if (directoryName.startsWith('_')) {
        return {
            ignored: true,
            middlewares: [],
            route: ''
        };
    }

    return {
        ignored: false,
        middlewares: [],
        route: directoryName
    }
}

/**
 * Parses the filename of a file. Checks what method the route needs and what middlewares should be installed.
 * 
 * How a filename is build:
 *      [middleware shortcuts seperated by .].[route endpoint].[Rest method].js
 * 
 * In express route parameters are indicated by a ":" but you cant insert it in filenames (at least on windows). So 
 * we replace the ":" with "%". 
 * 
 * !Files will be ignored if they begin with a '_'
 * 
 * !Throws an error if the rest mothod provided is not supported
 * 
 * !the directoryName string will edited in this function
 * 
 * 
 * @param fileName Filename of the new endpoint
 * @param inheritedMws All the middlewares the endpoint inherits
 * @param allMiddlewares All middlewares that exist in this grafe project. 
 * @returns Information about the parse
 */
function parseFileName(fileName: string, inheritedMws: Middleware[], allMiddlewares: Middleware[]): { route: Route, ignored: boolean } {
    
    // replace alle % with : so express will understand it
    fileName = fileName.trim().replace(/%/g, ':');

    // check if the file needs to be ignores
    if (fileName[0] === '_') {
        return {
            route: null,
            ignored: true
        };
    }

    const routeParts = fileName.split('.');

    if (routeParts.length < 3) {
        throw 'The route needs to provide at least the endpoint and the method. Example: test.post.js';
    }

    // remove the file extension
    routeParts.pop();

    let mws: string[] = [];

    // add all middlewares to an array
    for (let i = 0; i < routeParts.length - 2; i++) {
        mws.push(routeParts[i]);
    }

    // populate the middlewares
    let middlewares = populateMiddlewares(mws, allMiddlewares);

    // add inherited middlewares
    middlewares = combineMiddlewareArrays(middlewares, inheritedMws);

    const method = parseRestMethodFromString(routeParts[routeParts.length - 1]);

    // if the file wants to use a unsupported rest mothod
    if (method === 'none') {
        throw `Rest Method ${routeParts[routeParts.length - 1]} does not exist.`;
    }

    return {
        ignored: false,
        route: {
            endpoint: routeParts[routeParts.length - 2],
            method,
            middlewares
        }
    }
}

/**
 * Takes in a string array. It compares this array with the all Middlewares array and returns a new array with all the middlewares that exist.
 * 
 * @param mws middleware shorts array 
 * @param allMiddlewares existing middlewares
 * @returns The middlewares coresponding to the middleware shorts given
 */
function populateMiddlewares(mws: string[], allMiddlewares: Middleware[]): Middleware[] {
    const middlewares: Middleware[] = [];

    mws.forEach(mw => {
        const middleware = allMiddlewares.filter((existingMw) => {return existingMw.value === mw});

        if (middleware.length === 0) {
            console.warn(`Middleware short ${mw} not found skipping it`);
            return;
        }

        if (middleware.length > 1) {
            console.warn(`Middleware short ${mw} is ambiguous skipping it`);
            return;
        }

        middlewares.push(middleware[0]);
    });

    return middlewares;
} 

/**
 * Checks the input string and returns the coresponding rest mothod. If no rest
 * method with this name exist 'none' will be returned. 
 * 
 * @param stringMethod the method string that needs to be parsed
 * @returns the coresponding rest mothod
 */
function parseRestMethodFromString(stringMethod: string): "post" | "get" | "put" | "delete" | "none" {
    stringMethod.trim();
    
    switch (stringMethod) {
        case "post":
            return "post";
        case "get":
            return "get";
        case "put":
            return "put";
        case "delete":
            return "delete";
                                            
        default:
            return "none";
    }
}

/**
 * Adds all middlewares contained in array1 that are missing in array2 to a new array. Returns this array then.
 * @param array1 
 * @param array2 
 * @returns 
 */
function combineMiddlewareArrays(array1: Middleware[], array2: Middleware[]): Middleware[] {
    const result: Middleware[] = [];

    array1.forEach(mw => {
        result.push(mw);
    });

    array2.forEach(mw => {
        if (!result.includes(mw)) {
            result.push(mw);
        }
    });

    return result;
}
