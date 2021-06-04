import 'mocha';
import rewire = require('rewire');
import Sinon = require('sinon');
import messages from '../generate.messages';
import * as path from 'path';
import * as chai from 'chai';

describe('static.generate.ts file', () => {
    let staticGenerate = rewire('../static.generate');
    const grafeConfig = {
        statics: [
            {
                folder: 'test',
                prefix: 't',
            },
        ],
    };

    beforeEach(() => {
        staticGenerate = rewire('../static.generate');
    });

    describe('generateStatic function', () => {
        const consoleErrorStub = Sinon.stub();
        const consoleLogStub = Sinon.stub();
        const existsSyncStub = Sinon.stub();
        const promptStub = Sinon.stub();
        const mkdirpStub = Sinon.stub();
        const pkgDirStub = Sinon.stub();
        const readFileSyncStub = Sinon.stub();
        const writeFileSyncStub = Sinon.stub();

        let generateStatic: (
            name: string,
            prefix: string,
            confirmation: boolean
        ) => Promise<void> = staticGenerate.__get__('generateStatic');

        const fsMock = {
            existsSync: existsSyncStub,
            readFileSync: readFileSyncStub,
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
            consoleLogStub.reset();
            consoleErrorStub.reset();

            staticGenerate.__set__({
                console: {
                    error: consoleErrorStub,
                    log: consoleLogStub,
                },
            });

            staticGenerate.__set__({
                fs: fsMock,
                inquirer: inquirerMock,
                mkdirp: mkdirpMock,
                pkgDir: pkgDirMock,
            });

            generateStatic = staticGenerate.__get__('generateStatic');

            promptStub.reset();
            mkdirpStub.reset();
            pkgDirStub.reset();
            existsSyncStub.reset();
            readFileSyncStub.reset();
            writeFileSyncStub.reset();
        });

        it('should abort when not confirming the prompt', async () => {
            promptStub.resolves({ confirm: false });
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.returns(JSON.stringify(grafeConfig));

            await generateStatic('test', 't', false);

            chai.expect(promptStub.callCount).to.deep.eq(
                1,
                'prompt should be called once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                0,
                'console.log should not be called once'
            );
        });

        it('should log an error when length is 0', async () => {
            promptStub.resolves({ confirm: true });
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.returns(JSON.stringify(grafeConfig));

            await generateStatic('', '', false);

            chai.expect(promptStub.callCount).to.deep.eq(
                1,
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
                consoleErrorStub.calledOnceWith(
                    messages.generateStatic.to_small
                )
            ).to.be.eq(
                true,
                'console.error should be called with to_small message'
            );
        });

        it('should log an error when colon is in name', async () => {
            promptStub.resolves({ confirm: true });
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.returns(JSON.stringify(grafeConfig));

            await generateStatic('test:', 't', false);

            chai.expect(promptStub.callCount).to.deep.eq(
                1,
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
                consoleErrorStub.calledOnceWith(
                    messages.generateStatic.no_colon
                )
            ).to.be.eq(
                true,
                'console.error should be called with no_colon message'
            );
        });

        it('should log an error when grafe.json is incorrect', async () => {
            promptStub.resolves({ confirm: true });
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.returns(JSON.stringify({ tests: true }));

            await generateStatic('test', 't', false);

            chai.expect(promptStub.callCount).to.deep.eq(
                1,
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

        it('should log an error when file already exists', async () => {
            promptStub.resolves({ confirm: true });
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            existsSyncStub.returns(true);
            readFileSyncStub.returns(JSON.stringify(grafeConfig));

            await generateStatic('test', 't', false);

            chai.expect(promptStub.callCount).to.deep.eq(
                1,
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
                consoleErrorStub.calledOnceWith(messages.generateStatic.exists)
            ).to.be.eq(
                true,
                'console.error should be called with exists message'
            );
        });

        it('should log an error when file already exists', async () => {
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            existsSyncStub.returns(false);
            readFileSyncStub.returns(JSON.stringify(grafeConfig));

            await generateStatic('test', 't', true);

            chai.expect(promptStub.callCount).to.deep.eq(
                0,
                'prompt should not be called'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                1,
                'console.log should be called once'
            );
            chai.expect(mkdirpStub.lastCall.args[0]).to.deep.eq(
                path.join('grafe', 'project_1', 'src', 'test'),
                'should be this exact path'
            );
        });

        it('should log an error not in a grafe project', async () => {
            promptStub.resolves({ confirm: true });
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.throws({ code: 'ENOENT' });

            await generateStatic('test', 't', false);

            chai.expect(promptStub.callCount).to.deep.eq(
                1,
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
                consoleErrorStub.calledOnceWith(messages.not_grafe)
            ).to.be.eq(
                true,
                'console.error should be called with not_grafe message'
            );
        });
    });

    describe('generateStaticHandler function', () => {
        const consoleErrorStub = Sinon.stub();
        const existsSyncStub = Sinon.stub();
        const promptStub = Sinon.stub();
        const mkdirpStub = Sinon.stub();
        const pkgDirStub = Sinon.stub();
        const generateStaticStub = Sinon.stub();

        let generateStaticHandler: (
            argv: Record<string, unknown>
        ) => Promise<void> = staticGenerate.__get__('generateStaticHandler');

        const fsMock = {
            existsSync: existsSyncStub,
        };

        const inquirerMock = {
            prompt: promptStub,
        };

        const pkgDirMock = {
            default: pkgDirStub,
        };

        beforeEach(() => {
            consoleErrorStub.reset();

            staticGenerate.__set__({
                generateStatic: generateStaticStub,
            });

            staticGenerate.__set__({
                console: {
                    error: consoleErrorStub,
                },
            });

            staticGenerate.__set__({
                fs: fsMock,
                inquirer: inquirerMock,
                pkgDir: pkgDirMock,
            });

            generateStaticHandler = staticGenerate.__get__(
                'generateStaticHandler'
            );

            promptStub.reset();
            mkdirpStub.reset();
            pkgDirStub.reset();
            existsSyncStub.reset();
        });

        it('should log an error when not in a grafe project', async () => {
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            existsSyncStub.returns(false);

            await generateStaticHandler({});

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

        it('should prompt the user when name not given', async () => {
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            existsSyncStub.returns(true);
            promptStub.onFirstCall().resolves({ name: 'Test' });
            promptStub.onSecondCall().resolves({ prefix: 't' });

            await generateStaticHandler({});

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(promptStub.callCount).to.deep.eq(
                2,
                'user should be prompted twice'
            );
            chai.expect(generateStaticStub.lastCall.args[0]).to.deep.eq(
                'Test',
                'should be the string of the prompt'
            );
            chai.expect(generateStaticStub.lastCall.args[1]).to.deep.eq(
                't',
                'should be the string of the prompt'
            );
        });

        it('should not prompt the user when name given', async () => {
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            existsSyncStub.returns(true);

            await generateStaticHandler({ name: 'Test', prefix: 't' });

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(promptStub.callCount).to.deep.eq(
                0,
                'user should not be prompted'
            );
            chai.expect(generateStaticStub.lastCall.args[0]).to.deep.eq(
                'Test',
                'should be the string of the prompt'
            );
            chai.expect(generateStaticStub.lastCall.args[1]).to.deep.eq(
                't',
                'should be the string of the prompt'
            );
        });

        it('should not prompt the prefix question', async () => {
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            existsSyncStub.returns(true);
            promptStub.onFirstCall().resolves({ prefix: 't' });

            await generateStaticHandler({ name: 'Test' });

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(promptStub.callCount).to.deep.eq(
                1,
                'user should be prompted once'
            );
            chai.expect(generateStaticStub.lastCall.args[0]).to.deep.eq(
                'Test',
                'should be the string of the prompt'
            );
            chai.expect(generateStaticStub.lastCall.args[1]).to.deep.eq(
                't',
                'should be the string of the prompt'
            );
        });
    });
});
