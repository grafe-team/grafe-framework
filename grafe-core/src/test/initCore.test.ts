import rewire = require("rewire");
import Config = require('../config');
import * as path from 'path';
import fs = require('fs');
import * as sinon from 'sinon';
import * as chai from 'chai';
import 'mocha';
import { initCore } from '../initCore';

describe('initCore file', () => {

    describe('initCore function', () => {
        
        const basicConfig = `{
            "projectType": "express",
            "routepath": "src/routes",
            "middlewarePath": "src/middlewares",
            "middlewares": [
                {
                    "name": "protected",
                    "description": "Just a place holder for now later this will be a loggin function for demostration purpouses",
                    "value": "pt"
                }
            ]
        }`;

        let fsExistsStub: sinon.SinonStub;
        let fsReadFileStub: sinon.SinonStub;
        let consoleErrorStub: sinon.SinonStub;
        let setConfigSpy: sinon.SinonSpy;

        beforeEach(() => {
            fsExistsStub = sinon.stub(fs, 'existsSync').returns(true);
            // retrurns the basic config 
            fsReadFileStub = sinon.stub(fs, 'readFileSync');
            // i am stubing this because i dont want logs to the console while the test runs
            consoleErrorStub = sinon.stub(console, 'error');
            setConfigSpy = sinon.spy(Config, 'setConfig'); 
        });

        afterEach(() => {
            fsExistsStub.restore();
            fsReadFileStub.restore();
            consoleErrorStub.restore();
            setConfigSpy.restore();
        });

        it ('should check if file exists, read file, parse it, set base dir, createMiddlewareLinks and return true', () => {
            fsExistsStub.returns(true);
            fsReadFileStub.returns(basicConfig);

            const basePath = path.join(__dirname);

            const resulst = initCore(path.join(basePath, 'grafe.json'));

            // check if all functions that should/shouldnt be called where called acordingly
            chai.expect(fsExistsStub.callCount).to.deep.eq(2, 'fs.existsSync should be called once');
            chai.expect(fsReadFileStub.callCount).to.deep.eq(1, 'fs.readFileSync should be called once');
            chai.expect(setConfigSpy.callCount).to.deep.eq(1, 'setConfig should be called once');
            chai.expect(consoleErrorStub.called).to.deep.eq(false, 'console.error should not be called');
            chai.expect(resulst).to.deep.equal(true, 'initCore has to deeply return true');

            const config = Config.getConfig();

            // check if config has the right values
            chai.expect(config).to.include({baseDir: basePath}, `The condig should have the field "baseDir" and have it equal ${basePath}`);
            const middlewareFilePath = path.join(basePath, 'src', 'middlewares', 'pt', 'protected.js');
            chai.expect(config.middlewares[0]).to.include({link: middlewareFilePath}, `The middleware should have the field "link" and have it equal ${middlewareFilePath}`);
        });

        it ('should return flalse and only call fs.existsSync once because file does not eixst also it should output an error message', () => {
            fsExistsStub.returns(false);
            fsReadFileStub.returns(basicConfig);

            const basePath = path.join(__dirname);

            const resulst = initCore(path.join(basePath, 'grafe.json'));

            // check if all functions that should/shouldnt be called where called acordingly
            chai.expect(fsExistsStub.callCount).to.deep.eq(1, 'fs.existsSync should be called once');
            chai.expect(fsReadFileStub.called).to.deep.eq(false, 'fs.readFileSync should not be called');
            chai.expect(setConfigSpy.called).to.deep.eq(false, 'setConfig should be called once');
            chai.expect(consoleErrorStub.called).to.deep.eq(true, 'console.error should not be called');
            chai.expect(resulst).to.deep.equal(false, 'initCore has to deeply return true');
        });

        it ('should display an error message if the fs.existsSync throws an error and return false', () => {
            fsExistsStub.throws('message');
            fsReadFileStub.returns(basicConfig);

            const basePath = path.join(__dirname);

            
            // check if all functions that should/shouldnt be called where called acordingly
            chai.expect(initCore, 'initCore should not throw an error').to.not.throw();
            chai.expect(fsExistsStub.callCount).to.deep.eq(1, 'fs.existsSync should be called once');
            chai.expect(fsReadFileStub.called).to.deep.eq(false, 'fs.readFileSync should not be called');
            chai.expect(setConfigSpy.called).to.deep.eq(false, 'setConfig should be called once');
            chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should not be called');
            // check if the function returns false needs to be at the end so the function call checks still work
            chai.expect(initCore(path.join(basePath, 'grafe.json')), 'initCore should return false').to.be.false;
        });

        it ('should display an error message if the fs.readFileSync throws an error and return false', () => {
            fsExistsStub.returns(true);
            fsReadFileStub.throws();

            const basePath = path.join(__dirname);

            
            // check if all functions that should/shouldnt be called where called acordingly
            chai.expect(initCore, 'initCore should not throw an error').to.not.throw();
            chai.expect(fsExistsStub.callCount).to.deep.eq(1, 'fs.existsSync should be called once');
            chai.expect(fsReadFileStub.callCount).to.deep.eq(1, 'fs.readFileSync should not be called');
            chai.expect(setConfigSpy.called).to.deep.eq(false, 'setConfig should be called once');
            chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should not be called');
            // check if the function returns false needs to be at the end so the function call checks still work
            chai.expect(initCore(path.join(basePath, 'grafe.json')), 'initCore should return false').to.be.false;
        });

        it ('should display an error message if the string from fs.readFileSync is not parseable and return false', () => {
            fsExistsStub.returns(true);
            fsReadFileStub.returns('random string');

            const basePath = path.join(__dirname);

            
            // check if all functions that should/shouldnt be called where called acordingly
            chai.expect(initCore, 'initCore should not throw an error').to.not.throw();
            chai.expect(fsExistsStub.callCount).to.deep.eq(1, 'fs.existsSync should be called once');
            chai.expect(fsReadFileStub.callCount).to.deep.eq(1, 'fs.readFileSync should not be called');
            chai.expect(setConfigSpy.called).to.deep.eq(false, 'setConfig should be called once');
            chai.expect(consoleErrorStub.callCount).to.deep.eq(1, 'console.error should not be called');
            // check if the function returns false needs to be at the end so the function call checks still work
            chai.expect(initCore(path.join(basePath, 'grafe.json')), 'initCore should return false').to.be.false;
        });

    });

    describe('createMiddlewareLinks function', () => {
        // i dont know how to say this
        it ('should create the links in the right way and not edit the config in any other way', () => {
            const initCoreModule = rewire('../initCore');

            const createMiddlewareLinks = initCoreModule.__get__('createMiddlewareLinks');

            const config: Config.Config = {
                baseDir: path.join(__dirname),
                middlewarePath: 'src/test/middleware',
                projectType: 'express',
                routePath: 'something',
                middlewares: [
                    {
                        description: 'one d',
                        name: 'one name',
                        value: 'one',
                        link: ''
                    },
                    {
                        description: 'second d',
                        name: 'second name',
                        value: 'second',
                        link: ''
                    }
                ]
            };

            const result = createMiddlewareLinks(config);

            config.middlewares[0].link = path.join(config.baseDir, config.middlewarePath, 'one name', 'one');
            config.middlewares[0].link = path.join(config.baseDir, config.middlewarePath, 'second name', 'second');

            chai.expect(result).to.be.deep.equal(config);

        });

    });

    describe('removeNonExistantMiddlewares function', () => {

        let fsExistsStub: sinon.SinonStub;

        const configStore: Config.Config = {
            baseDir: path.join(__dirname),
            middlewarePath: 'src/test/middleware',
            projectType: 'express',
            routePath: 'something',
            middlewares: [
                {
                    description: 'item 1',
                    name: 'i1',
                    value: 'i1',
                    link: ''
                },
                {
                    description: 'item 2',
                    name: 'i2',
                    value: 'i2',
                    link: ''
                },
                {
                    description: 'item 3',
                    name: 'i3',
                    value: 'i3',
                    link: ''
                }
            ]
        };

        let config: Config.Config;

        beforeEach(() => {
            fsExistsStub = sinon.stub(fs, 'existsSync');
            // deepl clone in a costly way :)
            config = JSON.parse(JSON.stringify(configStore));
        });

        afterEach(() => {
            fsExistsStub.restore();
        });

        it ('should remove the second an third mw without throwing an error', () => {
            const initCoreModule = rewire('../initCore');

            fsExistsStub.onCall(0).returns(true);
            fsExistsStub.onCall(1).returns(false);
            fsExistsStub.onCall(2).returns(false);

            const removeNonExistantMiddlewares = initCoreModule.__get__('removeNonExistantMiddlewares');
            
            
            let resultConfig: Config.Config;

            // check if the function throws an error
            chai.expect(() => {resultConfig = removeNonExistantMiddlewares(config)}).to.not.throw();

            // check if the returned config is as expected 
            chai.expect(fsExistsStub.callCount).to.deep.eq(3, 'fs.existsSync should be called 3 times');
            chai.expect(resultConfig.middlewares.length).to.deep.eq(1, 'there should only be 1 mw left');
            chai.expect(resultConfig.middlewares[0]).to.deep.eq(configStore.middlewares[0], 'The last middleware standing should be the same as the first one');
        });

        it ('should remove the first and second mw without throwing an error', () => {
            const initCoreModule = rewire('../initCore');

            fsExistsStub.onCall(0).returns(false);
            fsExistsStub.onCall(1).returns(false);
            fsExistsStub.onCall(2).returns(true);

            const removeNonExistantMiddlewares = initCoreModule.__get__('removeNonExistantMiddlewares');
            
            let resultConfig: Config.Config;

            // check if the function throws an error
            chai.expect(() => {resultConfig = removeNonExistantMiddlewares(config)}).to.not.throw();

            // check if the returned config is as expected 
            chai.expect(fsExistsStub.callCount).to.deep.eq(3, 'fs.existsSync should be called 3 times');
            chai.expect(resultConfig.middlewares.length).to.deep.eq(1, 'there should only be 1 mw left');
            chai.expect(resultConfig.middlewares[0]).to.deep.eq(configStore.middlewares[2], 'The last middleware standing should be the same as the thrid one');
        });

        it ('should remove all mws without throwing an error', () => {
            const initCoreModule = rewire('../initCore');

            fsExistsStub.returns(false);

            const removeNonExistantMiddlewares = initCoreModule.__get__('removeNonExistantMiddlewares');
            
            let resultConfig: Config.Config;

            // check if the function throws an error
            chai.expect(() => {resultConfig = removeNonExistantMiddlewares(config)}).to.not.throw();

            // check if the returned config is as expected 
            chai.expect(fsExistsStub.callCount).to.deep.eq(3, 'fs.existsSync should be called 3 times');
            chai.expect(resultConfig.middlewares.length).to.deep.eq(0, 'there should no mw left');
        });

        it ('should throw an error if a link is undefined', () => {
            const initCoreModule = rewire('../initCore');

            // set the links to undefined
            config.middlewares.forEach(mw => {
                mw.link = undefined;
            });

            const removeNonExistantMiddlewares = initCoreModule.__get__('removeNonExistantMiddlewares');

            // check if the function throws an error
            chai.expect(() => {removeNonExistantMiddlewares(config)}).to.throw();
        });

    });

});