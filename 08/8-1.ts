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
let visibleTrees = 2 * trees.length + 2 * trees[0].length - 4;

for (let y = 1; y < trees.length - 1; y++) {
  for (let x = 1; x < trees[y].length - 1; x++) {
    visibleTrees += isVisible(x, y) ? 1 : 0;
  }
}

console.log("Visible Trees: " + visibleTrees);



console.timeEnd("time");

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
  return new Linq<T>(array);
}

function isVisible(treeX: number, treeY: number): boolean {
  return Directions.some((direction) => isVisibleInDirection(treeX, treeY, direction));
}

function isVisibleInDirection(treeX: number, treeY: number, direction: number[]): boolean {
  let x = treeX, y = treeY;
  const height = trees[y][x];

  while (x > 0 && x < trees[0].length - 1 && y > 0 && y < trees.length - 1) {
    x += direction[0];
    y += direction[1];

    if (trees[y][x] >= height) {
      return false;
    }
  }

  //console.log(`Tree at ${treeX}, ${treeY} is visible in direction ${direction}.`)

  return true;

}

function toSingleDigitIntArray(lines: string[]): number[][] {
  return lines.map((l) => l.split('').map(c => parseInt(c)));
}