import { NextFunction, Request, Response } from 'express';

export = (req: Request, res: Response, next: NextFunction) => {
    
    next();
}
