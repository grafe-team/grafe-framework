/**
 * This the the main grafe config. Some parts of the config will be read from the grae.json while some others
 * are created dynamically. This config holds all important information that grafe needs to function.
 */
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

    /**
     * The route tree representing all the routes that need to be created
     */
    routeTree: RoutePart;
}

/**
 * A Middleware is a function that can be placed before a route. This function will than allways be called before the route.
 * This objects holds all the important information that is nessasary to create such a middleware in grafe.
 */
export interface Middleware {
    /**
     * The lengthy name of the middleware that should be easaly understandable
     */
    name: string;

    /**
     * A probably lengthy description of what this middleware is supposed to do
     */
    description: string;

    /**
     * The shorted version of the name that will be used to identify the middleware within the route tree
     */
    value: string;

    /**
     * Is the absolut path to the middleware this property will be dynamicaly created on middleware creation
     */
    link: string;

    /**
     * Is the function importet from the middleware file
     */
    func?: (req: any, res: any, next: any) => void;
}

/**
 * A Part of the route tree can hold multible other parts of the tree or a leaf of the tree. The leaf has the type
 */
export interface RoutePart {
    /**
     * represents the next part of the route tree. If the next part is a leaf the type is @see Route
     */
    [route: string]: RoutePart | Route;
}

/**
 * Is a leaf in the route tree holds all the data nessasary for the creation of the route
 */
export interface Route {
    /**
     * The last part of the whole Rest endpoint
     *
     * @example
     *
     * If the enpoint is: /auth/login
     *
     * Then this value will be: login
     *
     */
    endpoint: string;

    /**
     * Rest method that should be used for that route
     */
    method: 'post' | 'get' | 'put' | 'delete';

    /**
     * What middlewares should be used on that route
     */
    middlewares: Middleware[];

    /**
     * Represents the absolute path to the file where the route logic is hosted
     */
    link?: string;

    /**
     * This is only a temporary fix. Without it typescirpt will think that a routPart is a route and throw an error
     */
    [route: string]: any;
}
