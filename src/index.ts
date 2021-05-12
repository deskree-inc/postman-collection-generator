#!/usr/bin/env ts-node

import {Postman} from './postman';
import * as yargs from 'yargs';


const argv = yargs(process.argv.slice(2)).options({
    integrationName: {
        type: 'string',
        demandOption: true
    },
    folder: {
        type: 'string',
        demandOption: true
    },
    outputDir: {
        type: 'string',
        demandOption: true
    },
    baseURL: {
        type: 'string',
        demandOption: true
    },
    verbose: {
        alias: 'v',
        type: 'boolean',
        demandOption: false
    }
}).argv;

const postman = new Postman(argv.integrationName, argv.baseURL);
if (argv.verbose) {
    postman.verbose = true;
}
postman.run(argv.folder, argv.outputDir);

