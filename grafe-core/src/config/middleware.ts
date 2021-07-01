import { GrafeMiddleware } from "../middleware";

export class Middleware {

    public middleware: GrafeMiddleware;

    public isUsable: boolean;

    constructor(public name: string, public description: string, public value: string) {
        this.isUsable = this.checkMiddleware();
    }

    private checkMiddleware(): boolean {
        if (this.name === null || this.name === undefined) {
            
        }
        

    }

    private checkIfLinkExists(): boolean {
        throw new Error('This method is not jet implemented');
    }

    private loadMiddleware(): boolean {
        throw new Error('This method is not jet implemented');
    }

}
