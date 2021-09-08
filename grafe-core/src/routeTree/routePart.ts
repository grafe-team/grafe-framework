import { RouteHandler } from '../route/routeHandler';

export class RoutePart {
    private route?: RouteHandler;

    private children: Record<string, RoutePart> = {};

    public constructor(
        parent: RoutePart,
        pathPart: string,
        route?: RouteHandler
    ) {
        if (parent !== null || parent !== undefined) {
            parent.registerChild(this, '/' + pathPart);
        }

        this.route = route;
    }

    public isRoute(): boolean {
        return this.route !== undefined && this.route !== null;
    }

    public isPart(): boolean {
        return !this.isRoute();
    }

    public getChild(path: string): RoutePart | undefined {
        return this.children[path];
    }

    public getAllChildrenPaths(): string[] {
        return Object.keys(this.children);
    }

    public registerChild(child: RoutePart, pathPart: string): void {
        throw new Error('This method is not implemented yet!');
    }

}
