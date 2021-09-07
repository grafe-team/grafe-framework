import { RouteConfigInjector } from '../routeConfigInjector';

export function Route(): any {
    return function (target: any, name: any, descriptor: any) {
        // this is the decorator
        // do something with 'target' and 'value'...
        RouteConfigInjector.getInstance().addTarget(target);
        RouteConfigInjector.getInstance().cacheWithName(target.name);
        RouteConfigInjector.getInstance().reset();
    };
}
