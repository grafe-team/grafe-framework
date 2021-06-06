import 'mocha';
import rewire = require('rewire');
import Sinon = require('sinon');
import * as chai from 'chai';
import { Express } from 'express';
import { Config, Route, RoutePart } from '../src/config';

describe('initCore.ts file', () => {

    let initCoreModule = rewire('../src/initCore');

    beforeEach(() => {
        initCoreModule = rewire('../src/initCore');
    });

    describe('integrateStaticFolders function', () => {

        let integrateStaticFolders: (config: Config, express: any) => void;

        const expressUseStub = Sinon.stub();
        const pathJoinStub = Sinon.stub();
        const expressFuncStaticStub = Sinon.stub();

        const configCache: Config = {
            baseDir: '',
            middlewarePath: '',
            middlewares: [],
            projectType: '',
            routePath: '/root',
            routeTree: {},
            statics: []
        };

        let config: Config;

        const expressStub = {
            use: expressUseStub,
        };

        const pathStub = {
            join: pathJoinStub,
        };

        const expressFuncStub = {
            static: expressFuncStaticStub,
        };

        beforeEach(() => {

            config = JSON.parse(JSON.stringify(configCache));

            integrateStaticFolders = initCoreModule.__get__('integrateStaticFolders');

            initCoreModule.__set__({
                path: pathStub,
                expressFunc: expressFuncStub,
            });

            expressUseStub.reset();
            pathJoinStub.reset();
            expressFuncStaticStub.reset();
        });

        it ('should register the static folder without a prefix', () => {
            const rightFolderPath = 'right folder path';

            config.statics.push({
                folder: 'test'
            });

            expressFuncStaticStub.withArgs(rightFolderPath).returns('express static');
            pathJoinStub.withArgs(config.baseDir, 'test').returns(rightFolderPath);

            integrateStaticFolders(config, expressStub);

            chai.expect(expressUseStub.callCount).to.deep.eq(1, 'express use should only be called once');
            chai.expect(expressUseStub.lastCall.args[0]).to.deep.eq('express static', 'The right arguments should be given to the functions and no prefix should be added');
        });

        it ('should register the static folder without a prefix when prefix is empty', () => {
            const rightFolderPath = 'right folder path';

            config.statics.push({
                folder: 'test',
                prefix: '',
            });

            expressFuncStaticStub.withArgs(rightFolderPath).returns('express static');
            pathJoinStub.withArgs(config.baseDir, 'test').returns(rightFolderPath);

            integrateStaticFolders(config, expressStub);

            chai.expect(expressUseStub.callCount).to.deep.eq(1, 'express use should only be called once');
            chai.expect(expressUseStub.lastCall.args[0]).to.deep.eq('express static', 'The right arguments should be given to the functions and no prefix should be added');
        });

        it ('should register the static folder with a prefix', () => {
            const rightFolderPath = 'right folder path';

            config.statics.push({
                folder: 'test',
                prefix: '/static',
            });

            expressFuncStaticStub.withArgs(rightFolderPath).returns('express static');
            pathJoinStub.withArgs(config.baseDir, 'test').returns(rightFolderPath);

            integrateStaticFolders(config, expressStub);

            chai.expect(expressUseStub.callCount).to.deep.eq(1, 'express use should only be called once');
            chai.expect(expressUseStub.lastCall.args[0]).to.deep.eq('/static', 'the prefix should be added');
            chai.expect(expressUseStub.lastCall.args[1]).to.deep.eq('express static', 'The right arguments should be given to the functions and no prefix should be added');
        });

        it ('should add the / to the prefix if it does not exist', () => {
            config.statics.push({
                folder: 'test',
                prefix: 'static',
            });

            integrateStaticFolders(config, expressStub);

            chai.expect(expressUseStub.lastCall.args[0]).to.deep.eq('/static', 'The prefix should have a / at the first index');
        });

    });

    describe('initCore function', () => {

        const fsStub = {
            existsSync: Sinon.stub(),
            readFileSync: Sinon.stub(),
        };

        const consoleStub = {
            error: Sinon.stub(),
        };

        const pathStub = {
            parse: Sinon.stub(),
        };

        const initMiddlewaresStub = {
            initMiddlewares: Sinon.stub(),
        };

        const routesStub = {
            createRouteTree: Sinon.stub(),
        };

        const buildRoutesStub =  {
            buildRoutes: Sinon.stub(),
        };

        const integrateStaticFolders = Sinon.stub();

        let initCore: (configPath: string, express: any) => boolean;

        beforeEach(() => {
            initCore = initCoreModule.__get__('initCore');

            initCoreModule.__set__({
                fs: fsStub,
                path: pathStub,
                initMiddlewares_1: initMiddlewaresStub,
                routes_1: routesStub,
                buildRoutes_1: buildRoutesStub,
                integrateStaticFolders: integrateStaticFolders,
                console: consoleStub,
            });

            fsStub.existsSync.reset();
            fsStub.readFileSync.reset();
            consoleStub.error.reset();
            pathStub.parse.reset();
            initMiddlewaresStub.initMiddlewares.reset();
            routesStub.createRouteTree.reset();
            buildRoutesStub.buildRoutes.reset();
            integrateStaticFolders.reset();
        });

        it ('should display an error message if the grafe.json was not found', () => {
            fsStub.existsSync.returns(false);

            chai.expect(initCore('test', null), 'init Core should return false').to.be.false;
            chai.expect(fsStub.existsSync.lastCall.args[0]).to.deep.eq('test', 'existsSync should be called with the right argument');
            chai.expect(consoleStub.error.callCount).to.deep.eq(1, 'console.error should be called once');
            chai.expect(consoleStub.error.lastCall.args[0]).to.match(/test/);
        });

        it ('should display an error message if there is an error thrown during the exists check', () => {
            fsStub.existsSync.throws('test');

            chai.expect(initCore('test', null), 'init Core should return false').to.be.false;
            chai.expect(fsStub.existsSync.lastCall.args[0]).to.deep.eq('test', 'existsSync should be called with the right argument');
            chai.expect(consoleStub.error.callCount).to.deep.eq(1, 'console.error should be called once');
            chai.expect(consoleStub.error.lastCall.args[0]).to.match(/test/);
        });

        it ('should display an error when the config could not be parsed', () => {
            fsStub.existsSync.returns(true);
            fsStub.readFileSync.returns('config string');

            chai.expect(initCore('test', null), 'init Core should return false').to.be.false;
            chai.expect(fsStub.existsSync.lastCall.args[0]).to.deep.eq('test', 'existsSync should be called with the right argument');
            chai.expect(consoleStub.error.callCount).to.deep.eq(1, 'console.error should be called once');
            chai.expect(fsStub.readFileSync.callCount).to.deep.eq(1, 'readFileSync should be called once');
            chai.expect(fsStub.readFileSync.lastCall.args[0]).to.deep.eq('test', 'readfileSync should have the right parameters');
        });

        it ('should execute the utility functions in the right order', () => {
            fsStub.existsSync.returns(true);
            fsStub.readFileSync.returns('{}');
            pathStub.parse.returns({dir: null});

            chai.expect(initCore('test', 'express'), 'init Core should return true').to.be.true;
            chai.expect(fsStub.existsSync.lastCall.args[0]).to.deep.eq('test', 'existsSync should be called with the right argument');
            chai.expect(consoleStub.error.callCount).to.deep.eq(0, 'console.error should never be called');
            chai.expect(fsStub.readFileSync.callCount).to.deep.eq(1, 'readFileSync should be called once');
            chai.expect(fsStub.readFileSync.lastCall.args[0]).to.deep.eq('test', 'readfileSync should have the right parameters');
            chai.expect(pathStub.parse.callCount).to.deep.eq(1, 'path.parse should be called once');
            chai.expect(pathStub.parse.lastCall.args[0]).to.deep.eq('test', 'path.parse should be called with the configPath');
            chai.expect(initMiddlewaresStub.initMiddlewares.callCount).to.deep.eq(1, 'initMiddlewares should be called once');
            chai.expect(routesStub.createRouteTree.callCount).to.deep.eq(1, 'createRouteTree should be called once');
            chai.expect(buildRoutesStub.buildRoutes.callCount).to.deep.eq(1, 'buildRoutes should be called once');
            chai.expect(integrateStaticFolders.callCount).to.deep.eq(1, 'integrate static folders should be called once');

            chai.expect(initMiddlewaresStub.initMiddlewares.calledAfter(pathStub.parse), 'initMiddlewares should be called after path.parse').to.be.true;
            chai.expect(routesStub.createRouteTree.calledAfter(initMiddlewaresStub.initMiddlewares), 'createRouteTree should be called after initMiddlewares').to.be.true;
            chai.expect(buildRoutesStub.buildRoutes.calledAfter(routesStub.createRouteTree), 'buildRoutes should be called after createRouteTree').to.be.true;
            chai.expect(integrateStaticFolders.calledAfter(buildRoutesStub.buildRoutes), 'integarteStaticFolders should be called after buildRoutes').to.be.true; 
        })
    });

});
