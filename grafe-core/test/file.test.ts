import 'mocha';
import { FileInfo } from '../src/file';
import rewire = require("rewire");
import Sinon = require('sinon');
import * as chai from 'chai';

describe('file.ts file', () => {

    let file = rewire('../src/file');

    beforeEach(() => {
        file = rewire('../src/file');
    });

    describe('readAllFilesStats function', () => {

        let readAllFilesStats: (dirPath: string) => FileInfo[];

        const statSyncStub = Sinon.stub();
        const readdirSyncStub = Sinon.stub();
        const isFileStub = Sinon.stub();
        const isDirectoryStub = Sinon.stub();

        const joinStub = Sinon.stub();

        const fsMock = {
            statSync: statSyncStub,
            readdirSync: readdirSyncStub
        };

        const pathMock = {
            join: joinStub
        };

        beforeEach(() => {
            readAllFilesStats = file.__get__('readAllFilesStats');

            file.__set__({
                fs: fsMock,
                path: pathMock
            });

            statSyncStub.reset();
            readdirSyncStub.reset();
            isFileStub.reset();
            isDirectoryStub.reset();
        });


        it ('should throw an error becaus path is not a directory', () => {
            statSyncStub.returns({
                isDirectory: isDirectoryStub
            });

            isDirectoryStub.returns(false);

            const testPath = "testPath";

            chai.expect(() => {readAllFilesStats(testPath)}).to.throw(/testPath/);
        });

        it ('should return read all the stats in the directory and return them', () => {
            statSyncStub.onFirstCall().returns({
                isDirectory: isDirectoryStub
            });

            readdirSyncStub.onFirstCall().returns(['one', 'two']);

            isDirectoryStub.onFirstCall().returns(true);
            isDirectoryStub.onSecondCall().returns(false);
            isDirectoryStub.onThirdCall().returns(true);

            isFileStub.onFirstCall().returns(true);
            isFileStub.onSecondCall().returns(false);

            joinStub.withArgs('root', 'one').returns('/root/one');
            joinStub.withArgs('root', 'two').returns('/root/two');

            statSyncStub.withArgs('/root/one').returns({
                isDirectory: isDirectoryStub,
                isFile: isFileStub
            });

            statSyncStub.withArgs('/root/two').returns({
                isDirectory: isDirectoryStub,
                isFile: isFileStub
            });

            const testPath = 'root';

            let result: FileInfo[];

            const expectedResult = [
                { path: '/root/one', isDirectory: false, isFile: true, name: 'one' },
                { path: '/root/two', isDirectory: true, isFile: false, name: 'two' }
            ];

            chai.expect(() => {result = readAllFilesStats(testPath)}).to.not.throw();
            chai.expect(statSyncStub.callCount).to.deep.eq(3);
            chai.expect(isDirectoryStub.callCount).to.deep.eq(3);
            chai.expect(isFileStub.callCount).to.deep.eq(2);
            chai.expect(joinStub.callCount).to.deep.eq(2);
            chai.expect(result).to.deep.eq(expectedResult);
        });


    });

});
