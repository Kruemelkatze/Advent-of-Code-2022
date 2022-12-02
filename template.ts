import { lodash } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";

enum InputSource {
    TestData,
    TestFile,
    ProdFile,
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const INPUT_SOURCE = InputSource.TestData as InputSource;
const TEST_DATA = `

`;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

const inputLines = input.trim().split(/\r?\n/g);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here be Dragons ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

console.log(inputLines);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
    return new Linq<T>(array);
}