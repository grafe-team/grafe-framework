import 'mocha';
import * as chai from 'chai';
import rewire = require("rewire");
import { getConfig, setConfig, Config } from '../config';


describe('config file', () => {
    const configModule = rewire('../config');
    
    const config: Config = {
        baseDir: '/root/something',
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

    afterEach(() => {
        configModule.__set__('__grafe_core_config', undefined);
    });

    describe('setConfig function', () => {

        it ('should set the gloabl config and return the newly set config', () => {
            chai.expect(setConfig(config)).to.deep.eq(config, 'The returned config needs to be the same as the given one');
        });

    });

    describe('getConfig function', () => {

        it ('should return undefined if config is not set yet', () => {
            // simulate not set
            setConfig(undefined);
            
            chai.expect(getConfig(), 'getConfig should return undefiend').to.be.undefined;
        });

        it ('should return the global config if set', () => {
            setConfig(config);

            chai.expect(getConfig()).to.deep.eq(config, 'getConfig should return the global config if it is set');
        });

    });

});