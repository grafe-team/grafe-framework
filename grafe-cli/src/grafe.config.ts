export interface StaticComponent {
    folder: string;
    prefix: string;
}

export interface MiddlewareComponent {
    name: string;
    value: string;
    description: string;
}

export interface GrafeConfig {
    tests: boolean;
    statics: StaticComponent[];
    projectType: string;
    routePath: string;
    middlewarePath: string;
    middlewares: MiddlewareComponent[];
}
