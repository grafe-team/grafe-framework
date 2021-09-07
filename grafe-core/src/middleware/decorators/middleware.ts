import { MiddlewareConfigStore } from '../middlewareConfigStore';

export function Middleware(): any {
    return function (target: any, name: any, descriptor: any) {
        // this is the decorator
        // do something with 'target' and 'value'...
        MiddlewareConfigStore.getInstance().addTarget(target);
        MiddlewareConfigStore.getInstance().cacheWithName(target.name);
        MiddlewareConfigStore.getInstance().reset();
    };
}
