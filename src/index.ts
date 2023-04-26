#!/usr/bin/env ts-node

import {Postman} from './postman';
import yargs from 'yargs';
import {YargsInterface} from "./interfaces/yargs.interface";
import {PostmanControllerInterface} from "./interfaces/postmanController.interface";

// @ts-ignore
const argv: YargsInterface = yargs(process.argv.slice(2)).options({
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
    skipExceptions: {
        type: 'boolean',
        demandOption: false
    },
    verbose: {
        alias: 'v',
        type: 'boolean',
        demandOption: false
    }
}).argv;

const postman = new Postman(argv.integrationName, argv.baseURL, argv.skipExceptions);
if (argv.verbose) {
    postman.verbose = true;
}
postman.run(argv.folder, argv.outputDir);

export {PostmanControllerInterface};

