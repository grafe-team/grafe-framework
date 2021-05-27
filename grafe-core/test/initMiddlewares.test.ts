import 'mocha';
import rewire = require("rewire");
import Sinon = require('sinon');
import * as chai from 'chai';
import { Config, Middleware } from '../src/config';

describe('initMiddlewares.ts file', () => {

    const configCache: Config = {
        middlewares: [],
        baseDir: '',
        middlewarePath: '',
        projectType: '',
        routePath: '',
        routeTree: undefined
    };

    let config: Config;

    let initMiddlewares = rewire('../src/initMiddlewares');

    const existsSyncStub = Sinon.stub();
    const joinStub = Sinon.stub();
    
    const fsMock = {
        existsSync: existsSyncStub
    };
    
    const pathMock = {
        join: joinStub
    };

    beforeEach(() => {
        initMiddlewares = rewire('../src/initMiddlewares');

        existsSyncStub.reset();
        joinStub.reset();

        initMiddlewares.__set__({
            path: pathMock,
            fs: fsMock
        });

        config = JSON.parse(JSON.stringify(configCache));
    });

    describe('removeNonExistantMiddleware function', () => {

        let removeNonExistantMiddleware: (config: Config, mw: Middleware) => boolean; 

        beforeEach(() => {
            removeNonExistantMiddleware = initMiddlewares.__get__('removeNonExistantMiddleware');
        });

        it ('should throw an error because mw.link is undefined', () => {

            const mw: Middleware = {
                description: '',
                link: undefined,
                name: 'name',
                value: '',
            }

            chai.expect(() => {removeNonExistantMiddleware(null, mw)}).to.throw(/name/);
        });

        it ('should not remove the middleware because it does exist', () => {

            const mw: Middleware = {
                description: '',
                link: 'root/name',
                name: 'name',
                value: '',
            }

            config.middlewares.push(mw);

            const configResult = JSON.parse(JSON.stringify(config)); 

            existsSyncStub.withArgs(mw.link).returns(true);

            let result: boolean;

            chai.expect(() => {
                result = removeNonExistantMiddleware(config, mw);
            }).to.not.throw();
            chai.expect(result, 'return value should be true').to.be.false;
            chai.expect(config).to.deep.eq(configResult);
        });

        it ('should remove the middleware because it does not exist', () => {
            const mw: Middleware = {
                description: '',
                link: 'root/name',
                name: 'name',
                value: '',
            }

            const configResult = JSON.parse(JSON.stringify(config)); 
            
            config.middlewares.push(mw);

            existsSyncStub.withArgs(mw.link).returns(false);

            let result: boolean;

            chai.expect(() => {
                result = removeNonExistantMiddleware(config, mw);
            }).to.not.throw();
            chai.expect(result, 'return value should be true').to.be.true;
            chai.expect(config).to.deep.eq(configResult);
        });

    });

    describe('createMiddlewareLinks function', () => {

        let createMiddlewareLinks: (config: Config, mw: Middleware) => Config;

        beforeEach(() => {
            createMiddlewareLinks = initMiddlewares.__get__('createMiddlewareLinks');
        });

        it ('should build the link correctly', () => {

            config.baseDir = 'root';
            config.middlewarePath = 'mw';
            
            const mw: Middleware = {
                description: '',
                link: '',
                name: 'name',
                value: 'n',
            };

            joinStub.withArgs(config.baseDir, config.middlewarePath, mw.value, mw.name + '.js').returns('right');

            createMiddlewareLinks(config, mw);

            chai.expect(mw.link).to.deep.eq('right');
        });
    
        it ('should not edit the config', () => {
            const resultConfig = JSON.parse(JSON.stringify(config));

            const mw: Middleware = {
                description: '',
                link: '',
                name: 'name',
                value: 'n',
            };

            const res = createMiddlewareLinks(config, mw);

            chai.expect(resultConfig).to.deep.eq(config);
            chai.expect(resultConfig).to.deep.eq(res);
        });

    });

    describe('initMiddlewares function', () => {

        let initMiddlewaresFunc: (config: Config) => void;
        
        const requireStub = Sinon.stub();
        const createMiddlewareLinksStub = Sinon.stub();
        const removeNonExistantMiddlewareStub = Sinon.stub();

        beforeEach(() => {
            initMiddlewaresFunc = initMiddlewares.__get__('initMiddlewares');
        
            requireStub.reset();

            initMiddlewares.__set__({
                require: requireStub,
                createMiddlewareLinks: createMiddlewareLinksStub,
                removeNonExistantMiddleware: removeNonExistantMiddlewareStub
            });

            removeNonExistantMiddlewareStub.reset();
            createMiddlewareLinksStub.reset();
        });

        it ('should load the function', () => {

            const mw: Middleware = {
                description: '',
                link: '',
                name: 'name',
                value: 'n',
            };

            config.middlewares.push(mw);

            requireStub.returns('function');
            
            initMiddlewaresFunc(config);

            chai.expect(createMiddlewareLinksStub.callCount).to.deep.eq(1);
            chai.expect(removeNonExistantMiddlewareStub.callCount).to.deep.eq(1);
            chai.expect(requireStub.callCount).to.deep.eq(1);

            chai.expect(requireStub.lastCall.args[0]).to.deep.eq(mw.link);

            chai.expect(createMiddlewareLinksStub.lastCall.args[0]).to.deep.eq(config);
            chai.expect(createMiddlewareLinksStub.lastCall.args[1]).to.deep.eq(config.middlewares[0]);

            chai.expect(removeNonExistantMiddlewareStub.lastCall.args[0]).to.deep.eq(config);
            chai.expect(removeNonExistantMiddlewareStub.lastCall.args[1]).to.deep.eq(config.middlewares[0]);

            chai.expect(config.middlewares[0].func).to.deep.eq('function');
        });

        it ('should not skip a middleware if one got removed', () => {
            const mw1: Middleware = {
                description: '',
                link: '',
                name: 'name1',
                value: 'n1',
            };

            const mw2: Middleware = {
                description: '',
                link: '',
                name: 'name2',
                value: 'n2',
            };

            const mw3: Middleware = {
                description: '',
                link: '',
                name: 'name3',
                value: 'n3',
            };

            config.middlewares.push(mw1);
            config.middlewares.push(mw2);
            config.middlewares.push(mw3);

            removeNonExistantMiddlewareStub.onFirstCall().callsFake(function fake() {
                config.middlewares.splice(0, 1);
                return true;
            });
            removeNonExistantMiddlewareStub.onSecondCall().returns(false);
            removeNonExistantMiddlewareStub.onThirdCall().returns(false);

            initMiddlewaresFunc(config);

            chai.expect(config.middlewares.length).to.deep.eq(2);
            chai.expect(removeNonExistantMiddlewareStub.callCount).to.deep.eq(3);
            chai.expect(createMiddlewareLinksStub.callCount).to.deep.eq(3);

            chai.expect(config.middlewares).to.include.members([mw2, mw3]);
        });

    });

});
