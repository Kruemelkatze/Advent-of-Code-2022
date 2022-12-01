import { lodash } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";

enum InputSource {
    TestData,
    TestFile,
    ProdFile,
}

const INPUT_SOURCE = InputSource.ProdFile as InputSource;
const TEST_DATA = `

`;

const inputLines = await setup();
await doWork(inputLines);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here be Dragons ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// deno-lint-ignore require-await
async function doWork(inputLines: string[]): Promise<void> {

}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
    return new Linq<T>(array);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
async function setup(): Promise<string[]> {
    // Change working dir to the directory of this file
    Deno.chdir(path.dirname(path.fromFileUrl(Deno.mainModule)));

    let input: string;
    switch (INPUT_SOURCE) {
        case InputSource.TestData:
            console.dir("Using test data.");
            input = TEST_DATA;
            break;
        case InputSource.TestFile:
            console.dir("Using test file.");
            input = await Deno.readTextFile('input-test.txt');
            break;
        case InputSource.ProdFile:
            console.dir("Using prod file.");
            input = await Deno.readTextFile('input.txt');
            break;
    }

    const lines = input.trim().split(/\r?\n/g);
    return lines;
}