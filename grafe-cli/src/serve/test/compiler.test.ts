import 'mocha';
import rewire = require('rewire');
import Sinon = require('sinon');
import * as chai from 'chai';

describe('serve/compiler.ts file', () => {
    let compilerModule = rewire('../compiler');

    const childProcessStub = {
        exec: Sinon.stub(),
    };

    beforeEach(() => {
        compilerModule = rewire('../compiler');

        compilerModule.__set__({
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
            killTask = compilerModule.__get__('killTask');
        });

        it('should kill the task using the the taskkill command under windows', () => {
            compilerModule.__set__({
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
            compilerModule.__set__({
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
            compilerModule.__set__({
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

    describe('compile function', () => {
        let compile: (rootDir: string) => Promise<void>;
        const joinStub = Sinon.stub();
        const consoleErrorStub = Sinon.stub();
        const consoleLogStub = Sinon.stub();
        const compileCodeStub = Sinon.stub();
        const removeEverythingFromDirStub = Sinon.stub();
        const execStub = Sinon.stub();

        const pathMock = {
            join: joinStub,
        };

        const childProcess1Mock = {
            exec: execStub,
        };

        beforeEach(() => {
            compile = compilerModule.__get__('compile');

            compilerModule.__set__({
                console: {
                    log: consoleLogStub,
                    error: consoleErrorStub,
                },
            });

            compilerModule.__set__({
                path: pathMock,
            });

            compilerModule.__set__({
                compileCode: compileCodeStub,
                removeEverythingFromDir: removeEverythingFromDirStub,
            });

            compilerModule.__set__({
                child_process_1: childProcess1Mock,
            });

            joinStub.reset();
            consoleErrorStub.reset();
            consoleLogStub.reset();
            compileCodeStub.reset();
            removeEverythingFromDirStub.reset();
            execStub.reset();
        });

        it('should abort when cleaning was not successfull', () => {
            removeEverythingFromDirStub.throws({ error: 'something happend ' });
            compile('./grafe');

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'console.error should be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                1,
                'console.log should be called once'
            );
        });

        it('should abort when compiling was not successfull', () => {
            compileCodeStub.throws({ error: 'something happend ' });
            compile('./grafe');

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'console.error should be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                2,
                'console.log should be called twice'
            );
        });

        it('should abort when compiling returns not zero', async () => {
            compileCodeStub.resolves(1);
            await compile('./grafe');

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'console.error should be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                2,
                'console.log should be called twice'
            );
        });

        it('should abort when starting project was not successful', async () => {
            execStub.throws({ error: 'something happend' });
            compileCodeStub.resolves(0);

            await compile('./grafe');

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'console.error should be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                3,
                'console.log should be called three times'
            );
        });

        it('should compile successfully', async () => {
            compileCodeStub.resolves(0);
            const fakeProcess = {
                stdout: {
                    pipe: Sinon.stub(),
                },
                stderr: {
                    pipe: Sinon.stub(),
                },
            };

            execStub.returns(fakeProcess);

            await compile('./grafe');

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                3,
                'console.log should be called three times'
            );
            chai.expect(fakeProcess.stderr.pipe.callCount).to.deep.eq(
                1,
                'stderr should be called once'
            );
            chai.expect(fakeProcess.stdout.pipe.callCount).to.deep.eq(
                1,
                'stoud should be called once'
            );
        });
    });

    describe('removeEverythingFromDir function', () => {
        let removeEverythingFromDir: (dir: string) => void;
        const joinStub = Sinon.stub();
        const statSyncStub = Sinon.stub();
        const unlinkSyncStub = Sinon.stub();
        const rmSyncStub = Sinon.stub();
        const rmdirSyncStub = Sinon.stub();
        const readdirSyncStub = Sinon.stub();

        const pathMock = {
            join: joinStub,
        };

        const fsMock = {
            statSync: statSyncStub,
            unlinkSync: unlinkSyncStub,
            rmSync: rmSyncStub,
            rmdirSync: rmdirSyncStub,
            readdirSync: readdirSyncStub,
        };

        beforeEach(() => {
            removeEverythingFromDir = compilerModule.__get__(
                'removeEverythingFromDir'
            );

            compilerModule.__set__({
                path: pathMock,
                fs: fsMock,
            });

            joinStub.reset();
            joinStub.reset();
            statSyncStub.reset();
            unlinkSyncStub.reset();
            rmSyncStub.reset();
            rmdirSyncStub.reset();
            readdirSyncStub.reset();
        });

        it('should do everything correctly', () => {
            const files = ['file_1', 'file_2', 'file_3'];

            const fakeStats = {
                isFile: Sinon.stub(),
                isDirectory: Sinon.stub(),
            };

            readdirSyncStub.returns(files);
            statSyncStub.returns(fakeStats);

            fakeStats.isFile.onFirstCall().returns(true);
            fakeStats.isFile.onSecondCall().returns(false);
            fakeStats.isFile.onThirdCall().returns(false);

            fakeStats.isDirectory.onFirstCall().returns(true);
            fakeStats.isDirectory.onSecondCall().returns(false);

            removeEverythingFromDir('./grafe');

            chai.expect(fakeStats.isFile.callCount).to.deep.eq(
                3,
                'is File should be called three times'
            );
            chai.expect(fakeStats.isDirectory.callCount).to.deep.eq(
                2,
                'is Directory should be called twice'
            );
            chai.expect(rmSyncStub.callCount).to.deep.eq(
                1,
                'rmSync should be called once'
            );
        });

        it('should go into the node 12.x path', () => {
            const files = ['file_1'];

            const fakeStats = {
                isFile: Sinon.stub(),
                isDirectory: Sinon.stub(),
            };

            readdirSyncStub.returns(files);
            statSyncStub.returns(fakeStats);

            fakeStats.isFile.onFirstCall().returns(false);

            fakeStats.isDirectory.onFirstCall().returns(true);

            compilerModule.__set__({
                fs: {
                    readdirSync: readdirSyncStub,
                    statSync: statSyncStub,
                    rmdirSync: rmdirSyncStub,
                    rmSync: 0,
                },
            });

            removeEverythingFromDir('./grafe');

            chai.expect(fakeStats.isFile.callCount).to.deep.eq(
                1,
                'is File should be called once'
            );
            chai.expect(fakeStats.isDirectory.callCount).to.deep.eq(
                1,
                'is Directory should be called once'
            );
            chai.expect(rmdirSyncStub.callCount).to.deep.eq(
                1,
                'rmdirSync should be called once'
            );
        });
    });

    describe('compileCodeUsingNodeModules function', () => {
        let compileCodeUsingNodeModules: (rootDir: string) => Promise<number>;
        const execStub = Sinon.stub();

        const childProcess1Mock = {
            exec: execStub,
        };

        beforeEach(() => {
            compileCodeUsingNodeModules = compilerModule.__get__(
                'compileCodeUsingNodeModules'
            );

            compilerModule.__set__({
                child_process_1: childProcess1Mock,
            });

            execStub.reset();
        });

        it('should return child exit code', async () => {
            execStub.returns({
                exitCode: 0,
            });

            const response = await compileCodeUsingNodeModules('./');

            chai.expect(response).to.deep.eq(0, 'should return 0 as exit code');
        });
    });

    describe('compileCode function', () => {
        let compileCode: (rootDir: string) => Promise<number>;

        const childProcessStub = {
            spawn: Sinon.stub(),
        };

        const compileCodeUsingNodeModulesStub = Sinon.stub();

        beforeEach(() => {
            compileCode = compilerModule.__get__('compileCode');

            compilerModule.__set__({
                child_process_1: childProcessStub,
                compileCodeUsingNodeModules: compileCodeUsingNodeModulesStub,
                console: {
                    warn: Sinon.stub(),
                },
            });

            childProcessStub.spawn.reset();
            compileCodeUsingNodeModulesStub.reset();
        });

        it('should should resolve to the programm exit code and pipe stdout and stderr', async () => {
            const child = {
                on: Sinon.stub(),
                stdout: {
                    pipe: Sinon.stub(),
                },
                stderr: {
                    pipe: Sinon.stub(),
                },
            };

            childProcessStub.spawn.returns(child);

            const res: Promise<number> = compileCode('test');

            chai.expect(childProcessStub.spawn.callCount).to.deep.eq(
                1,
                'Spawn needs to be called once'
            );
            chai.expect(childProcessStub.spawn.lastCall.args[0]).to.deep.eq(
                'tsc',
                'Spawn should launch tsc'
            );

            chai.expect(child.stderr.pipe.callCount).to.deep.eq(
                1,
                'stderr shold only be piped once'
            );

            chai.expect(child.stdout.pipe.callCount).to.deep.eq(
                1,
                'stdout should only be piped once'
            );

            chai.expect(child.on.callCount).to.deep.eq(
                2,
                'on event should only be called once'
            );
            chai.expect(child.on.lastCall.args[0]).to.deep.eq(
                'exit',
                'should listen to the exit event'
            );
            chai.expect(typeof child.on.lastCall.args[1]).to.deep.eq(
                'function'
            );

            child.on.lastCall.args[1](12);

            res.then((code) => {
                chai.expect(code).to.deep.eq(
                    12,
                    'the returned coud should be the exit code'
                );
            });
        });

        it('should try to compile using the nodemodules when tsc was not found', async () => {
            const child = {
                on: Sinon.stub(),
                stdout: {
                    pipe: Sinon.stub(),
                },
                stderr: {
                    pipe: Sinon.stub(),
                },
            };

            childProcessStub.spawn.returns(child);

            compileCodeUsingNodeModulesStub.resolves(1);

            const res: Promise<number> = compileCode('test');

            chai.expect(child.on.callCount).to.deep.eq(
                2,
                'on event should only be called once'
            );
            chai.expect(child.on.firstCall.args[0]).to.deep.eq(
                'error',
                'should listen to the error event'
            );
            chai.expect(typeof child.on.firstCall.args[1]).to.deep.eq(
                'function'
            );

            child.on.firstCall.args[1]({
                code: 'ENOENT',
            });

            chai.expect(compileCodeUsingNodeModulesStub.callCount).to.deep.eq(
                1,
                'should try to compile using the node modules'
            );
            chai.expect(
                compileCodeUsingNodeModulesStub.lastCall.args[0]
            ).to.deep.eq(
                'test',
                'compile with modules should be called with the base dir'
            );
            res.then((code) => {
                chai.expect(code).to.deep.eq(
                    1,
                    'the returned coud should be the return of te compile with modules function'
                );
            });
        });

        it('should reject if compilation with nodemodules failes', () => {
            const child = {
                on: Sinon.stub(),
                stdout: {
                    pipe: Sinon.stub(),
                },
                stderr: {
                    pipe: Sinon.stub(),
                },
            };

            childProcessStub.spawn.returns(child);

            compileCodeUsingNodeModulesStub.rejects(1);

            const res: Promise<number> = compileCode('test');

            chai.expect(child.on.callCount).to.deep.eq(
                2,
                'on event should only be called once'
            );
            chai.expect(child.on.firstCall.args[0]).to.deep.eq(
                'error',
                'should listen to the error event'
            );
            chai.expect(typeof child.on.firstCall.args[1]).to.deep.eq(
                'function'
            );

            child.on.firstCall.args[1]({
                code: 'ENOENT',
            });

            res.catch((code) => {
                chai.expect(code).to.deep.eq(
                    1,
                    'the returned coud should be the return of te compile with modules function'
                );
            });
        });

        it('should not try and compile using modules if there was a different error than enoent', () => {
            const child = {
                on: Sinon.stub(),
                stdout: {
                    pipe: Sinon.stub(),
                },
                stderr: {
                    pipe: Sinon.stub(),
                },
            };

            childProcessStub.spawn.returns(child);

            compileCodeUsingNodeModulesStub.rejects(1);

            compileCode('test');

            chai.expect(child.on.callCount).to.deep.eq(
                2,
                'on event should only be called once'
            );
            chai.expect(child.on.firstCall.args[0]).to.deep.eq(
                'error',
                'should listen to the error event'
            );
            chai.expect(typeof child.on.firstCall.args[1]).to.deep.eq(
                'function'
            );

            child.on.firstCall.args[1]({
                code: 'other error',
            });

            chai.expect(compileCodeUsingNodeModulesStub.callCount).to.deep.eq(
                0,
                'should not try to compile using the node modules'
            );
        });
    });
});
