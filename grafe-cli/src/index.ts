#!/usr/bin/env node
import yargs = require('yargs/yargs');

import { startCommand, startHandler } from './start/start';
import { generateHandler, generateCommand } from './generate/generate';

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
  .scriptName('grafe')
  .parse();
