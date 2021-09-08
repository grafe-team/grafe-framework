import { on } from './components/decorators/on';
import { Route } from './route/decorators/route';

@Route()
export class HelloRoute {
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
