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

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here be Dragons ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const inputLines = input.split(/\r?\n/g);

// Parse lines
const splitLineIndex = inputLines.findIndex((l) => l === "");
const stackLines = inputLines.slice(0, splitLineIndex - 1);
const stackIndicesLine = inputLines[splitLineIndex - 1];
const ruleLines = inputLines.slice(splitLineIndex + 1, inputLines.length);

// Read Stacks
const stackIndices = stackIndicesLine.split(/ +/).filter(c => c.trim()).map((i) => parseInt(i));
const stacks = new Array<string[]>(stackIndices.length);
for (const i of stackIndices) {
  const idx = i - 1;
  const indexInStackLine = 1 + (idx) * 4;
  for (const line of stackLines) {
    stacks[idx] = stacks[idx] || [];
    const crateChar = line.charAt(indexInStackLine);
    if (crateChar.trim()) {
      stacks[idx].unshift(crateChar);
    }
  }
}

// Read and handle rules
console.dir(stacks)
console.log();

for (const rule of ruleLines) {
  const match = /move (\d+) from (\d+) to (\d+)/.exec(rule);
  if (!match)
    continue

  const [, numStr, fromIdxStr, toIdxStr] = [...match];
  const [num, fromIdx, toIdx] = [parseInt(numStr), parseInt(fromIdxStr) - 1, parseInt(toIdxStr) - 1];

  const fromStack = stacks[fromIdx];
  const toStack = stacks[toIdx];

  moveCrates(fromStack, toStack, num);

  console.dir(rule)
  console.dir(stacks)
  console.log();
}

const topCrates = stacks.reduce((acc, stack) => acc + stack[stack.length - 1], "");
console.log("Top Crates: " + topCrates);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
  return new Linq<T>(array);
}

function moveCrates(fromStack: string[], toStack: string[], amount: number) {
  const numToMove = Math.min(amount, fromStack.length);

  const cratesToMove = fromStack.splice(fromStack.length - numToMove, numToMove);
  toStack.push(...cratesToMove);
}

