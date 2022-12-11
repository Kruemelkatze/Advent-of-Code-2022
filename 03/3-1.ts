import { lodash } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";
import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";

enum InputSource {
    TestData,
    TestFile,
    ProdFile,
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const INPUT_SOURCE = InputSource.ProdFile as InputSource;
const TEST_DATA = `
vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw
`;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Change working dir to the directory of this file

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
const a = 'a'.charCodeAt(0);
const A = 'A'.charCodeAt(0);

let sum = 0;

for (const rucksack of inputLines) {
    const leftCompartment = new Set(rucksack.substring(0, rucksack.length / 2));
    const rightCompartment = new Set(rucksack.substring(rucksack.length / 2));

    // Testing manual intersection :)
    // per linqts it would just be 
    // const intersection = intersection = L([...leftCompartment]).Intersect(L([...rightCompartment]))
    const intersection = new Set<string>();
    for (const left of leftCompartment) {
        if (rightCompartment.has(left)) {
            intersection.add(left);
        }
    }

    intersection.forEach(v => sum += getValue(v));
}

console.log(sum);



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
    return new Linq<T>(array);
}


function getValue(char: string): number {
    let code = char.charCodeAt(0);
    code = code >= a ? code - a + 1 : code - A + 1 + 26;
    return code;
}