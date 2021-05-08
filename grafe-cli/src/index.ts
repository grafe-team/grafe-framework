#!/usr/bin/env node
import yargs = require('yargs/yargs');

import { startCommand, startHandler } from './start/start';

yargs(process.argv.slice(2))
    .command('start', 'Generates a new grafe project', startCommand, startHandler)
    .parse();

