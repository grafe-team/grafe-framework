import 'mocha';
import rewire = require('rewire');
import Sinon = require('sinon');
import * as path from 'path';
import * as chai from 'chai';

describe('serve/serve.ts file', () => {

    let serveModule = rewire('../serve');

    beforeEach(() => {
        serveModule = rewire('../serve');
    });

    describe('compileCodeUsingNodeModules function', () => {

        let compileCodeUsingNodeModules: (rootDir: string) => Promise<number>;

        const shellStub = {
            exec: Sinon.stub(),
        };

        beforeEach(() => {
            compileCodeUsingNodeModules = serveModule.__get__('compileCodeUsingNodeModules');
        
            serveModule.__set__({
                shelljs_1: shellStub
            });

            shellStub.exec.reset();
        });

        it ('should compile the files using npm run build', async() => {

            shellStub.exec.returns({code: 0});

            chai.expect(await compileCodeUsingNodeModules('/test')).to.deep.eq(0, 'Should resolve to the resulting code')
            chai.expect(shellStub.exec.lastCall.args[0]).to.deep.eq('npm run build');
            chai.expect(shellStub.exec.lastCall.args[1]).to.deep.eq({cwd: '/test'});
        });

    });

});

