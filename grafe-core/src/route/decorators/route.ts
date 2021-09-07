import { RouteConfigStore } from '../routeConfigStore';

export function Route(): any {
    return function (target: any, name: any, descriptor: any) {
        // this is the decorator
        // do something with 'target' and 'value'...
        RouteConfigStore.getInstance().addTarget(target);
        RouteConfigStore.getInstance().cacheWithName(target.name);
        RouteConfigStore.getInstance().reset();
    };
}
