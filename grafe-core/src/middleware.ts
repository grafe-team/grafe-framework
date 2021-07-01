import { Request, Response, NextFunction } from "express";


export interface GrafeMiddleware {

    run(request: Request, response: Response, next: NextFunction): void

}
