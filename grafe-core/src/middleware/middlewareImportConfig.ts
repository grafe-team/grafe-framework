import { MiddlewareEvents } from "./middlewareEvents";

export interface MiddlewareImportConfig {
    description: string;
    shortCut: string;
    events: Record<string, string>;
    target: any;
};

