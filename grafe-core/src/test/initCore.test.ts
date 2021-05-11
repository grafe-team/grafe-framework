// import rewire = require("rewire");
// import Config = require('../config');
// import * as path from 'path';
// import fs = require('fs');
// import * as sinon from 'sinon';
// import * as chai from 'chai';
// import 'mocha';
// import { initCore } from '../initCore';
// import * as requireMock from 'mock-require';

// describe('initCore file', () => {

//     describe('initCore function', () => {
        
//         const basicConfigObj = {
//             "projectType": "express",
//             "routepath": "src/routes",
//             "middlewarePath": "src/middlewares",
//             "middlewares": [
//                 {
//                     "name": "protected",
//                     "description": "Just a place holder for now later this will be a loggin function for demostration purpouses",
//                     "value": "pt"
//                 }
//             ]
//         };

//         const basicConfig = JSON.stringify(basicConfigObj);

//         const basePath = path.join(__dirname);

//         const middlewareRequirePath = 
//             path.join(basePath, basicConfigObj.middlewarePath, basicConfigObj.middlewares[0].value, basicConfigObj.middlewares[0].name);

//         let fsExistsStub: sinon.SinonStub;
//         let fsReadFileStub: sinon.SinonStub;
//         let consoleErrorStub: sinon.SinonStub;
//         let setConfigSpy: sinon.SinonSpy;
//         let requireSpy: sinon.SinonStub;
//         let requiredFunctionSpy: sinon.SinonSpy;
//         let initCoreModule;

//         beforeEach(() => {
//             fsExistsStub = sinon.stub(fs, 'existsSync').returns(true);
//             // retrurns the basic config 
//             fsReadFileStub = sinon.stub(fs, 'readFileSync');
//             // i am stubing this because i dont want logs to the console while the test runs
//             consoleErrorStub = sinon.stub(console, 'error');
//             setConfigSpy = sinon.spy(Config, 'setConfig');

//             initCoreModule = rewire('../initCore');
            
//             const  = initCoreModule.__get__()

            
//             // requiredFunctionSpy = sinon.spy();
//             // requireSpy = sinon.stub().returns(requiredFunctionSpy);

//             // requireMock.default(middlewareRequirePath, requireSpy);

//         });

//         afterEach(() => {
//             fsExistsStub.restore();
//             fsReadFileStub.restore();
//             consoleErrorStub.restore();
//             setConfigSpy.restore();

//             // requiredFunctionSpy.resetHistory();
//             // requireSpy.reset();
//             // requireMock.stopAll();
//         });

//         it ('should check if file exists, read file, parse it, set base dir, createMiddlewareLinks and return true', () => {
//             fsExistsStub.returns(true);
//             fsReadFileStub.returns(basicConfig);
            
//             const rewired = rewire('../initCore');
//             rewired.__set__('initMiddlewares', (stuff: any) => {});
//             const initCore = rewired.__get__('initCore');

//             let results: boolean;

//             // check if funktio throws an error
//             chai.expect(() => {results = initCore(path.join(basePath, 'grafe.json'))}).to.not.throw('initCore is not allowed to throw an error');

//             // check if all functions that should/shouldnt be called where called acordingly
//             chai.expect(fsExistsStub.callCount).to.deep.eq(2, 'fs.existsSync should be called once');
//             chai.expect(fsReadFileStub.callCount).to.deep.eq(1, 'fs.readFileSync should be called once');
//             chai.expect(setConfigSpy.callCount).to.deep.eq(1, 'setConfig should be called once');
//             chai.expect(consoleErrorStub.called).to.deep.eq(false, 'console.error should not be called');
//             chai.expect(results).to.deep.equal(true, 'initCore has to deeply return true');

//             const config = Config.getConfig();

