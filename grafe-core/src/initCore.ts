import * as fs from 'fs';
import { Config } from './config';
import * as path from 'path';
import { initMiddlewares } from './initMiddlewares';
import { createRouteTree } from './routes';

/**
 * Loads the config and checks if everything checks out
 * 
 * @param configPath The absolut path to the config file
 * @returns true if config was loaded false if something whent wrong
 */
export function initCore(configPath: string): boolean {
    // check if the config file exists
    try {

        if (!fs.existsSync(configPath)) {
            console.error('Unable to initialize grafe-core. Config file not found please check the path you provided!');
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
    } catch(error) {
        console.error('Unable to read/pares grafe cofnig file: ' + error);
        return false;
    }

    // set base dir in the config
    config.baseDir = path.parse(configPath).dir;

    // initiate Middlewares
    initMiddlewares(config);

    // createRouteTree
    config = createRouteTree(config);

    return true;
}