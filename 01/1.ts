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
1000
2000
3000
 
4000

5000
6000

7000
8000
9000

10000
`;

const inputLines = await setup();
await doWork(inputLines);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here be Dragons ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// deno-lint-ignore require-await
async function doWork(inputLines: string[]): Promise<void> {

    const chunks = chunkArrayByValue(inputLines, '');

    // Original Part 1
    const max = lodash.maxBy(chunks, sumFromStrings);
    const maxSum = sumFromStrings(max as string[]);

    console.log("Part 1: " + maxSum);

    // Part 2
    const howMany = 3;
    const sums = chunks.map((calories, i) => ({ i, calories: sumFromStrings(calories) }));
    const ordered = lodash.orderBy(sums, 'calories', 'desc');
    const maxCalories = lodash.take(ordered, howMany);
    const top3Sum = lodash.sumBy(maxCalories, 'calories');

    const top3SumPerLinq = L(sums).OrderByDescending(s => s.calories).Take(howMany).Sum(s => s!.calories);

    console.log("Part 2: " + top3Sum);
    console.log("Part 2 alt: " + top3SumPerLinq);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
    return new Linq<T>(array);
}

function sumFromStrings(strings: string[]): number {
    return lodash.sumBy(strings, (s) => parseInt(s));
}

function chunkArrayByValue<T>(array: T[], value: T): T[][] {
    const chunks: T[][] = [];
    let chunk: T[] = [];
    for (const item of array) {
        if (item === value) {
            chunks.push(chunk);
            chunk = [];
        } else {
            chunk.push(item);
        }
    }
    chunks.push(chunk);
    return chunks;
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