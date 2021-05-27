import 'mocha';
import rewire = require("rewire");
import Sinon = require('sinon');
import messages from '../generate.messages';
import * as chai from 'chai';
import { existsSync } from 'fs';

describe('route.generate.ts file', () => {
    let route = rewire('../route.generate');
    let grafeConfig = {
        tests: false,
        middlewares: [
            {
                name: 'protected',
                description: 'just for tests',
                value: 'pt'
            }
        ]
    };

    beforeEach(() => {
        route = rewire('../route.generate');
    });

    describe('generateRoute function', () => {

        const consoleErrorStub = Sinon.stub();
        const consoleLogStub = Sinon.stub();
        const readFileSyncStub = Sinon.stub();
        const copyFileSyncStub = Sinon.stub();
        const writeFileSyncStub = Sinon.stub();
        const existsSyncStub = Sinon.stub();
        const promptStub = Sinon.stub();
        const mkdirpStub = Sinon.stub();
        const pkgDirStub = Sinon.stub();
        const renderStub = Sinon.stub();

        let generateRoute: (routePath: string, method: string, mw: any[]) => Promise<void> 
                = route.__get__('generateRoute');

        const fsMock = {
            readFileSync: readFileSyncStub,
            copyFileSync: copyFileSyncStub,
            writeFileSync: writeFileSyncStub,
            existsSync: existsSyncStub
        };

        const inquirerMock = {
            prompt: promptStub
        };

        const mkdirpMock = {
            default: mkdirpStub
        }

        const pkgDirMock = {
            default: pkgDirStub
        }

        const ejsMock = {
            render: renderStub
        }

        beforeEach(() => {
            consoleErrorStub.reset();
            
            consoleLogStub.reset();

            route.__set__({
                console: {
                    error: consoleErrorStub,
                    log: consoleLogStub
                }
            });

            route.__set__({
                fs: fsMock,
                inquirer: inquirerMock,
                mkdirp: mkdirpMock,
                pkgDir: pkgDirMock,
                ejs: ejsMock
            });

            generateRoute = route.__get__('generateRoute');

            readFileSyncStub.reset();
            copyFileSyncStub.reset();
            writeFileSyncStub.reset();
            existsSyncStub.reset();
            promptStub.reset();
            mkdirpStub.reset();
            pkgDirStub.reset();
            renderStub.reset();
        });
        

        it('should log an error when not in grafe project', async () => {
            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.throws({ code: 'ENOENT' });

            await generateRoute('', '', []);
            
            chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should be called once');
            chai.expect(consoleLogStub.callCount).to.deep.eq(0, 'console.log should not be called once');
            chai.expect(consoleErrorStub.calledWith(messages.not_grafe)).to.deep.eq(true, 'console.error should log not_grafe message');
        });

        it('should abort when not confirming the prompt', async () => {
            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.returns(JSON.stringify(grafeConfig));
            promptStub.resolves({confirm: false});

            await generateRoute('', '', []);
            
            chai.expect(consoleErrorStub.callCount).to.deep.eq(0, 'console.error should not be called once');
            chai.expect(consoleLogStub.callCount).to.deep.eq(0, 'console.log should not be called once');
            chai.expect(promptStub.callCount).to.deep.eq(1, 'prompt should be called once');
        });

        it('should abort not using a given rest-method', async () => {
            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.returns(JSON.stringify(grafeConfig));
            promptStub.resolves({confirm: true});

            await generateRoute('/test/route/', 'test', ['pt']);
            
            chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should be called once');
            chai.expect(consoleLogStub.callCount).to.deep.eq(0, 'console.log should not be called once');
            chai.expect(promptStub.callCount).to.deep.eq(1, 'prompt should be called once');
            chai.expect(consoleErrorStub.calledWith(messages.generateRoute.invalid_method)).to.deep.eq(true, 'console.error should log invalid_method messgae');
        });

        it('should abort when middleware shortcut is not in grafe.json', async () => {
            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.returns(JSON.stringify(grafeConfig));
            promptStub.resolves({confirm: true});

            await generateRoute('test', 'post', ['t']);

            chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should be called once');
            chai.expect(consoleLogStub.callCount).to.deep.eq(0, 'console.log should not be called once');
            chai.expect(promptStub.callCount).to.deep.eq(1, 'prompt should be called once');
        });

        it('should abort when route already exists', async () => {
            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.returns(JSON.stringify(grafeConfig));
            promptStub.resolves({confirm: true});
            existsSyncStub.returns(true);

            await generateRoute('test', 'get', undefined)

            chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should be called once');
            chai.expect(consoleLogStub.callCount).to.deep.eq(0, 'console.log should not be called once');
            chai.expect(promptStub.callCount).to.deep.eq(1, 'prompt should be called once');
            chai.expect(consoleErrorStub.calledWith(messages.generateRoute.exists)).to.deep.eq(true, 'console.error should log exists messgae');

        });

        it('should abort when testfile exitsts', async () => {
            let grafeConfig_mw = JSON.parse(JSON.stringify(grafeConfig));
            grafeConfig_mw.middlewares.push({
                name: 'admin',
                description: 'just for tests',
                value: 'adm'
            });
            grafeConfig_mw.tests = true;

            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.onFirstCall().returns(JSON.stringify(grafeConfig_mw));

            promptStub.resolves({confirm: true});
            existsSyncStub.onFirstCall().returns(true);

            await generateRoute('/helloworld:id/', 'put', ['pt', 'adm'])

            chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should be called once');
            chai.expect(consoleLogStub.callCount).to.deep.eq(0, 'console.log should not be called once');
            chai.expect(promptStub.callCount).to.deep.eq(1, 'prompt should be called once');
            chai.expect(consoleErrorStub.calledWith(messages.generateRoute.exists)).to.deep.eq(true, 'should log the exists messgae');
        });

        it('should create route when everything is correct', async () => {
            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.returns(JSON.stringify(grafeConfig));
            promptStub.resolves({confirm: true});
            existsSyncStub.returns(false);

            await generateRoute('test', 'get', ['pt'])

            chai.expect(consoleErrorStub.callCount).to.deep.eq(0, 'console.error should not be called once');
            chai.expect(consoleLogStub.callCount).to.deep.eq(1, 'console.log should be called once');
            chai.expect(promptStub.callCount).to.deep.eq(1, 'prompt should be called once');
            chai.expect(copyFileSyncStub.lastCall.args[1]).to.deep.eq('C:\\grafe\\project_1\\src\\routes\\_mw.pt\\test.get.ts');
        });

        it('should create route and test-file when everything is correct', async () => {
            let grafeConfig_mw = JSON.parse(JSON.stringify(grafeConfig));
            grafeConfig_mw.middlewares.push({
                name: 'admin',
                description: 'just for tests',
                value: 'adm'
            });
            grafeConfig_mw.tests = true;

            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.onFirstCall().returns(JSON.stringify(grafeConfig_mw));
            readFileSyncStub.onSecondCall().returns('<= fileName =>');
            renderStub.returns('helloworld%id.put.ts');

            promptStub.resolves({confirm: true});
            existsSyncStub.onFirstCall().returns(false);
            existsSyncStub.onSecondCall().returns(false);

            await generateRoute('/helloworld:id/', 'put', ['pt', 'adm'])

            chai.expect(consoleErrorStub.callCount).to.deep.eq(0, 'console.error should not be called once');
            chai.expect(consoleLogStub.callCount).to.deep.eq(2, 'console.log should be called twice');
            chai.expect(promptStub.callCount).to.deep.eq(1, 'prompt should be called once');
            chai.expect(writeFileSyncStub.lastCall.args[0]).to.deep.eq('C:\\grafe\\project_1\\src\\routes\\_mw.pt.adm\\_tests\\helloworld%id.put.ts')
            chai.expect(copyFileSyncStub.lastCall.args[1]).to.deep.eq('C:\\grafe\\project_1\\src\\routes\\_mw.pt.adm\\helloworld%id.put.ts');
        });
    });

    describe('generateRouteHandler function', () => {
            
        const consoleErrorStub = Sinon.stub();
        const readFileSyncStub = Sinon.stub();
        const promptStub = Sinon.stub();
        const pkgDirStub = Sinon.stub();
        const generateRouteStub = Sinon.stub();

        let generateRouteHandler: (argv: any) => Promise<void> 
                = route.__get__('generateRouteHandler');

        const fsMock = {
            readFileSync: readFileSyncStub,
        };

        const inquirerMock = {
            prompt: promptStub
        };

        const pkgDirMock = {
            default: pkgDirStub
        }

        beforeEach(() => {
            consoleErrorStub.reset();
            
            route.__set__({
                generateRoute: generateRouteStub
            });

            route.__set__({
                console: {
                    error: consoleErrorStub,
                }
            });

            route.__set__({
                fs: fsMock,
                inquirer: inquirerMock,
                pkgDir: pkgDirMock,
            });

            generateRouteHandler = route.__get__('generateRouteHandler');

            readFileSyncStub.reset();
            promptStub.reset();
            pkgDirStub.reset();
        });

        it('should log an error when not in a grafe project', async () => {
            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.throws({ code: 'ENOENT' });

            await generateRouteHandler({});
            
            chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should be called once');
            chai.expect(promptStub.callCount).to.deep.eq(0, 'should not prompt the user');
            chai.expect(consoleErrorStub.calledWith(messages.not_grafe)).to.deep.eq(true, 'console.error should log not_grafe message');
        });

        it('should start generateRoute with given parameters', async () => {
            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.returns(JSON.stringify(grafeConfig));

            await generateRouteHandler({routePath: '/test', method: 'get', middlewares: []});
            
            chai.expect(consoleErrorStub.callCount).to.deep.eq(0, 'console.error should not be called once');
            chai.expect(promptStub.callCount).to.deep.eq(0, 'should not prompt the user');
            chai.expect(generateRouteStub.lastCall.args[0]).to.deep.eq('/test', 'should be the given routePath');
            chai.expect(generateRouteStub.lastCall.args[1]).to.deep.eq('get', 'should be the given method');
            chai.expect(generateRouteStub.lastCall.args[2]).to.deep.eq([], 'should be the given middlewares');
        });

        it('should remove the middleware question', async () => {
            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.returns(JSON.stringify({
                middlewares: []
            }));
            promptStub.resolves({path: '/test', method: 'get'})

            await generateRouteHandler({});
            
            chai.expect(consoleErrorStub.callCount).to.deep.eq(0, 'console.error should not be called once');
            chai.expect(promptStub.callCount).to.deep.eq(1, 'should not prompt the user');
            chai.expect(generateRouteStub.lastCall.args[0]).to.deep.eq('/test', 'should be the given routePath');
            chai.expect(generateRouteStub.lastCall.args[1]).to.deep.eq('get', 'should be the given method');
            chai.expect(generateRouteStub.lastCall.args[2]).to.deep.eq(undefined, 'should be the given middlewares');
        });

        it('should prompt the user all questions', async () => {
            pkgDirStub.resolves('C:\\grafe\\project_1');
            readFileSyncStub.returns(JSON.stringify(grafeConfig));
            promptStub.resolves({path: '/test', method: 'get', middlewares: []})

            await generateRouteHandler({});
            
            chai.expect(consoleErrorStub.callCount).to.deep.eq(0, 'console.error should not be called once');
            chai.expect(promptStub.callCount).to.deep.eq(1, 'should not prompt the user');
            chai.expect(generateRouteStub.lastCall.args[0]).to.deep.eq('/test', 'should be the given routePath');
            chai.expect(generateRouteStub.lastCall.args[1]).to.deep.eq('get', 'should be the given method');
            chai.expect(generateRouteStub.lastCall.args[2]).to.deep.eq([], 'should be the given middlewares');
        });
    });
});