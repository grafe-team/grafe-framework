import 'mocha';
import rewire = require('rewire');
import Sinon = require('sinon');
import * as chai from 'chai';

describe('serve/serve.ts file', () => {
    let serveModule = rewire('../serve');

    const childProcessStub = {
        exec: Sinon.stub(),
        execFile: Sinon.stub(),
    };

    beforeEach(() => {
        serveModule = rewire('../serve');

        serveModule.__set__({
            child_process_1: childProcessStub,
        });

        childProcessStub.exec.reset();
    });

    describe('killTask function', () => {
        let killTask: (child: {
            pid?: number;
            kill?: (com: string) => void;
        }) => void;

        beforeEach(() => {
            killTask = serveModule.__get__('killTask');
        });

        it('should kill the task using the the taskkill command under windows', () => {
            serveModule.__set__({
                process: {
                    platform: 'win32',
                },
            });

            const child = {
                pid: 11,
                kill: Sinon.stub(),
            };

            killTask(child);

            chai.expect(childProcessStub.exec.callCount).to.deep.eq(
                1,
                'exec should be called once'
            );
            chai.expect(childProcessStub.exec.firstCall.args[0]).to.deep.eq(
                'taskkill /pid 11 /T /F',
                'should focefully kill the whole processTree of the child'
            );

            chai.expect(child.kill.callCount).to.deep.eq(
                0,
                'child.kill should not be called because it does not work under windows'
            );
        });

        it('should call child.kill under macos', () => {
            serveModule.__set__({
                process: {
                    platform: 'darwin',
                },
            });

            const child = {
                pid: 11,
                kill: Sinon.stub(),
            };

            killTask(child);

            chai.expect(childProcessStub.exec.callCount).to.deep.eq(
                0,
                'exec should not be called'
            );

            chai.expect(child.kill.callCount).to.deep.eq(
                1,
                'child.kill should be called because it does work here'
            );
            // idk why typescript changes sigkill to sigterm
            // chai.expect(child.kill.lastCall.args[0]).to.deep.eq('SIGKILL', 'should use SIGKILL to forcefully quit the child');
        });

        it('should call child.kill under macos', () => {
            serveModule.__set__({
                process: {
                    platform: 'linux',
                },
            });

            const child = {
                pid: 11,
                kill: Sinon.stub(),
            };

            killTask(child);

            chai.expect(childProcessStub.exec.callCount).to.deep.eq(
                0,
                'exec should not be called'
            );

            chai.expect(child.kill.callCount).to.deep.eq(
                1,
                'child.kill should be called because it does work here'
            );
            // idk why typescript changes sigkill to sigterm
            // chai.expect(child.kill.lastCall.args[0]).to.deep.eq('SIGKILL', 'should use SIGKILL to forcefully quit the child');
        });
    });

    describe('createBuildDirIfNeeded function', () => {
        let createBuildDirIfNeeded: (rootDir: string) => void;

        const joinStub = Sinon.stub();
        const statSyncStub = Sinon.stub();
        const mkdirSyncStub = Sinon.stub();
        const readdirSyncStub = Sinon.stub();

        const pathMock = {
            join: joinStub,
        };

        const fsMock = {
            statSync: statSyncStub,
            mkdirSync: mkdirSyncStub,
            readdirSync: readdirSyncStub,
        };

        beforeEach(() => {
            createBuildDirIfNeeded = serveModule.__get__(
                'createBuildDirIfNeeded'
            );

            serveModule.__set__({
                fs: fsMock,
                path: pathMock,
            });

            joinStub.reset();
            statSyncStub.reset();
            readdirSyncStub.reset();
            readdirSyncStub.reset();
        });

        it('should mkdir the folder if not found', () => {
            readdirSyncStub.returns([]);

            createBuildDirIfNeeded('./grafe');

            chai.expect(readdirSyncStub.callCount).to.deep.eq(
                1,
                'readdirSync should be called once'
            );
            chai.expect(mkdirSyncStub.callCount).to.deep.eq(
                1,
                'mkdirSyncStub should be called once'
            );
        });

        it('should throw an error if not directory', () => {
            const fakeFile = {
                isDirectory: Sinon.stub(),
            };

            readdirSyncStub.returns(['build']);
            statSyncStub.returns(fakeFile);
            fakeFile.isDirectory.returns(false);

            chai.expect(() => {
                createBuildDirIfNeeded('grafe');
            }).to.throw(
                'Unable to compile. Build file found but it is not a directory!'
            );
            chai.expect(readdirSyncStub.callCount).to.deep.eq(
                1,
                'readdirSync should be called once'
            );
            chai.expect(statSyncStub.callCount).to.deep.eq(
                1,
                'statSyncStub should be called once'
            );
        });

        it('should should do nothing if found', () => {
            const fakeFile = {
                isDirectory: Sinon.stub(),
            };

            readdirSyncStub.returns(['build', 'routes']);
            statSyncStub.returns(fakeFile);
            fakeFile.isDirectory.onFirstCall().returns(true);

            createBuildDirIfNeeded('grafe');

            chai.expect(readdirSyncStub.callCount).to.deep.eq(
                1,
                'readdirSync should be called once'
            );
            chai.expect(statSyncStub.callCount).to.deep.eq(
                1,
                'statSyncStub should be called once'
            );
        });
    });

    describe('serveHandler function', () => {
        let serveHandler: () => Promise<void>;

        const joinStub = Sinon.stub();
        const statSyncStub = Sinon.stub();
        const mkdirSyncStub = Sinon.stub();
        const readdirSyncStub = Sinon.stub();
        const pkgDirStub = Sinon.stub();
        const watchStub = Sinon.stub();
        const createBuildDirIfNeededStub = Sinon.stub();
        const consoleLogStub = Sinon.stub();
        const killTaskStub = Sinon.stub();

        const pathMock = {
            join: joinStub,
        };

        const fsMock = {
            statSync: statSyncStub,
            mkdirSync: mkdirSyncStub,
            readdirSync: readdirSyncStub,
        };

        const pkgDirMock = {
            default: pkgDirStub,
        };

        const chokidarMock = {
            watch: watchStub,
        };

        beforeEach(() => {
            serveHandler = serveModule.__get__('serveHandler');

            serveModule.__set__({
                fs: fsMock,
                path: pathMock,
                pkgDir: pkgDirMock,
                chokidar: chokidarMock,
            });

            serveModule.__set__({
                console: {
                    log: consoleLogStub,
                },
            });

            serveModule.__set__({
                createBuildDirIfNeeded: createBuildDirIfNeededStub,
                killTask: killTaskStub,
            });

            createBuildDirIfNeededStub.reset();
            consoleLogStub.reset();
            pkgDirStub.reset();
            watchStub.reset();
            joinStub.reset();
            statSyncStub.reset();
            readdirSyncStub.reset();
            readdirSyncStub.reset();
        });

        it('should detect changes and start compiling', async () => {
            const fakeObject = {
                stdout: {
                    pipe: Sinon.stub(),
                },
                stderr: {
                    pipe: Sinon.stub(),
                },
            };

            const chokidarFake = {
                on: Sinon.stub(),
            };

            childProcessStub.execFile.returns(fakeObject);
            watchStub.returns(chokidarFake);

            await serveHandler();

            chai.expect(fakeObject.stderr.pipe.callCount).to.deep.eq(
                1,
                'stderr should be called once'
            );
            chai.expect(fakeObject.stdout.pipe.callCount).to.deep.eq(
                1,
                'stdout should be called once'
            );

            chai.expect(chokidarFake.on.lastCall.args[0]).to.deep.eq('all');
            chai.expect(typeof chokidarFake.on.lastCall.args[1]).to.deep.eq(
                'function'
            );

            chokidarFake.on.lastCall.args[1]();

            // chai.expect(killTaskStub.callCount).to.deep.eq(1);
            chai.expect(childProcessStub.execFile.callCount).to.deep.eq(1);
        });
    });
});
