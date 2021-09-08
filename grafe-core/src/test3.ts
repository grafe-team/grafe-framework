import { on } from './components/decorators/on';
import { Middleware } from './middleware/decorators/middleware';
import { Route } from './route/decorators/route';


@Middleware()
export class HelloMiddleware2 {
    @on('request')
    called(testString: string): void {
        console.log('Middleware' + testString);
        throw new Error('This is an error in the middleware');
        
    }

    @on('error')
    error(error: Error) {
        console.log(error.message);
    }
}


@Route()
export class HelloRoute2 {
    @on('post')
    async called(testString: string) {
        console.log('test 2: ' + testString);

        throw new Error('This is a error');
    }

    @on('error')
    error(error: Error) {
        console.log(error.message);
    }
}
