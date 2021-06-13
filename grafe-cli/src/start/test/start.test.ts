import 'mocha';
import rewire = require('rewire');
import Sinon = require('sinon');
import messages from '../start.messages';
import * as chai from 'chai';
import * as yargs from 'yargs';
import { StarterTemplateOptions } from '../start';

describe('start.ts file', () => {
    let start = rewire('../start');

    beforeEach(() => {
        start = rewire('../start');
    });

    describe('startCommand function', () => {
        let startCommand: (
            yargs: yargs.Argv<Record<string, unknown>>
        ) => yargs.Argv<Record<string, unknown>> =
            start.__get__('startCommand');

        beforeEach(() => {
            startCommand = start.__get__('startCommand');
        });

        it('should have the same options', async () => {
            const a: yargs.Argv<Record<string, unknown>> = yargs.default;
            const result = startCommand(a);

            chai.expect(result).to.deep.eq(
                a
                    .option('template', {
                        alias: 't',
                        type: 'string',
                        description:
                            messages.commands.start.templating.description,
                    })
                    .option('testing', {
                        type: 'boolean',
                        description:
                            messages.commands.start.testing.description,
                    }),
                'should have these options'
            );
        });
    });

    describe('getTemplate function', () => {
        const consoleErrorStub = Sinon.stub();
        const consoleLogStub = Sinon.stub();
        const readdirSyncStub = Sinon.stub();
        const promptStub = Sinon.stub();
        const getTemplateFromUserStub = Sinon.stub();

        let getTemplate: (
            templateDirPath: string,
            argv: Record<string, unknown>
        ) => Promise<string> = start.__get__('getTemplate');

        const fsMock = {
            readdirSync: readdirSyncStub,
        };

        const inquirerMock = {
            prompt: promptStub,
        };

        beforeEach(() => {
            consoleErrorStub.reset();

            consoleLogStub.reset();

            start.__set__({
                console: {
                    error: consoleErrorStub,
                    log: consoleLogStub,
                },
            });

            start.__set__({
                fs: fsMock,
                inquirer: inquirerMock,
            });

            start.__set__({
                getTemplateFromUser: getTemplateFromUserStub,
            });

            getTemplate = start.__get__('getTemplate');

            promptStub.reset();
            readdirSyncStub.reset();
            getTemplateFromUserStub.reset();
        });

        it('should return "express" as template', async () => {
            readdirSyncStub.returns(['express']);

            const result = await getTemplate('', {
                template: 'express',
            });

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                0,
                'console.log should not be called once'
            );
            chai.expect(result).to.deep.eq(
                'express',
                'return value should be express'
            );
        });

        it('should return "express" as template if template is undefined', async () => {
            readdirSyncStub.returns(['express']);
            getTemplateFromUserStub.returns('express');

            const result = await getTemplate('', {
                template: undefined,
            });

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                0,
                'console.log should not be called once'
            );
            chai.expect(result).to.deep.eq(
                'express',
                'return value should be express'
            );
        });

        it('should return "express" as template if template is not supported', async () => {
            readdirSyncStub.returns(['express']);
            getTemplateFromUserStub.returns('express');

            const result = await getTemplate('', {
                template: 'fastify',
            });

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(consoleLogStub.callCount).to.deep.eq(
                1,
                'console.log should be called once'
            );
            chai.expect(result).to.deep.eq(
                'express',
                'return value should be express'
            );
        });
    });

    describe('getTemplateFromUser function', () => {
        const promptStub = Sinon.stub();

        let getTemplateFromUser: (
            templateChoises: string[]
        ) => Promise<string> = start.__get__('getTemplateFromUser');

        const inquirerMock = {
            prompt: promptStub,
        };

        beforeEach(() => {
            start.__set__({
                inquirer: inquirerMock,
            });

            getTemplateFromUser = start.__get__('getTemplateFromUser');

            promptStub.reset();
        });

        it('should return "express" as template', async () => {
            promptStub.resolves({
                templateType: 'express',
            });

            const result = await getTemplateFromUser([]);

            chai.expect(result).to.deep.eq(
                'express',
                'return value should be express'
            );
        });
    });

    describe('createProjectFolder function', () => {
        const existsSyncStub = Sinon.stub();
        const mkdirSyncStub = Sinon.stub();
        const consoleErrorStub = Sinon.stub();

        let createProjectFolder: (options: StarterTemplateOptions) => boolean =
            start.__get__('createProjectFolder');

        const fsMock = {
            existsSync: existsSyncStub,
            mkdirSync: mkdirSyncStub,
        };

        beforeEach(() => {
            start.__set__({
                console: {
                    error: consoleErrorStub,
                },
            });

            start.__set__({
                fs: fsMock,
            });

            createProjectFolder = start.__get__('createProjectFolder');

            consoleErrorStub.reset();
            existsSyncStub.reset();
            mkdirSyncStub.reset();
        });

        it('should return false and log an error if project exists', async () => {
            existsSyncStub.returns(true);
            const options: StarterTemplateOptions = {
                templatePath: '',
                templateName: '',
                projectPath: '',
                projectName: '',
            };
            const result = createProjectFolder(options);

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'console.error should be called once'
            );
            chai.expect(result).to.deep.eq(
                false,
                'return value should be false'
            );
        });

        it('should return true if everything worked', async () => {
            existsSyncStub.returns(false);
            const options: StarterTemplateOptions = {
                templatePath: '',
                templateName: '',
                projectPath: '',
                projectName: '',
            };
            const result = createProjectFolder(options);

            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(result).to.deep.eq(true, 'return value should be true');
        });
    });

    describe('installPackages function', () => {
        const existsSyncStub = Sinon.stub();
        const cdStub = Sinon.stub();
        const execStub = Sinon.stub();

        let installPackages: (projectFolder: string) => string =
            start.__get__('installPackages');

        const fsMock = {
            existsSync: existsSyncStub,
        };

        const shellMock = {
            cd: cdStub,
            exec: execStub,
        };

        beforeEach(() => {
            start.__set__({
                fs: fsMock,
                shell: shellMock,
            });

            installPackages = start.__get__('installPackages');

            cdStub.reset();
            existsSyncStub.reset();
            execStub.reset();
        });

        it('should return no_package message if project has no packages', async () => {
            existsSyncStub.returns(false);
            const result = installPackages('');

            chai.expect(result).to.deep.eq(
                messages.no_package,
                'return value should be no_package message'
            );
        });

        it('should return went_wrong message if installation went wrong', async () => {
            existsSyncStub.returns(true);
            execStub.returns({ code: 1 });
            const result = installPackages('');

            chai.expect(result).to.deep.eq(
                messages.went_wrong,
                'return value should be went_wrong message'
            );
        });

        it('should return empty string message if everything worked', async () => {
            existsSyncStub.returns(true);
            execStub.returns({ code: 0 });
            const result = installPackages('');

            chai.expect(result).to.deep.eq(
                '',
                'return value should be empty string'
            );
        });
    });

    describe('startHandler function', () => {
        const writeFileSyncStub = Sinon.stub();
        const readFileSyncStub = Sinon.stub();
        const promptStub = Sinon.stub();
        const consoleErrorStub = Sinon.stub();
        const consoleLogStub = Sinon.stub();
        const getTemplateStub = Sinon.stub();
        const createProjectFolderStub = Sinon.stub();
        const createDirectoryContentsStub = Sinon.stub();
        const installPackagesStub = Sinon.stub();

        let startHandler: (argv: Record<string, unknown>) => Promise<void> =
            start.__get__('startHandler');

        const fsMock = {
            writeFileSync: writeFileSyncStub,
            readFileSync: readFileSyncStub,
        };

        const inquirerMock = {
            prompt: promptStub,
        };

        const templatingMock = {
            createDirectoryContents: createDirectoryContentsStub,
        };

        beforeEach(() => {
            start.__set__({
                console: {
                    error: consoleErrorStub,
                    log: consoleLogStub,
                },
            });

            start.__set__({
                fs: fsMock,
                inquirer: inquirerMock,
                templating: templatingMock,
            });

            start.__set__({
                getTemplate: getTemplateStub,
                createProjectFolder: createProjectFolderStub,
                installPackages: installPackagesStub,
            });

            startHandler = start.__get__('startHandler');

            writeFileSyncStub.reset();
            readFileSyncStub.reset();
            promptStub.reset();
            consoleErrorStub.reset();
            consoleLogStub.reset();
            getTemplateStub.reset();
            createProjectFolderStub.reset();
            createDirectoryContentsStub.reset();
            installPackagesStub.reset();
        });

        it('should abort when not confirming', async () => {
            promptStub.onFirstCall().resolves({ projectName: 'grafe_project' });
            promptStub.onSecondCall().resolves({ confirm: false });
            getTemplateStub.resolves('express');

            await startHandler({});

            chai.expect(consoleLogStub.callCount).to.deep.eq(
                0,
                'console.log should not be called once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(promptStub.callCount).to.deep.eq(
                2,
                'user should be prompted twice'
            );
        });

        it('should abort when createProjectFolder failed', async () => {
            promptStub.onFirstCall().resolves({ projectName: 'grafe_project' });
            promptStub.onSecondCall().resolves({ confirm: true });
            createProjectFolderStub.returns(false);
            getTemplateStub.resolves('express');

            await startHandler({ projectName: '' });

            chai.expect(consoleLogStub.callCount).to.deep.eq(
                0,
                'console.log should not be called once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(promptStub.callCount).to.deep.eq(
                2,
                'user should be prompted twice'
            );
        });

        it('should abort when installing packages failed', async () => {
            promptStub.onFirstCall().resolves({ confirm: true });
            createProjectFolderStub.returns(true);
            getTemplateStub.resolves('express');
            installPackagesStub.returns(messages.went_wrong);

            await startHandler({ projectName: 'garfe_project' });

            chai.expect(consoleLogStub.callCount).to.deep.eq(
                1,
                'console.log should be called once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'console.error should be called once'
            );
            chai.expect(
                consoleErrorStub.calledOnceWith(messages.went_wrong)
            ).to.deep.eq(true, 'should console.error went_wrong message');
            chai.expect(promptStub.callCount).to.deep.eq(
                1,
                'user should be prompted once'
            );
        });

        it('should abort when not in grafe project', async () => {
            promptStub.onFirstCall().resolves({ confirm: true });
            readFileSyncStub.throws({ code: 'ENOENT' });
            createProjectFolderStub.returns(true);
            getTemplateStub.resolves('express');

            await startHandler({ projectName: 'garfe_project', testing: true });

            chai.expect(consoleLogStub.callCount).to.deep.eq(
                0,
                'console.log should not be called once'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                1,
                'console.error should be called once'
            );
            chai.expect(
                consoleErrorStub.calledOnceWith(messages.not_grafe)
            ).to.deep.eq(true, 'should console.error not_grafe message');
            chai.expect(promptStub.callCount).to.deep.eq(
                1,
                'user should be prompted once'
            );
        });

        it('should finish if everything is correct', async () => {
            promptStub.onFirstCall().resolves({ confirm: true });
            readFileSyncStub.returns(
                JSON.stringify({
                    tests: false,
                })
            );

            createProjectFolderStub.returns(true);
            getTemplateStub.resolves('express');
            installPackagesStub.returns('');

            await startHandler({ projectName: 'garfe_project', testing: true });

            chai.expect(consoleLogStub.callCount).to.deep.eq(
                2,
                'console.log should not be called twice'
            );
            chai.expect(consoleErrorStub.callCount).to.deep.eq(
                0,
                'console.error should not be called once'
            );
            chai.expect(consoleLogStub.lastCall.args[0]).to.deep.eq(
                messages.project_created,
                'console.log should log project_created message'
            );
            chai.expect(promptStub.callCount).to.deep.eq(
                1,
                'user should be prompted once'
            );
            chai.expect(
                JSON.parse(writeFileSyncStub.lastCall.args[1]).tests
            ).to.deep.eq(true, 'testing should be enabled');
        });
    });
});
