import 'mocha';
import rewire = require('rewire');
import Sinon = require('sinon');
import messages from '../generate.messages';
import * as path from 'path';
import * as chai from 'chai';

describe('middleware.generate.ts file', () => {
    let middleware = rewire('../middleware.generate');
    const grafeConfig = {
        middlewares: [
            {
                name: 'protected',
                description: 'just for tests',
                value: 'pt',
            },
        ],
    };

    beforeEach(() => {
        middleware = rewire('../middleware.generate');
    });

    describe('generateMiddleWare function', () => {
        const consoleErrorStub = Sinon.stub();
        const consoleLogStub = Sinon.stub();
        const readFileSyncStub = Sinon.stub();
        const copyFileSyncStub = Sinon.stub();
        const writeFileSyncStub = Sinon.stub();
        const promptStub = Sinon.stub();
        const mkdirpStub = Sinon.stub();
        const pkgDirStub = Sinon.stub();

        let generateMiddleWare: (
            name: string,
            short: string,
            description: string,
            confirmation: boolean
        ) => Promise<void> = middleware.__get__('generateMiddleWare');

        const fsMock = {
            readFileSync: readFileSyncStub,
            copyFileSync: copyFileSyncStub,
            writeFileSync: writeFileSyncStub,
        };

        const inquirerMock = {
            prompt: promptStub,
        };

        const mkdirpMock = {
            default: mkdirpStub,
        };

        const pkgDirMock = {
            default: pkgDirStub,
        };

        beforeEach(() => {
            consoleErrorStub.reset();

            consoleLogStub.reset();

            middleware.__set__({
                console: {
                    error: consoleErrorStub,
                    log: consoleLogStub,
                },
            });

            middleware.__set__({
                fs: fsMock,
                inquirer: inquirerMock,
                mkdirp: mkdirpMock,
                pkgDir: pkgDirMock,
            });

            generateMiddleWare = middleware.__get__('generateMiddleWare');

            readFileSyncStub.reset();
            copyFileSyncStub.reset();
            writeFileSyncStub.reset();
            promptStub.reset();
            mkdirpStub.reset();
            pkgDirStub.reset();
        });

        it('should log an error when not in a grafe project', async () => {
            readFileSyncStub.throws({ code: 'ENOENT' });
            pkgDirStub.resolves(path.join('grafe', 'project_1'));

            await generateMiddleWare('TEST', 'T', 'Empty description', false);

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'console.error should be called once'
            );
            chai.expect(
                consoleErrorStub.calledOnceWith(messages.not_grafe)
            ).to.be.eq(
                true,
                'console.error should be called with not_grafe message'
            );
        });

        it('should stop the process when not confirming', async () => {
            readFileSyncStub.returns(JSON.stringify(grafeConfig));
            promptStub.resolves({ confirm: false });
            pkgDirStub.resolves(path.join('grafe', 'project_1'));

            await generateMiddleWare('TEST', 'T', 'Empty description', false);

            chai.expect(consoleLogStub.callCount).to.deep.eq(
                0,
                'console.log should not be called'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called'
            );
        });

        it('should log an error when the middleware name is in use', async () => {
            readFileSyncStub.returns(JSON.stringify(grafeConfig));
            pkgDirStub.resolves(path.join('grafe', 'project_1'));

            await generateMiddleWare(
                'protected',
                'T',
                'Empty description',
                true
            );

            chai.expect(consoleLogStub.callCount).to.deep.eq(
                0,
                'console.log should not be called'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'console.error should be called once'
            );
            chai.expect(promptStub.callCount).to.deep.eq(
                0,
                'user should not be prompted once'
            );
            chai.expect(
                consoleErrorStub.calledOnceWith(
                    messages.generateMiddleware.middleware_in_use
                )
            ).to.be.eq(
                true,
                'console.error should be called with middleware_in_use message'
            );
        });

        it('should log an error when grafe.json is incorrect', async () => {
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.returns(JSON.stringify({ tests: true }));

            await generateMiddleWare(
                'protected',
                'T',
                'Empty description',
                true
            );

            chai.expect(promptStub.callCount).to.deep.eq(
                0,
                'prompt should be called once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'console.error should be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                0,
                'console.log should not be called once'
            );
            chai.expect(
                consoleErrorStub.calledOnceWith(messages.wrong_config)
            ).to.be.eq(
                true,
                'console.error should be called with wrong_config message'
            );
        });

        it('should log an error when the middleware shortcut is in use', async () => {
            readFileSyncStub.returns(JSON.stringify(grafeConfig));
            promptStub.resolves({ confirm: true });
            pkgDirStub.resolves(path.join('grafe', 'project_1'));

            await generateMiddleWare('Test', 'pt', 'Empty description', false);

            chai.expect(consoleLogStub.callCount).to.deep.eq(
                0,
                'console.log should not be called'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'console.error should be called once'
            );
            chai.expect(
                consoleErrorStub.calledOnceWith(
                    messages.generateMiddleware.shortcut_in_use
                )
            ).to.be.eq(
                true,
                'console.error should be called with shortcut_in_use message'
            );
        });

        it('should log an error when the middleware shortcut is in use', async () => {
            const expectedGrafeConfig = {
                middlewares: [
                    {
                        name: 'protected',
                        description: 'just for tests',
                        value: 'pt',
                    },
                    {
                        name: 'Test',
                        value: 't',
                        description: 'Empty description',
                    },
                ],
            };

            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.returns(JSON.stringify(grafeConfig));
            promptStub.resolves({ confirm: true });

            await generateMiddleWare('Test', 't', 'Empty description', false);

            chai.expect(consoleLogStub.callCount).to.deep.eq(
                1,
                'console.log should not be called'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should be called once'
            );
            chai.expect(copyFileSyncStub.lastCall.args[1]).to.deep.eq(
                path.join(
                    'grafe',
                    'project_1',
                    'src',
                    'middlewares',
                    't',
                    'Test.ts'
                ),
                'template copy Path should be given destination'
            );
            chai.expect(writeFileSyncStub.lastCall.args[0]).to.deep.eq(
                path.join('grafe', 'project_1', 'grafe.json'),
                'should be grafe.json of given root-dir'
            );
            chai.expect(writeFileSyncStub.lastCall.args[1]).to.deep.eq(
                JSON.stringify(expectedGrafeConfig, null, 4),
                'should be default grafe.json incl. the new one'
            );
        });
    });

    describe('generateMiddleWareHandler function', () => {
        const consoleErrorStub = Sinon.stub();
        const promptStub = Sinon.stub();
        const generateMiddleWareStub = Sinon.stub();
        const existsSyncStub = Sinon.stub();

        let generateMiddleWareHandler: (
            argv: Record<string, unknown>
        ) => Promise<void> = middleware.__get__('generateMiddleWareHandler');

        const inquirerMock = {
            prompt: promptStub,
        };

        const fsMock = {
            existsSync: existsSyncStub,
        };

        beforeEach(() => {
            middleware.__set__({
                generateMiddleWare: generateMiddleWareStub,
            });

            middleware.__set__({
                inquirer: inquirerMock,
                fs: fsMock,
            });

            middleware.__set__({
                console: {
                    error: consoleErrorStub,
                },
            });

            generateMiddleWareHandler = middleware.__get__(
                'generateMiddleWareHandler'
            );

            promptStub.reset();
            generateMiddleWareStub.reset();
            existsSyncStub.reset();
            consoleErrorStub.reset();
        });

        it('should not prompt any questions and start generateMiddleWare function', async () => {
            existsSyncStub.returns(true);

            await generateMiddleWareHandler({
                name: 'Test',
                short: 'T',
                description: 'Empty',
            });

            chai.expect(promptStub.callCount).to.deep.eq(
                0,
                'should not prompt once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'should not log an error'
            );
            chai.expect(generateMiddleWareStub.lastCall.args[0]).to.deep.eq(
                'Test',
                'should be Test'
            );
            chai.expect(generateMiddleWareStub.lastCall.args[1]).to.deep.eq(
                'T',
                'should be T'
            );
            chai.expect(generateMiddleWareStub.lastCall.args[2]).to.deep.eq(
                'Empty',
                'should be Empty'
            );
        });

        it('should prompt 3 questions and start generateMiddleWare function', async () => {
            existsSyncStub.returns(true);

            promptStub.resolves({
                name: 'Test',
                short: 'T',
                description: 'Empty',
            });

            await generateMiddleWareHandler({});

            chai.expect(promptStub.callCount).to.deep.eq(
                1,
                'should not prompt once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'should not log an error'
            );
            chai.expect(generateMiddleWareStub.lastCall.args[0]).to.deep.eq(
                'Test',
                'should be Test'
            );
            chai.expect(generateMiddleWareStub.lastCall.args[1]).to.deep.eq(
                'T',
                'should be T'
            );
            chai.expect(generateMiddleWareStub.lastCall.args[2]).to.deep.eq(
                'Empty',
                'should be Empty'
            );
        });

        it('should log an error and abort if not in garfe project', async () => {
            existsSyncStub.returns(false);

            await generateMiddleWareHandler({});

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'should not log an error'
            );
            chai.expect(promptStub.callCount).to.deep.eq(
                0,
                'should not prompt once'
            );
            chai.expect(
                consoleErrorStub.calledOnceWith(messages.not_grafe)
            ).to.be.eq(
                true,
                'console.error should be called with not_grafe message'
            );
        });
    });
});
