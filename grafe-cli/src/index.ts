#!/usr/bin/env node
import yargs = require('yargs/yargs');

import { startCommand, startHandler } from './start/start';
import { generateHandler, generateCommand } from './generate/generate';
import { upgradeHandler, upgradeCommand } from './upgrade/upgrade';
import { serveCommand, serveHandler } from './serve/serve';

yargs(process.argv.slice(2))
    .command(
        'start [projectName]',
        'Generates a new grafe project',
        startCommand,
        startHandler
    )
    .command(
        'generate',
        'Generate a new grafe component',
        generateCommand,
        generateHandler
    )
    .command(
        'upgrade',
        'Upgrade the Grafe-Config',
        upgradeCommand,
        upgradeHandler
    )
    .command(
        'serve',
        'Builds and runs your code automatically',
        serveCommand,
        serveHandler
    )
    .scriptName('grafe')
    .parse();
