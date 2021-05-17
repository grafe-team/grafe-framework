
export interface Config {
    /**
     * What type of project are we handeling. For now this can only be express
     */
    projectType: string;

    /**
     * Here all the middlewares that are used in the project are discribed
     */
    middlewares: Middleware[]; 

    /**
     * The path to the directory where the routes are stored
     */
    routePath: string;

    /**
     * The path to the directory where the middlewares are stored
     */
    middlewarePath: string;

    /**
     * String to the directory where the grafe.json file lives
     */
    baseDir: string;
}

export interface Middleware {
    /**
     * Long name of the middleware.
     */
    name: string;

    /**
     * A description of what the middlware is doing
     */
    description: string;

    /**
     * The shortcut by which we identify the middleware in the path
     */
    value: string;

    /**
     * Points to the file of the middleware 
    */
    link: string;

    /**
     * Is the function of the middle ware
     */
    func?: (req: any, res: any, next: any) => any;
}

/**
 * Global config for used inside all grafe core functions 
 */
let __grafe_core_config: Config;

/**
 * Returns the global grafe config
 * @returns Config
 */
export function getConfig(): Config {
    return __grafe_core_config;
}

/**
 * Sets the global config to the config provided
 * @param config The new config to set
 * @returns The new config
 */
export function setConfig(config: Config): Config {
    __grafe_core_config = config;
    return config;
}


