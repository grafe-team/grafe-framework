import { Config } from './config';

export function initMiddlewares(config: Config) {
    config.middlewares.forEach(mw => {
        mw.func = require(mw.link);
    });
}