import * as fs from 'fs';
import { Config } from './config';
import * as path from 'path';
import { initMiddlewares } from './initMiddlewares';
import { createRouteTree } from './routes';
import { Express } from 'express';
import * as expressFunc from 'express';
import { buildRoutes } from './buildRoutes';

/**
 * Loads the config and checks if everything checks out
 *
 * @param configPath The absolut path to the config file
 * @param express The express application object where all the routes and static folders should be added to
 * @return true if config was loaded false if something whent wrong
 */
export function initCore(configPath: string, express: Express): boolean {
    // check if the config file exists
    try {
        if (!fs.existsSync(configPath)) {
            console.error(
                'Unable to initialize grafe-core. Config file not found please check the path you provided! Provided path: ' + configPath
            );
            return false;
        }
    } catch (error) {
        console.error('An error accoured reading the config file: ' + error);
        return false;
    }

    let config: Config;

    // read the config file and parse it
    try {
        config = JSON.parse(fs.readFileSync(configPath).toString());
    } catch (error) {
        console.error('Unable to read/parse grafe config file: ' + error);
        return false;
    }

    // set base dir in the config
    config.baseDir = path.parse(configPath).dir;

    // initiate Middlewares
    initMiddlewares(config);

    // createRouteTree
    config = createRouteTree(config);

    // reigster the routes from the routeTree
    buildRoutes(config, express);

    // integrate the static folders
    integrateStaticFolders(config, express);

    return true;
}

/**
 * Looks at the "statics" field of the config and adds the static folders to express
 * 
 * if the prefix of a static folder is ether undefined or '' then the field will be ignored and no
 * prefix will be added
 * 
 * @param config The grafe config
 * @param express
 * @return void
 */
function integrateStaticFolders(config: Config, express: Express): void {
    config.statics.forEach((folder) => {
        if (!folder.prefix || folder.prefix === '') {
            // register route without prefix
            express.use(
                expressFunc.static(path.join(config.baseDir, folder.folder))
            );
        } else {
            // the prefix has to start with a "/" so if it does not exist add it
            if (!folder.prefix.startsWith('/')) {
                folder.prefix = '/' + folder.prefix;
            }

            express.use(
                folder.prefix,
                expressFunc.static(path.join(config.baseDir, folder.folder))
            );
        }
    });
}
