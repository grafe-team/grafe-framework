import 'mocha';
import { Config, Middleware, Route, RoutePart } from '../src/config';
import { FileInfo } from '../src/file';
import rewire = require('rewire');
import Sinon = require('sinon');
import * as chai from 'chai';

describe('routes.ts file', () => {
    let routes = rewire('../src/routes');

    const allMiddlewaresCache: Middleware[] = [
        {
            description: '',
            link: 'filePath1',
            name: 'middleware 1',
            value: 'mw1',
        },
        {
            description: '',
            link: 'filePath2',
            name: 'middleware 2',
            value: 'mw2',
        },
    ];

    let allMiddlewares: Middleware[];

    beforeEach(() => {
        // copy cache into test value
        allMiddlewares = JSON.parse(JSON.stringify(allMiddlewaresCache));

        routes = rewire('../src/routes');
    });

    describe('populateMiddlewares function', () => {
        const consoleWarnStub = Sinon.stub();

        let populateMiddlewares: (
            mws: string[],
            allMiddlewares: Middleware[]
        ) => Middleware[] = routes.__get__('populateMiddlewares');

        beforeEach(() => {
            consoleWarnStub.resetHistory();
            consoleWarnStub.resetBehavior();

            routes.__set__({
                console: {
                    warn: consoleWarnStub,
                },
            });

            populateMiddlewares = routes.__get__('populateMiddlewares');
        });

        it('should populate the middlewares correctly without logging an error', () => {
            const middlewares = populateMiddlewares(
                ['mw1', 'mw2'],
                allMiddlewares
            );

            chai.expect(consoleWarnStub.callCount).to.deep.eq(
                0,
                'console.warn should not be called'
            );
            chai.expect(middlewares).to.contain.members(
                allMiddlewares,
                'middlwares should have the same members as allMiddlewares'
            );
        });

        it('should populate the middlewars corretly but log a warning because one mw does not exist', () => {
            const middlewares = populateMiddlewares(
                ['mw1', 'mw3'],
                allMiddlewares
            );

            chai.expect(consoleWarnStub.callCount).to.deep.eq(
                1,
                'console.warn should be called once'
            );
            chai.expect(middlewares).to.contain(
                allMiddlewares[0],
                'middlwares should only contain the first mw'
            );
        });

        it('should populate the middlewars corretly but log a warning because one mw is ambiguous not exist', () => {
            allMiddlewares.push(allMiddlewares[1]);

            const middlewares = populateMiddlewares(
                ['mw1', 'mw2'],
                allMiddlewares
            );

            chai.expect(consoleWarnStub.callCount).to.deep.eq(
                1,
                'console.warn should be called once'
            );
            chai.expect(middlewares).to.contain(
                allMiddlewares[0],
                'middlwares should only contain the first mw'
            );
        });

        it('should return an empty array if no mws are specified', () => {
            const middlewares = populateMiddlewares([], allMiddlewares);

            chai.expect(consoleWarnStub.callCount).to.deep.eq(
                0,
                'console.warn should not be called'
            );
            chai.expect(middlewares.length).to.deep.eq(
                0,
                'middlewares should be empty'
            );
        });
    });

    describe('parseFileName function', () => {
        let parseFileName: (
            fileName: string,
            inheritedMws: Middleware[],
            allMiddlewares: Middleware[]
        ) => { route: Route; ignored: boolean };

        const populateMiddlewaresStub = Sinon.stub();
        const parseRestMethodFromStringStub = Sinon.stub();
        const combineMiddlewareArraysStub = Sinon.stub();

        beforeEach(() => {
            parseFileName = routes.__get__('parseFileName');

            populateMiddlewaresStub.resetBehavior();
            populateMiddlewaresStub.resetHistory();

            parseRestMethodFromStringStub.resetBehavior();
            parseRestMethodFromStringStub.resetHistory();

            combineMiddlewareArraysStub.resetBehavior();
            combineMiddlewareArraysStub.resetHistory();

            populateMiddlewaresStub.returns([]);

            routes.__set__({
                populateMiddlewares: populateMiddlewaresStub,
                parseRestMethodFromString: parseRestMethodFromStringStub,
                combineMiddlewareArrays: combineMiddlewareArraysStub,
            });
        });

        it('should idicate that it ignores files that start with an "_"', () => {
            const response = parseFileName('_ignore.js', [], []);

            chai.expect(response.ignored).to.deep.eq(
                true,
                'File should be marked as ignored'
            );
            chai.expect(populateMiddlewaresStub.callCount).to.deep.eq(
                0,
                'populateMiddlewares should not be called'
            );
            chai.expect(parseRestMethodFromStringStub.callCount).to.deep.eq(
                0,
                'parseResMethodFromString should not be called'
            );
        });

        it('should not ignore the file and create the endpoint for the function and call all neccessary functions', () => {
            const response = parseFileName('test.post.js', [], allMiddlewares);

            chai.expect(response.ignored).to.deep.eq(
                false,
                'The file should not be ignored'
            );
            chai.expect(response.route.endpoint).to.deep.eq(
                'test',
                'The endpoint for the route should eq "test"'
            );
            chai.expect(populateMiddlewaresStub.callCount).to.deep.eq(
                1,
                'populateMiddlewares should be called once'
            );
            chai.expect(parseRestMethodFromStringStub.callCount).to.deep.eq(
                1,
                'parseRestMethodFromString should be called once'
            );
        });

        it('should throw an error because the fileName is to short', () => {
            chai.expect(() => {
                parseFileName('test.js', [], allMiddlewares);
            }).to.throw(
                /method/,
                'parseFileName should throw an error because the file does not provide a method. The throw message should at least include the word "method"'
            );
        });

        it('should properly combine the inherited middlewares with the parsed ones', () => {
            populateMiddlewaresStub.returns(allMiddlewares);
            combineMiddlewareArraysStub
                .withArgs(allMiddlewares, allMiddlewares)
                .returns(allMiddlewares);

            const result = parseFileName(
                'test.post.js',
                allMiddlewares,
                allMiddlewares
            );

            chai.expect(result.route.middlewares).to.deep.eq(
                allMiddlewares,
                'After the array was combined the array should not be edited anymore'
            );
            chai.expect(combineMiddlewareArraysStub.callCount).to.deep.eq(
                1,
                'combineMiddlewareArrays should be used to combine the arrays'
            );
        });

        it('should thrown an error because the rest method was not found', () => {
            parseRestMethodFromStringStub.returns('none');

            chai.expect(() => {
                parseFileName('test.test.js', [], allMiddlewares);
            }).to.throw(
                /Rest Method test/,
                'parseFileName should throw an error because the rest method was not found. In the error message there should be: Rest Method [methodname provided]'
            );
        });

        it('should return the right rest method', () => {
            parseRestMethodFromStringStub.withArgs('post').returns('post');

            const result = parseFileName('test.post.js', [], allMiddlewares);

            chai.expect(result.route.method).to.deep.eq(
                'post',
                'The returned rest method should be the same as returned from parseRestMethodFromString'
            );
            chai.expect(parseRestMethodFromStringStub.callCount).to.deep.eq(
                1,
                'parseRestMethodFromString should be called once'
            );
        });

        it('should add middlewares added in the filename', () => {
            parseFileName('mw1.test.post.js', [], allMiddlewares);

            chai.expect(
                populateMiddlewaresStub.calledWith(Sinon.match(['mw1']))
            ).to.deep.eq(
                true,
                'Expect populate Middlewars to have been called with "mw1"'
            );
        });

        it('should add middlewares added in the filename with multible middlewares', () => {
            parseFileName('mw1.mw2.mw3.test.post.js', [], allMiddlewares);

            chai.expect(
                populateMiddlewaresStub.calledWith(
                    Sinon.match(['mw1', 'mw2', 'mw3'])
                )
            ).to.deep.eq(
                true,
                'Expect populate Middlewars to have been called with ["mw1", "mw2", "mw3"]'
            );
        });
    });

    describe('combineMiddlewareArrays function', () => {
        const allMiddlewaresCache: Middleware[] = [
            {
                description: '',
                link: 'filePath1',
                name: 'middleware 1',
                value: 'mw1',
            },
            {
                description: '',
                link: 'filePath2',
                name: 'middleware 2',
                value: 'mw2',
            },
        ];

        let allMiddlewares: Middleware[];

        let combineMiddlewareArrays: (
            array1: Middleware[],
            array2: Middleware[]
        ) => Middleware[];

        beforeEach(() => {
            combineMiddlewareArrays = routes.__get__('combineMiddlewareArrays');

            allMiddlewares = JSON.parse(JSON.stringify(allMiddlewaresCache));
        });

        it('should combine both arrays without duplicating elements', () => {
            const combinedArray = combineMiddlewareArrays(
                allMiddlewares,
                allMiddlewares
            );

            chai.expect(combinedArray.length).to.deep.eq(
                2,
                'The combined array should only have 2 elements'
            );
            chai.expect(combinedArray).to.have.members(
                allMiddlewares,
                'The combined array should have the same elements as allMiddlewares'
            );
        });

        it('should combine both arrays', () => {
            const combinedArray = combineMiddlewareArrays(
                [allMiddlewares[0]],
                [allMiddlewares[1]]
            );

            chai.expect(combinedArray.length).to.deep.eq(
                2,
                'The combined array should have a length of 2'
            );
            chai.expect(combinedArray).to.have.members(
                allMiddlewares,
                'The combined array should have the same elements as allMiddlewares'
            );
        });

        it('should not edit the original arrays', () => {
            const array1Cache = [allMiddlewares[0]];
            const array2Cache = [allMiddlewares[1]];

            const array1 = JSON.parse(JSON.stringify(array1Cache));
            const array2 = JSON.parse(JSON.stringify(array2Cache));

            combineMiddlewareArrays(array1, array2);

            chai.expect(array1).to.deep.eq(
                array1Cache,
                'The first array should not be edited'
            );
            chai.expect(array2).to.deep.eq(
                array2Cache,
                'The second array should not be edited'
            );
        });
    });

    describe('parseRestMethodFromString function', () => {
        let parseRestMethodFromString: (
            stringMethod: string
        ) => 'post' | 'get' | 'put' | 'delete' | 'none';

        beforeEach(() => {
            parseRestMethodFromString = routes.__get__(
                'parseRestMethodFromString'
            );
        });

        it('should return "none" if the method was not found', () => {
            const res = parseRestMethodFromString('test');

            chai.expect(res).to.deep.eq('none');
        });

        it('should not edit the original string', () => {
            const stringCache = 'post';
            const string = JSON.parse(JSON.stringify(stringCache));

            parseRestMethodFromString(string);

            chai.expect(string).to.deep.eq(
                stringCache,
                'The orignial string should not be edited'
            );
        });

        it('should trim the incomming string so it is more error resistant', () => {
            const stringCache = '   post    ';
            const string = JSON.parse(JSON.stringify(stringCache));

            const res = parseRestMethodFromString(string);

            chai.expect(res).to.deep.eq(
                'post',
                'It should still equal "post" because there are is only whitespace around it'
            );
        });

        it('should return the right rest method', () => {
            chai.expect(parseRestMethodFromString('post')).to.deep.eq('post');
            chai.expect(parseRestMethodFromString('get')).to.deep.eq('get');
            chai.expect(parseRestMethodFromString('put')).to.deep.eq('put');
            chai.expect(parseRestMethodFromString('delete')).to.deep.eq(
                'delete'
            );
        });
    });

    describe('parseDirectoryName function', () => {
        const allMiddlewaresCache: Middleware[] = [
            {
                description: '',
                link: 'filePath1',
                name: 'middleware 1',
                value: 'mw1',
            },
            {
                description: '',
                link: 'filePath2',
                name: 'middleware 2',
                value: 'mw2',
            },
        ];

        let allMiddlewares: Middleware[];

        let parseDirectoryName: (
            directoryName: string,
            inheritedMiddlewares: Middleware[],
            allMiddlewares: Middleware[]
        ) => { ignored: boolean; middlewares: Middleware[]; route: string };

        const populateMiddlewaresStub = Sinon.stub();
        const combineMiddlewareArraysStub = Sinon.stub();

        beforeEach(() => {
            allMiddlewares = JSON.parse(JSON.stringify(allMiddlewaresCache));

            parseDirectoryName = routes.__get__('parseDirectoryName');
            routes.__set__({
                populateMiddlewares: populateMiddlewaresStub,
                combineMiddlewareArrays: combineMiddlewareArraysStub,
            });

            populateMiddlewaresStub.resetHistory();
            populateMiddlewaresStub.resetBehavior();

            combineMiddlewareArraysStub.resetHistory();
            combineMiddlewareArraysStub.resetBehavior();
        });

        it('should ignore the directory that starts with an "_"', () => {
            const res = parseDirectoryName('_test', [], []);

            chai.expect(res.ignored).to.be.true;
            chai.expect(res.middlewares.length).to.deep.eq(0);
            chai.expect(res.route).to.deep.eq('');
        });

        it('should return the routename', () => {
            const res = parseDirectoryName('test', [], []);

            chai.expect(res.ignored).to.be.false;
            chai.expect(res.route).to.eq('test');
            chai.expect(res.middlewares.length).to.deep.eq(0);
        });

        it('should replace the % with a :', () => {
            const res = parseDirectoryName('%test', [], []);

            chai.expect(res.ignored).to.be.false;
            chai.expect(res.route).to.deep.eq(':test');
            chai.expect(res.middlewares.length).to.deep.eq(0);
        });

        it('should detect the middlewares and return them', () => {
            combineMiddlewareArraysStub.returns(allMiddlewares);

            const res = parseDirectoryName('_mw.mw1.mw2', [], allMiddlewares);

            chai.expect(res.ignored).to.be.false;
            chai.expect(res.route).to.deep.eq('');
            chai.expect(res.middlewares.length).to.deep.eq(2);

            chai.expect(combineMiddlewareArraysStub.callCount).to.deep.eq(1);
            chai.expect(populateMiddlewaresStub.callCount).to.deep.eq(1);
            chai.expect(
                combineMiddlewareArraysStub.calledAfter(populateMiddlewaresStub)
            ).to.be.true;
        });
    });

    describe('_createRouteTree function', () => {
        let _createRouteTree: (
            parseDir: string,
            routePart: RoutePart,
            inheritedMiddlewares: Middleware[],
            allMiddlewares: Middleware[],
            routPartAbove: RoutePart
        ) => void;

        const parseDirectoryNameStub = Sinon.stub();
        const readAllFilesStatsStub = Sinon.stub();
        const parseFileNameStub = Sinon.stub();

        const consoleErrorStub = Sinon.stub();

        const routePartCache: RoutePart = {};
        let routePart: RoutePart;

        beforeEach(() => {
            _createRouteTree = routes.__get__('_createRouteTree');

            routePart = JSON.parse(JSON.stringify(routePartCache));

            routes.__set__({
                parseDirectoryName: parseDirectoryNameStub,
                parseFileName: parseFileNameStub,
            });

            routes.__set__({
                console: {
                    error: consoleErrorStub,
                },
            });

            // need to do this this way because typescirpt changes the name
            // there is probably a better way for this
            routes.__set__('file_1', {
                readAllFilesStats: readAllFilesStatsStub,
            });

            parseDirectoryNameStub.resetHistory();
            parseDirectoryNameStub.resetBehavior();

            readAllFilesStatsStub.resetHistory();
            readAllFilesStatsStub.resetBehavior();

            parseFileNameStub.resetHistory();
            parseFileNameStub.resetBehavior();
        });

        it('should try and parse the file name and add the route to the routeTree', () => {
            const fileInfo: FileInfo[] = [
                {
                    isDirectory: false,
                    isFile: true,
                    name: 'fileName.post.js',
                    path: '/var/fileName.post.js',
                },
            ];

            const route: Route = {
                endpoint: 'fileName',
                method: 'post',
                middlewares: [],
            };

            const parseInfo = {
                route: route,
                ignored: false,
            };

            const routePart: any = {};

            readAllFilesStatsStub.returns(fileInfo);
            parseFileNameStub.returns(parseInfo);

            _createRouteTree('test', routePart, [], [], {});

            chai.expect(readAllFilesStatsStub.callCount).to.deep.eq(1);
            chai.expect(parseFileNameStub.callCount).to.deep.eq(1);
            chai.expect(parseDirectoryNameStub.callCount).to.deep.eq(0);
            chai.expect(routePart).to.have.key('fileName');
            chai.expect(routePart.fileName).to.deep.eq(route);

            chai.expect(parseFileNameStub.lastCall.args[0]).to.deep.eq(
                fileInfo[0].name
            );
            chai.expect(parseFileNameStub.lastCall.args[1]).to.deep.eq([]);
            chai.expect(parseFileNameStub.lastCall.args[2]).to.deep.eq([]);

            chai.expect(readAllFilesStatsStub.lastCall.args[0]).to.deep.eq(
                'test'
            );
        });

        it('should try and parse the file name and add the route to the routeTree but add it as a "." because the above attrubte has the same name', () => {
            const fileInfo: FileInfo[] = [
                {
                    isDirectory: false,
                    isFile: true,
                    name: 'fileName.post.js',
                    path: '/var/fileName.post.js',
                },
            ];

            const route: Route = {
                endpoint: 'fileName',
                method: 'post',
                middlewares: [],
            };

            const parseInfo = {
                route: route,
                ignored: false,
            };

            const routePart: any = {};

            readAllFilesStatsStub.returns(fileInfo);
            parseFileNameStub.returns(parseInfo);

            _createRouteTree('test', routePart, [], [], { fileName: {} });

            chai.expect(readAllFilesStatsStub.callCount).to.deep.eq(1);
            chai.expect(parseFileNameStub.callCount).to.deep.eq(1);
            chai.expect(parseDirectoryNameStub.callCount).to.deep.eq(0);
            chai.expect(routePart).to.have.key('.');
            chai.expect(routePart['.']).to.deep.eq(route);

            chai.expect(parseFileNameStub.lastCall.args[0]).to.deep.eq(
                fileInfo[0].name
            );
            chai.expect(parseFileNameStub.lastCall.args[1]).to.deep.eq([]);
            chai.expect(parseFileNameStub.lastCall.args[2]).to.deep.eq([]);

            chai.expect(readAllFilesStatsStub.lastCall.args[0]).to.deep.eq(
                'test'
            );
        });

        it('should ignore the file if it is nether a directory or a file', () => {
            const fileInfo: FileInfo[] = [
                {
                    isDirectory: false,
                    isFile: false,
                    name: 'fileName.post.js',
                    path: '/var/fileName.post.js',
                },
            ];

            readAllFilesStatsStub.returns(fileInfo);

            _createRouteTree('test', routePart, [], [], {});

            chai.expect(parseDirectoryNameStub.callCount).to.deep.eq(
                0,
                'parseDirectory should not be called because it is not a directory'
            );
            chai.expect(parseFileNameStub.callCount).to.deep.eq(
                0,
                'parseFileName should not be called because it is not a file'
            );
        });

        it('should ignore the file and not add it to the route tree', () => {
            const fileInfo: FileInfo[] = [
                {
                    isDirectory: false,
                    isFile: true,
                    name: 'fileName.post.js',
                    path: '/var/fileName.post.js',
                },
            ];

            const parseInfo = {
                ignored: true,
            };

            readAllFilesStatsStub.returns(fileInfo);
            parseFileNameStub.returns(parseInfo);

            _createRouteTree('test', routePart, [], [], {});

            chai.expect(readAllFilesStatsStub.callCount).to.deep.eq(1);
            chai.expect(parseFileNameStub.callCount).to.deep.eq(1);
            chai.expect(parseDirectoryNameStub.callCount).to.deep.eq(0);
            chai.expect(routePart).to.not.have.key('fileName');

            chai.expect(parseFileNameStub.lastCall.args[0]).to.deep.eq(
                fileInfo[0].name
            );
            chai.expect(parseFileNameStub.lastCall.args[1]).to.deep.eq([]);
            chai.expect(parseFileNameStub.lastCall.args[2]).to.deep.eq([]);

            chai.expect(readAllFilesStatsStub.lastCall.args[0]).to.deep.eq(
                'test'
            );
        });

        it('should not add new node to the route tree becuase the directory only adds middlewares', () => {
            const fileInfo: FileInfo[] = [
                {
                    isDirectory: true,
                    isFile: false,
                    name: 'dirName',
                    path: '/root/dirName',
                },
            ];

            const parseInfo = {
                ignored: false,
                middlewares: ['test'],
                route: '',
            };

            readAllFilesStatsStub.onFirstCall().returns(fileInfo);
            readAllFilesStatsStub.onSecondCall().returns(fileInfo);
            readAllFilesStatsStub.onThirdCall().returns([]);
            parseDirectoryNameStub.returns(parseInfo);

            _createRouteTree('test', routePart, [], [], {});

            chai.expect(readAllFilesStatsStub.callCount).to.deep.eq(3);
            chai.expect(parseFileNameStub.callCount).to.deep.eq(0);
            chai.expect(parseDirectoryNameStub.callCount).to.deep.eq(2);
            chai.expect(routePart).to.not.have.key('dirName');

            chai.expect(parseDirectoryNameStub.firstCall.args[0]).to.deep.eq(
                fileInfo[0].name
            );
            chai.expect(parseDirectoryNameStub.firstCall.args[1]).to.deep.eq(
                []
            );
            chai.expect(parseDirectoryNameStub.firstCall.args[2]).to.deep.eq(
                []
            );

            chai.expect(parseDirectoryNameStub.lastCall.args[0]).to.deep.eq(
                fileInfo[0].name
            );
            chai.expect(parseDirectoryNameStub.lastCall.args[1]).to.deep.eq([
                'test',
            ]);
            chai.expect(parseDirectoryNameStub.lastCall.args[2]).to.deep.eq([]);

            chai.expect(readAllFilesStatsStub.lastCall.args[0]).to.deep.eq(
                '/root/dirName'
            );

            chai.expect(readAllFilesStatsStub.secondCall.args[0]).to.deep.eq(
                '/root/dirName'
            );
        });

        it('should ignore the directory and not add it to the route tree', () => {
            const fileInfo: FileInfo[] = [
                {
                    isDirectory: true,
                    isFile: false,
                    name: 'dirName',
                    path: '/var/dirName',
                },
            ];

            const parseInfo = {
                ignored: true,
            };

            readAllFilesStatsStub.returns(fileInfo);
            parseDirectoryNameStub.returns(parseInfo);

            _createRouteTree('test', routePart, [], [], {});

            chai.expect(readAllFilesStatsStub.callCount).to.deep.eq(1);
            chai.expect(parseFileNameStub.callCount).to.deep.eq(0);
            chai.expect(parseDirectoryNameStub.callCount).to.deep.eq(1);
            chai.expect(routePart).to.not.have.key('dirName');

            chai.expect(parseDirectoryNameStub.lastCall.args[0]).to.deep.eq(
                fileInfo[0].name
            );
            chai.expect(parseDirectoryNameStub.lastCall.args[1]).to.deep.eq([]);
            chai.expect(parseDirectoryNameStub.lastCall.args[2]).to.deep.eq([]);

            chai.expect(readAllFilesStatsStub.lastCall.args[0]).to.deep.eq(
                'test'
            );
        });

        it('should parse the directory and insert it into the route tree', () => {
            const fileInfo: FileInfo[] = [
                {
                    isDirectory: true,
                    isFile: false,
                    name: 'dirName',
                    path: '/var/dirName',
                },
            ];

            const parseInfo = {
                ignored: false,
                route: 'dirName',
                middlewares: ['test'],
            };

            readAllFilesStatsStub.onFirstCall().returns(fileInfo);
            readAllFilesStatsStub.onSecondCall().returns([]);
            parseDirectoryNameStub.returns(parseInfo);

            _createRouteTree('test', routePart, [], [], {});

            chai.expect(readAllFilesStatsStub.callCount).to.deep.eq(2);
            chai.expect(parseFileNameStub.callCount).to.deep.eq(0);
            chai.expect(parseDirectoryNameStub.callCount).to.deep.eq(1);
            chai.expect(routePart).to.have.key('dirName');
            chai.expect(routePart.dirName).to.deep.eq({});

            chai.expect(parseDirectoryNameStub.lastCall.args[0]).to.deep.eq(
                fileInfo[0].name
            );
            chai.expect(parseDirectoryNameStub.lastCall.args[1]).to.deep.eq([]);
            chai.expect(parseDirectoryNameStub.lastCall.args[2]).to.deep.eq([]);

            chai.expect(readAllFilesStatsStub.firstCall.args[0]).to.deep.eq(
                'test'
            );
            chai.expect(readAllFilesStatsStub.lastCall.args[0]).to.deep.eq(
                '/var/dirName'
            );
        });

        it('should print an error message when an error was thrown in the parseFileName function and move on', () => {
            const fileInfo: FileInfo[] = [
                {
                    isDirectory: false,
                    isFile: true,
                    name: 'fileName.post.js',
                    path: '/var/fileName.post.js',
                },
            ];

            readAllFilesStatsStub.returns(fileInfo);
            parseFileNameStub.throws('error');

            chai.expect(() => {
                _createRouteTree('test', routePart, [], [], {});
            }).to.not.throw();

            chai.expect(readAllFilesStatsStub.callCount).to.deep.eq(1);
            chai.expect(parseFileNameStub.callCount).to.deep.eq(1);
            chai.expect(parseDirectoryNameStub.callCount).to.deep.eq(0);
            chai.expect(routePart).to.not.have.key('fileName');

            chai.expect(consoleErrorStub.callCount).to.deep.eq(1);
            chai.expect(consoleErrorStub.firstCall.args[0]).to.match(/error/);
        });
    });

    describe('createRouteTree function', () => {
        const configCache: Config = {
            baseDir: '/opt/project',
            statics: [],
            middlewarePath: '/opt/project/middlewares',
            middlewares: [],
            routePath: '/opt/project/routes',
            projectType: 'express',
            routeTree: null,
        };

        let config: Config;

        let createRouteTree: (config: Config) => Config;

        const joinStub = Sinon.stub();

        const pathStub = {
            join: joinStub,
        };

        const _createRouteTreeStub = Sinon.stub();

        beforeEach(() => {
            createRouteTree = routes.__get__('createRouteTree');

            config = JSON.parse(JSON.stringify(configCache));

            routes.__set__({
                _createRouteTree: _createRouteTreeStub,
                path: pathStub,
            });

            _createRouteTreeStub.resetBehavior();
            _createRouteTreeStub.resetHistory();
            joinStub.reset();
        });

        it('should try and create the route Tree and append it to the config', () => {
            joinStub.returns('wrong path');
            joinStub
                .withArgs(config.baseDir, config.routePath)
                .returns('right path');

            createRouteTree(config);

            chai.expect(_createRouteTreeStub.callCount).to.deep.eq(1);
            chai.expect(_createRouteTreeStub.firstCall.args[0]).to.deep.eq(
                'right path'
            );
            chai.expect(_createRouteTreeStub.firstCall.args[1]).to.deep.eq({});
            chai.expect(_createRouteTreeStub.firstCall.args[2]).to.deep.eq([]);
            chai.expect(_createRouteTreeStub.firstCall.args[3]).to.deep.eq([]);

            chai.expect(config.routeTree).to.deep.eq({});
        });
    });

    describe('createRouteTree integration test', () => {
        const configCache: Config = {
            baseDir: '/opt/project',
            middlewarePath: '/opt/project/middlewares',
            statics: [],
            middlewares: [
                {
                    description: '',
                    name: 'middleware1',
                    value: 'mw1',
                    link: '/opt/project/middlewares/mw1/middleware1',
                },
                {
                    description: '',
                    name: 'middleware2',
                    value: 'mw2',
                    link: '/opt/project/middlewares/mw2/middleware2',
                },
            ],
            routePath: '/opt/project/routes',
            projectType: 'express',
            routeTree: null,
        };

        let config: Config;

        let createRouteTree: (config: Config) => Config;

        const readAllFilesStatsStub = Sinon.stub();
        const joinStub = Sinon.stub();

        const pathStub = {
            join: joinStub,
        };

        beforeEach(() => {
            createRouteTree = routes.__get__('createRouteTree');

            // need to do this this way because typescirpt changes the name
            // there is probably a better way for this
            routes.__set__('file_1', {
                readAllFilesStats: readAllFilesStatsStub,
                path: pathStub,
            });

            config = JSON.parse(JSON.stringify(configCache));

            readAllFilesStatsStub.resetHistory();
            readAllFilesStatsStub.resetBehavior();

            joinStub.reset();
        });

        it('should create a route tree', () => {
            const fileInfo1: FileInfo[] = [
                {
                    isDirectory: true,
                    isFile: false,
                    name: 'dir1',
                    path: '/opt/project/routes/dir1',
                },
                {
                    isDirectory: false,
                    isFile: true,
                    name: 'test.post.js',
                    path: '/opt/project/routes/test.post.js',
                },
            ];

            const fileInfo2: FileInfo[] = [
                {
                    isFile: true,
                    isDirectory: false,
                    name: 'mw2.test2.get.js',
                    path: '/opt/project/routes/dir1/test2.get.js',
                },
            ];

            readAllFilesStatsStub.onFirstCall().returns(fileInfo1);
            readAllFilesStatsStub.onSecondCall().returns(fileInfo2);

            createRouteTree(config);

            chai.expect(config.routeTree).to.have.all.keys('test', 'dir1');
            chai.expect(config.routeTree.test).to.deep.eq({
                endpoint: 'test',
                method: 'post',
                link: '/opt/project/routes/test.post.js',
                middlewares: [],
            });
            chai.expect(config.routeTree.dir1).to.have.all.keys('test2');

            chai.expect(config.routeTree.dir1.test2).to.deep.eq({
                endpoint: 'test2',
                method: 'get',
                link: '/opt/project/routes/dir1/test2.get.js',
                middlewares: [config.middlewares[1]],
            });
        });
    });
});
