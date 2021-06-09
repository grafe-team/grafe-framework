import 'mocha';
import rewire = require('rewire');
import Sinon = require('sinon');
import messages from '../start.messages';
import * as chai from 'chai';

describe('start.ts file', () => {

    let startModule = rewire('../start');

    beforeEach(() => {
        startModule = rewire('../start');
    });

    describe('installPackages function', () => {

        let installPackages: (projectFolder: string) => string;

        const shellStub = {
            cd: Sinon.stub(),
            exec: Sinon.stub(),
        };

        const fsStub = {
            existsSync: Sinon.stub(),
        }

        const pathStub = {
            join: Sinon.stub(),
        };

        beforeEach(() => {

            installPackages = startModule.__get__('installPackages');

            startModule.__set__({
                shell: shellStub,
                fs: fsStub,
                path: pathStub,
            });

            shellStub.cd.reset();
            shellStub.exec.reset();
            fsStub.existsSync.reset();
            pathStub.join.reset();
        });

        it ('should not install packages because there is no package.json', () => {
            fsStub.existsSync.returns(false);
            pathStub.join.withArgs('test', 'package.json').returns('test/package.json');

            chai.expect(installPackages('test')).to.deep.eq(messages.no_package, 'installPackages should return the right message');
            chai.expect(fsStub.existsSync.lastCall.args[0]).to.deep.eq('test/package.json', 'fs.exsistSync should be called with the right arguments');
        });

        it ('should install the packages', () => {
            fsStub.existsSync.returns(true);
            shellStub.exec.returns(0);

            chai.expect(installPackages('test')).to.deep.eq('', 'Should return nothing because everything should be right');
            chai.expect(shellStub.cd.lastCall.args[0]).to.deep.eq('test');
        });
    });

});
