import getCallerPath = require('get-caller-file');
import * as path from 'path';
import { GrafeLogger } from '../logger/logger';
import { MiddlewareConfigStore } from './middlewareConfigStore';
import { MiddlewareHandler } from './middlewareHandler';
import { MiddlewareImportConfig } from './middlewareImportConfig';
import { Importer } from '../importer/importer';

export class MiddlewareImporter extends Importer {
    public constructor(logger: GrafeLogger) {
        super(logger);
    }

    public import(filePath: string): MiddlewareHandler {
        const routeConfigInjector = MiddlewareConfigStore.getInstance();
        routeConfigInjector.reset();

        const module = this.importModule(filePath);

        const middlewareConfig = this.getMiddlewareImportConfig(module);

        if (middlewareConfig === undefined) {
            this.logger.error(
                `Unable to find a middleware class for the file: ${filePath}. Did you include "@Middleware()"?`
            );
            return new MiddlewareHandler(
                undefined,
                {
                    events: {},
                    target: undefined,
                    description: '',
                    shortCut: ''
                },
                this.logger
            );
        }

        const middlewareInstance = new middlewareConfig.target;

        return new MiddlewareHandler(middlewareInstance, middlewareConfig, this.logger);
    }

    private getClassNamesFromNamespace(namespace: any): string[] {
        const classNames: string[] = [];
        Object.keys(namespace).forEach((key) => {
            if (typeof namespace[key].prototype === 'object') {
                classNames.push(key);
            }
        });
        return classNames;
    }

    private getMiddlewareImportConfig(requiredModule: any) {
        const classes = this.getClassNamesFromNamespace(requiredModule);

        let routeConfig: MiddlewareImportConfig;

        for (let i = 0; i < classes.length; i++) {
            routeConfig = MiddlewareConfigStore.getInstance().getCached(
                classes[i]
            );
            if (routeConfig !== undefined) {
                break;
            }
        }

        return routeConfig;
    }
}
