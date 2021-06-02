import { NextFunction, Request, Response } from 'express';

export = (req: Request, res: Response, next: NextFunction) => {
    console.log('This route was routed through the protected middleware');

    next();
}
    