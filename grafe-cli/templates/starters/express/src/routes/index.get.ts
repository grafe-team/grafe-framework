import { Request, Response } from 'express';

export = async (req: Request, res: Response) => {
    console.log('This is the index.get.ts route');
    

    res.send({});
};