import getCallerPath = require('get-caller-file');
import * as path from 'path';
import { GrafeLogger } from '../logger/logger';
import { RouteConfigInjector } from './routeConfigInjector';
import { RouteHandler } from './routeHandler';
import { RouteImportConfig } from './routeImportConfig';
import { Importer } from '../importer/importer';

export class RouteImporter extends Importer {
    public constructor(logger: GrafeLogger) {
        super(logger);
    }

    public import(filePath: string): RouteHandler {
        const routeConfigInjector = RouteConfigInjector.getInstance();
        routeConfigInjector.reset();

        const module = this.importModule(filePath);

        const routeConfig = this.getRouteImportConfig(module);

        if (routeConfig === undefined) {
            this.logger.error(
                `Unable to find a route class for the file: ${filePath}. Did you include "@Route()"?`
            );
            return new RouteHandler(
                undefined,
                {
                    events: {},
                    target: undefined,
                },
                this.logger
            );
        }

        const routeInstance = new routeConfig.target;
        // const routeInstance = this.createRouteInstance(routeConfig.target);

        return new RouteHandler(routeInstance, routeConfig, this.logger);
    }

    // private createRouteInstance(target: any) {
    //     return new target();
    // }

    private getClassNamesFromNamespace(namespace: any): string[] {
        const classNames: string[] = [];
        Object.keys(namespace).forEach((key) => {
            if (typeof namespace[key].prototype === 'object') {
                classNames.push(key);
            }
        });
        return classNames;
    }

    private getRouteImportConfig(requiredModule: any) {
        const classes = this.getClassNamesFromNamespace(requiredModule);

        let routeConfig: RouteImportConfig;

        for (let i = 0; i < classes.length; i++) {
            routeConfig = RouteConfigInjector.getInstance().getCached(
                classes[i]
            );
            if (routeConfig !== undefined) {
                break;
            }
        }

        return routeConfig;
    }
}
