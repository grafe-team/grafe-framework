import 'mocha';
import rewire = require('rewire');
import Sinon = require('sinon');
import * as chai from 'chai';
import { Express } from 'express';
import { Config, Route, RoutePart } from '../src/config';

/* eslint @typescript-eslint/no-empty-function: "off" */

describe('buildRoutes file', () => {
    let buildRoutes = rewire('../src/buildRoutes');

    beforeEach(() => {
        buildRoutes = rewire('../src/buildRoutes');
    });

    describe('registerRoute function', () => {
        const expressGetStub = Sinon.stub();

        const expressStub = {
            get: expressGetStub,
        };

        const requireStub = Sinon.stub();

        let registerRoute: (
            route: Route,
            prevRoutePath: string,
            express: any
        ) => void;

        beforeEach(() => {
            registerRoute = buildRoutes.__get__('registerRoute');

            buildRoutes.__set__({
                require: requireStub,
            });

            expressGetStub.reset();
            requireStub.reset();
        });

        it('should register the route without middlewares. It should also stich togethter the route and the route.endpoint', () => {
            const funct = () => {};

            requireStub.returns(funct);

            const route: Route = {
                endpoint: 'test',
                method: 'get',
                middlewares: [],
            };

            registerRoute(route, '/', expressStub);

            chai.expect(expressGetStub.callCount).to.deep.eq(
                1,
                'Expexct express.get to be called once'
            );
            chai.expect(requireStub.callCount).to.deep.eq(
                1,
                'Expect require to be called once'
            );
            chai.expect(expressGetStub.lastCall.args[0]).to.deep.eq(
                '/test',
                'Expect the route to equal /test'
            );
            chai.expect(expressGetStub.lastCall.args[1]).to.deep.eq(
                funct,
                'Expect the route uses the right function'
            );
        });

        it('should register the route without middlewares. It should also not stich togethter the route and the route.endpoint', () => {
            const funct = () => {};

            requireStub.returns(funct);

            const route: Route = {
                endpoint: 'test',
                method: 'get',
                middlewares: [],
            };

            registerRoute(route, '/test', expressStub);

            chai.expect(expressGetStub.callCount).to.deep.eq(
                1,
                'Expexct express.get to be called once'
            );
            chai.expect(requireStub.callCount).to.deep.eq(
                1,
                'Expect require to be called once'
            );
            chai.expect(expressGetStub.lastCall.args[0]).to.deep.eq(
                '/test',
                'Expect the route to equal /test'
            );
            chai.expect(expressGetStub.lastCall.args[1]).to.deep.eq(
                funct,
                'Expect the route uses the right function'
            );
        });

        it('should register the route with middlewares.', () => {
            const funct = () => {};

            requireStub.returns(funct);

            const route: Route = {
                endpoint: 'test',
                method: 'get',
                middlewares: [
                    {
                        description: '',
                        link: '',
                        name: '',
                        value: '',

                        /* eslint-disable */
            // @ts-ignore
            func: 'function1',
            /* eslint-enable */
                    },
                    {
                        description: '',
                        link: '',
                        name: '',
                        value: '',
                        /* eslint-disable */
            // @ts-ignore
            func: 'function2',
            /* eslint-enable */
                    },
                ],
            };

            registerRoute(route, '/test', expressStub);

            chai.expect(expressGetStub.callCount).to.deep.eq(1);
            chai.expect(expressGetStub.lastCall.args[0]).to.deep.eq('/test');
            chai.expect(expressGetStub.lastCall.args[1]).to.deep.eq(
                'function1'
            );
            chai.expect(expressGetStub.lastCall.args[2]).to.deep.eq(
                'function2'
            );
            chai.expect(expressGetStub.lastCall.args[3]).to.deep.eq(funct);
        });
    });

    describe('buildRoutePart function', () => {
        let buildRoutePart: (
            routePart: RoutePart,
            route: string,
            express: Express
        ) => void;

        const registerRouteStub = Sinon.stub();

        beforeEach(() => {
            buildRoutePart = buildRoutes.__get__('buildRoutePart');

            buildRoutes.__set__({
                registerRoute: registerRouteStub,
            });

            registerRouteStub.reset();
        });

        it('should try and register a route', () => {
            const routePart: RoutePart = {
                test: {
                    method: 'get',
                    endpoint: 'test',
                    middlewares: [],
                },
            };

            buildRoutePart(routePart, '/', undefined);

            chai.expect(registerRouteStub.callCount).to.deep.eq(1);
            chai.expect(registerRouteStub.lastCall.args[0]).to.deep.eq(
                routePart.test
            );
            chai.expect(registerRouteStub.lastCall.args[1]).to.deep.eq('/');
            chai.expect(registerRouteStub.lastCall.args[2]).to.be.undefined;
        });

        it('should got deeper into the tree and register a route', () => {
            const routePart: RoutePart = {
                test: {
                    test: {
                        method: 'get',
                        endpoint: 'test',
                        middlewares: [],
                    },
                },
            };

            buildRoutePart(routePart, '/', undefined);

            chai.expect(registerRouteStub.callCount).to.deep.eq(1);
            chai.expect(registerRouteStub.lastCall.args[0]).to.deep.eq(
                routePart.test.test
            );
            chai.expect(registerRouteStub.lastCall.args[1]).to.deep.eq(
                '/test/'
            );
            chai.expect(registerRouteStub.lastCall.args[2]).to.be.undefined;
        });

        it('should register both routes', () => {
            const routePart: RoutePart = {
                test: {
                    test: {
                        method: 'get',
                        endpoint: 'test',
                        middlewares: [],
                    },
                },
                test2: {
                    method: 'get',
                    endpoint: 'test2',
                    middlewares: [],
                },
            };

            buildRoutePart(routePart, '/', undefined);

            chai.expect(registerRouteStub.callCount).to.deep.eq(2);

            chai.expect(registerRouteStub.lastCall.args[0]).to.deep.eq(
                routePart.test2
            );
            chai.expect(registerRouteStub.lastCall.args[1]).to.deep.eq('/');
            chai.expect(registerRouteStub.lastCall.args[2]).to.be.undefined;

            chai.expect(registerRouteStub.firstCall.args[0]).to.deep.eq(
                routePart.test.test
            );
            chai.expect(registerRouteStub.firstCall.args[1]).to.deep.eq(
                '/test/'
            );
            chai.expect(registerRouteStub.firstCall.args[2]).to.be.undefined;
        });
    });

    describe('buildRoutes function', () => {
        let buildRoutesFunc: (config: Config, express: Express) => void;

        const buildRoutePartStub = Sinon.stub();

        beforeEach(() => {
            buildRoutesFunc = buildRoutes.__get__('buildRoutes');

            buildRoutes.__set__({
                buildRoutePart: buildRoutePartStub,
            });

            buildRoutePartStub.reset();
        });

        it('should call the buildRoutePart function', () => {
            const config: Config = {
                baseDir: '',
                middlewarePath: '',
                middlewares: [],
                projectType: '',
                routePath: '',
                statics: [],
                routeTree: undefined,
            };

            buildRoutesFunc(config, null);

            chai.expect(buildRoutePartStub.callCount).to.deep.eq(1);
            chai.expect(buildRoutePartStub.lastCall.args[1]).to.deep.eq('/');
        });
    });
});
