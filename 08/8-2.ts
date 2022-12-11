import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";
import { lodash as _ } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";

enum InputSource {
  TestData = "Test Data",
  TestFile = "Test File",
  ProdFile = "Prod File",
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const INPUT_SOURCE = InputSource.ProdFile as InputSource;

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

const Directions = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
]

const trees = toSingleDigitIntArray(inputLines);
let maxVisibleTrees = -1;

for (let y = 0; y < trees.length; y++) {
  for (let x = 0; x < trees[y].length; x++) {
    const visibleTrees = countVisible(x, y);
    if (visibleTrees > maxVisibleTrees) {
      maxVisibleTrees = visibleTrees;
    }
  }
}

console.log("Visible Trees: " + maxVisibleTrees);



console.timeEnd("time");

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
  return new Linq<T>(array);
}

function countVisible(treeX: number, treeY: number): number {
  return Directions.map((direction) => countVisibleInDirection(treeX, treeY, direction)).reduce((a, b) => a * b, 1);
}

function countVisibleInDirection(treeX: number, treeY: number, direction: number[]): number {
  let x = treeX, y = treeY;
  const height = trees[y][x];

  let visibleTrees = 0;

  x += direction[0];
  y += direction[1];

  while (x >= 0 && x < trees[0].length && y >= 0 && y < trees.length) {
    visibleTrees++;

    if (trees[y][x] >= height) {
      break;
    }

    x += direction[0];
    y += direction[1];
  }

  return visibleTrees;

}

function toSingleDigitIntArray(lines: string[]): number[][] {
  return lines.map((l) => l.split('').map(c => parseInt(c)));
}