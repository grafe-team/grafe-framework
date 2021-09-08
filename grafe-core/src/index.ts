import { BasicLogger, LogLevel } from './logger/logger';
import * as path from 'path';
import { ComponentConfigStore } from './components/componentConfigStore';
import { Importer } from './importer/importer';
import { Config } from './config/config';
import { MiddlewareSpawner } from './middleware/middlewareSpawner';
import { MiddlewareHandler } from './middleware/middlewareHandler';
import { RouteSpawner } from './route/routeImporter';
import { cpuUsage } from 'process';
import { Grafe } from './grafe';

const grafe = new Grafe('../test');

// const config = new Config();

// const basicLogger = config.logger;

// config.addSpawner('middleware', new MiddlewareSpawner(config));
// config.addSpawner('route', new RouteSpawner(config));

// ComponentConfigStore.getInstance(basicLogger);

// const importer = new Importer(basicLogger);

// const config1 = importer.importModule(path.join(__dirname, 'test'));
// const config2 = importer.importModule(path.join(__dirname, 'test2'));
// const config3 = importer.importModule(path.join(__dirname, 'test3'));


// console.log(config1);
// console.log(config2);
// console.log(config3);

// config3.forEach(componentConfig => {
//     const spawner = config.getSpawner(componentConfig.type);
//     const component = spawner.spawn(componentConfig);

//     if (componentConfig.type === 'MIDDLEWARE') {
//         component.onRequest('This is a request!');
//     } else {
//         component.onPost('This is a request on post');
//     }
// });

