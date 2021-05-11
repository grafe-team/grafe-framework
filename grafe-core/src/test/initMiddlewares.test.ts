import 'mocha';
import rewire = require('rewire');
import * as path from 'path';
import * as fs from 'fs';
import Sinon = require('sinon');
import * as Config from '../config';
import * as chai from 'chai';

describe('initMiddlewares file', () => {

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

    let fsExistsStub: Sinon.SinonStub;

    let initMwsModule: any;

    beforeEach(() => {
        // deepl clone in a costly way :)
        config = JSON.parse(JSON.stringify(configStore));

        initMwsModule = rewire('../initMiddlewares');

        fsExistsStub = Sinon.stub(fs, 'existsSync');

        initMwsModule.__set__('fs', fsExistsStub);

    });

    afterEach(() => {
        fsExistsStub.restore();
    });

    describe('createMiddlewareLinks function', () => {
        // i dont know how to say this
        it ('should create the links in the right way and not edit the config in any other way', () => {
            const createMiddlewareLinks = initMwsModule.__get__('createMiddlewareLinks');

            const result = createMiddlewareLinks(config);

            config.middlewares[0].link = path.join(config.baseDir, config.middlewarePath, 'one name', 'one');
            config.middlewares[0].link = path.join(config.baseDir, config.middlewarePath, 'second name', 'second');

            chai.expect(result).to.be.deep.equal(config);

        });

    });

    describe('removeNonExistantMiddlewares function', () => {

        let removeNonExistantMiddlewares: (config: Config.Config) => Config.Config;

        beforeEach(() => {
            removeNonExistantMiddlewares = initMwsModule.__get__('removeNonExistantMiddlewares');
        })

        it ('should remove the second an third mw without throwing an error', () => {
            fsExistsStub.onCall(0).returns(true);
            fsExistsStub.onCall(1).returns(false);
            fsExistsStub.onCall(2).returns(false);

            let resultConfig: Config.Config;

            // check if the function throws an error
            chai.expect(() => {resultConfig = removeNonExistantMiddlewares(config)}).to.not.throw();

            // check if the returned config is as expected 
            chai.expect(fsExistsStub.callCount).to.deep.eq(3, 'fs.existsSync should be called 3 times');
            chai.expect(resultConfig.middlewares.length).to.deep.eq(1, 'there should only be 1 mw left');
            chai.expect(resultConfig.middlewares[0]).to.deep.eq(configStore.middlewares[0], 'The last middleware standing should be the same as the first one');
        });

        it ('should remove the first and second mw without throwing an error', () => {
            fsExistsStub.onCall(0).returns(false);
            fsExistsStub.onCall(1).returns(false);
            fsExistsStub.onCall(2).returns(true);

            let resultConfig: Config.Config;

            // check if the function throws an error
            chai.expect(() => {resultConfig = removeNonExistantMiddlewares(config)}).to.not.throw();

            // check if the returned config is as expected 
            chai.expect(fsExistsStub.callCount).to.deep.eq(3, 'fs.existsSync should be called 3 times');
            chai.expect(resultConfig.middlewares.length).to.deep.eq(1, 'there should only be 1 mw left');
            chai.expect(resultConfig.middlewares[0]).to.deep.eq(configStore.middlewares[2], 'The last middleware standing should be the same as the thrid one');
        });

        it ('should remove all mws without throwing an error', () => {
            fsExistsStub.returns(false);

            let resultConfig: Config.Config;

            // check if the function throws an error
            chai.expect(() => {resultConfig = removeNonExistantMiddlewares(config)}).to.not.throw();

            // check if the returned config is as expected 
            chai.expect(fsExistsStub.callCount).to.deep.eq(3, 'fs.existsSync should be called 3 times');
            chai.expect(resultConfig.middlewares.length).to.deep.eq(0, 'there should no mw left');
        });

        it ('should throw an error if a link is undefined', () => {
            // set the links to undefined
            config.middlewares.forEach(mw => {
                mw.link = undefined;
            });

            // check if the function throws an error
            chai.expect(() => {removeNonExistantMiddlewares(config)}).to.throw();
        });

    });
});