//             // check if config has the right values
//             chai.expect(config).to.include({baseDir: basePath}, `The condig should have the field "baseDir" and have it equal ${basePath}`);
//             const middlewareFilePath = path.join(basePath, 'src', 'middlewares', 'pt', 'protected.js');
//             chai.expect(config.middlewares[0]).to.include({link: middlewareFilePath}, `The middleware should have the field "link" and have it equal ${middlewareFilePath}`);
//         });

//         it ('should return flalse and only call fs.existsSync once because file does not eixst also it should output an error message', () => {
//             fsExistsStub.returns(false);
//             fsReadFileStub.returns(basicConfig);

//             const basePath = path.join(__dirname);

//             const resulst = initCore(path.join(basePath, 'grafe.json'));

//             // check if all functions that should/shouldnt be called where called acordingly
//             chai.expect(fsExistsStub.callCount).to.deep.eq(1, 'fs.existsSync should be called once');
//             chai.expect(fsReadFileStub.called).to.deep.eq(false, 'fs.readFileSync should not be called');
//             chai.expect(setConfigSpy.called).to.deep.eq(false, 'setConfig should be called once');
//             chai.expect(consoleErrorStub.called).to.deep.eq(true, 'console.error should not be called');
//             chai.expect(resulst).to.deep.equal(false, 'initCore has to deeply return true');
//         });

//         it ('should display an error message if the fs.existsSync throws an error and return false', () => {
//             fsExistsStub.throws('message');
//             fsReadFileStub.returns(basicConfig);

//             const basePath = path.join(__dirname);

            
//             // check if all functions that should/shouldnt be called where called acordingly
//             chai.expect(initCore, 'initCore should not throw an error').to.not.throw();
//             chai.expect(fsExistsStub.callCount).to.deep.eq(1, 'fs.existsSync should be called once');
//             chai.expect(fsReadFileStub.called).to.deep.eq(false, 'fs.readFileSync should not be called');
//             chai.expect(setConfigSpy.called).to.deep.eq(false, 'setConfig should be called once');
//             chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should not be called');
//             // check if the function returns false needs to be at the end so the function call checks still work
//             chai.expect(initCore(path.join(basePath, 'grafe.json')), 'initCore should return false').to.be.false;
//         });

//         it ('should display an error message if the fs.readFileSync throws an error and return false', () => {
//             fsExistsStub.returns(true);
//             fsReadFileStub.throws();

//             const basePath = path.join(__dirname);

            
//             // check if all functions that should/shouldnt be called where called acordingly
//             chai.expect(initCore, 'initCore should not throw an error').to.not.throw();
//             chai.expect(fsExistsStub.callCount).to.deep.eq(1, 'fs.existsSync should be called once');
//             chai.expect(fsReadFileStub.callCount).to.deep.eq(1, 'fs.readFileSync should not be called');
//             chai.expect(setConfigSpy.called).to.deep.eq(false, 'setConfig should be called once');
//             chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should not be called');
//             // check if the function returns false needs to be at the end so the function call checks still work
//             chai.expect(initCore(path.join(basePath, 'grafe.json')), 'initCore should return false').to.be.false;
//         });

//         it ('should display an error message if the string from fs.readFileSync is not parseable and return false', () => {
//             fsExistsStub.returns(true);
//             fsReadFileStub.returns('random string');

//             const basePath = path.join(__dirname);

            
//             // check if all functions that should/shouldnt be called where called acordingly
//             chai.expect(initCore, 'initCore should not throw an error').to.not.throw();
//             chai.expect(fsExistsStub.callCount).to.deep.eq(1, 'fs.existsSync should be called once');
//             chai.expect(fsReadFileStub.callCount).to.deep.eq(1, 'fs.readFileSync should not be called');
//             chai.expect(setConfigSpy.called).to.deep.eq(false, 'setConfig should be called once');
//             chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should not be called');
//             // check if the function returns false needs to be at the end so the function call checks still work
//             chai.expect(initCore(path.join(basePath, 'grafe.json')), 'initCore should return false').to.be.false;
//         });

//     });
// });