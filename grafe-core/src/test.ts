import { Middleware } from './middleware/decorators/middleware';
import { on } from './components/decorators/on';

@Middleware()
export class HelloMiddleware {
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
