import * as fs from 'fs';
import { setConfig, Config } from './config';
import * as path from 'path';
import { initMiddlewares } from './initMiddlewares';

/**
 * Loades the config and checks if everything checks out
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

    // create links to the mws
    config = createMiddlewareLinks(config);

    // remove middlewares that do not exist
    config = removeNonExistantMiddlewares(config);
    console.log('setting config');

    // initiate Middlewares
    initMiddlewares(config);


    // set the created config so it can be used globaly
    setConfig(config);


    return true;
}

/**
 * Creates the links to the file of a middleware. The link is the path to the file where the middleware is saved
 * 
 * @param config the grafe config
 * @returns the new grafe config with the middleware links
 */
function createMiddlewareLinks(config: Config): Config {
    config.middlewares.forEach(mw => {
        // build the link 
        // middlewares are stored in the path: 'BASE_DIR/MW_STORAGE_PATH/MW_SHORT/MW_NAME.js
        // exapmle: BASEDIR/src/middlewares/usr/users_only.js
        mw.link = path.join(config.baseDir, config.middlewarePath, mw.value, mw.name + '.js');
    });

    return config;
}

/**
 * Checks if the middleware files exist. If they dont exist they will be removed from the list.
 * 
 * !The middleware links need to be constructed or errors will be thrown
 * 
 * @param config The grafe config
 * @returns The new grafe config
 */
function removeNonExistantMiddlewares(config: Config): Config {
    for (let i = 0; i < config.middlewares.length; i++) {
        
        // if a link is undefind throw an error
        if (config.middlewares[i].link === undefined) {
            throw `No link for middleware ${config.middlewares[i].name} found. Where the links build?`;
        }

        // check if the middleware file exists
        if (!fs.existsSync(config.middlewares[i].link)) {
            // remove the mw because it does not exist
            config.middlewares.splice(i, 1);

            // decrease i by one so we dont skip a mw
            i--;
        }
    }

    return config;
}