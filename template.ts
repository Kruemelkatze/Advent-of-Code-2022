import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";
import { lodash as _ } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";

enum InputSource {
  TestData = "Test Data",
  TestFile = "Test File",
  ProdFile = "Prod File",
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const INPUT_SOURCE = InputSource.TestFile as InputSource;

const TEST_DATA = ``;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
console.log("Using " + INPUT_SOURCE);
const input = INPUT_SOURCE === InputSource.TestData
  ? TEST_DATA
  : await Deno.readTextFile(
    INPUT_SOURCE === InputSource.TestFile ? "input-test.txt" : "input.txt",
  );

const inputLines = input.trim().split(/\r?\n/g).map((l) => l.trim());

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here be Dragons ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
console.time("time");


console.timeEnd("time");

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
  return new Linq<T>(array);
}