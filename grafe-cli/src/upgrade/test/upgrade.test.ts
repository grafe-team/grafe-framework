import 'mocha';
import rewire = require('rewire');
import Sinon = require('sinon');
import messages from '../upgrade.messages';
import * as path from 'path';
import * as chai from 'chai';
import * as yargs from 'yargs';

describe('upgrade.ts file', () => {
    let upgrade = rewire('../upgrade');

    beforeEach(() => {
        upgrade = rewire('../upgrade');
    });

    describe('upgradeHandler function', () => {
        const consoleErrorStub = Sinon.stub();
        const consoleLogStub = Sinon.stub();
        const consoleWarnStub = Sinon.stub();
        const existsSyncStub = Sinon.stub();
        const promptStub = Sinon.stub();
        const pkgDirStub = Sinon.stub();
        const readFileSyncStub = Sinon.stub();
        const writeFileSyncStub = Sinon.stub();

        let upgradeHandler: (argv: Record<string, unknown>) => Promise<void> =
            upgrade.__get__('upgradeHandler');

        const fsMock = {
            existsSync: existsSyncStub,
            readFileSync: readFileSyncStub,
            writeFileSync: writeFileSyncStub,
        };

        const inquirerMock = {
            prompt: promptStub,
        };

        const pkgDirMock = {
            default: pkgDirStub,
        };

        beforeEach(() => {
            consoleLogStub.reset();
            consoleErrorStub.reset();
            consoleWarnStub.reset();

            upgrade.__set__({
                console: {
                    error: consoleErrorStub,
                    log: consoleLogStub,
                    warn: consoleWarnStub,
                },
            });

            upgrade.__set__({
                fs: fsMock,
                inquirer: inquirerMock,
                pkgDir: pkgDirMock,
            });

            upgradeHandler = upgrade.__get__('upgradeHandler');

            promptStub.reset();
            pkgDirStub.reset();
            existsSyncStub.reset();
            readFileSyncStub.reset();
            writeFileSyncStub.reset();
        });

        it('should abort when not grafe project', async () => {
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.throws({ code: 'ENOENT' });

            await upgradeHandler({});

            chai.expect(promptStub.callCount).to.deep.eq(
                0,
                'prompt should not be called once'
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
                consoleErrorStub.calledWith(messages.not_grafe)
            ).to.deep.eq(true, 'console.error should log not_grafe');
        });

        it('should abort when not confirming to fix issues', async () => {
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.returns(JSON.stringify({}));
            promptStub.returns({ confirm: false });
            await upgradeHandler({});

            chai.expect(promptStub.callCount).to.deep.eq(
                1,
                'prompt should be called once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                6,
                'console.error should be called 6 times'
            );
            chai.expect(consoleWarnStub.callCount).to.deep.eq(
                3,
                'console.warn should be called 3 times'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                1,
                'console.log should be called once'
            );
        });

        it('should remove wrong middlewares or static-folder', async () => {
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.returns(
                JSON.stringify({
                    tests: false,
                    statics: [
                        { test: '' },
                        { prefix: '', fldr: '' },
                        { prefix: '', folder: '' },
                    ],
                    middlewares: [
                        { test: '' },
                        { name: '', test: '' },
                        { name: '', description: '', test: '' },
                        { name: '', description: '', value: '' },
                    ],
                    projectType: '',
                    routePath: '',
                    middlewarePath: '',
                })
            );
            promptStub.returns({ confirm: true });
            await upgradeHandler({ fix: true });

            chai.expect(promptStub.callCount).to.deep.eq(
                0,
                'prompt should not be called once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                5,
                'console.error should be called five times'
            );
            chai.expect(consoleWarnStub.callCount).to.deep.eq(
                3,
                'console.warn should be called 3 times'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                2,
                'console.log should be called twice'
            );

            chai.expect(
                JSON.parse(writeFileSyncStub.lastCall.args[1]).statics.length
            ).to.deep.eq(1, 'statics array should be empty');

            chai.expect(
                JSON.parse(writeFileSyncStub.lastCall.args[1]).middlewares
                    .length
            ).to.deep.eq(1, 'middlewares array should be empty');
        });

        it('should log success if everything is right', async () => {
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.returns(
                JSON.stringify({
                    tests: false,
                    statics: [],
                    middlewares: [],
                    projectType: 'express',
                    routePath: 'test/',
                    middlewarePath: 'test/',
                })
            );
            await upgradeHandler({});

            chai.expect(promptStub.callCount).to.deep.eq(
                0,
                'prompt should not be called once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(consoleWarnStub.callCount).to.deep.eq(
                0,
                'console.warn should not be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                1,
                'console.log should be called once'
            );

            chai.expect(
                consoleLogStub.calledWith(messages.everything_right)
            ).to.deep.eq(
                true,
                'console.log should be called with everything_right message'
            );
        });

        it('should log warnings if some things are not 100% right', async () => {
            pkgDirStub.resolves(path.join('grafe', 'project_1'));
            readFileSyncStub.returns(
                JSON.stringify({
                    tests: false,
                    statics: [],
                    middlewares: [],
                    projectType: 'grafe',
                    routePath: 'test/',
                    middlewarePath: 'test/',
                })
            );
            await upgradeHandler({});

            chai.expect(promptStub.callCount).to.deep.eq(
                0,
                'prompt should not be called once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(consoleWarnStub.callCount).to.deep.eq(
                2,
                'console.warn should be called twice'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                0,
                'console.log should not be called once'
            );

            chai.expect(consoleWarnStub.lastCall.args[0]).to.deep.eq(
                messages.warn,
                'console.warn should be called with warn message'
            );
        });
    });

    describe('upgradeCommand function', () => {
        let upgradeCommand: (
            yargs: yargs.Argv<Record<string, unknown>>
        ) => yargs.Argv<Record<string, unknown>> =
            upgrade.__get__('upgradeCommand');

        beforeEach(() => {
            upgradeCommand = upgrade.__get__('upgradeCommand');
        });

        it('should have the same options', async () => {
            const a: yargs.Argv<Record<string, unknown>> = yargs.default;
            const result = upgradeCommand(a);

            chai.expect(result).to.deep.eq(
                a.option('fix', {
                    type: 'boolean',
                    description: messages.commands.fix.description,
                }),
                'should have these options'
            );
        });
    });
});
