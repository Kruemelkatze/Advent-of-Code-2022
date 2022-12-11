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
const useAllLines = true;
const windowSize = 14;

console.time("time");
for (const line of inputLines) {
  const validMarkers = new Array<number>();
  const window = new Set<string>();

  // Naive Solution, but it works.
  // Alternatively, I first used a sliding window approach and if finding a duplicate at position (j) then move forward from (i) to (i + i - i).
  // This was a bit more complicated and it was 12am so I went with the simple solution.

  for (let i = windowSize - 1; i < line.length && !validMarkers.length; i++) {
    for (let j = i - windowSize + 1; j <= i; j++) {
      window.add(line[j]);
    }

    if (i >= windowSize - 1 && window.size === windowSize) {
      validMarkers.push(i);
    }
    window.clear();
  }

  console.dir(`Line has valid markers at ${[...validMarkers].map(i => i + 1)}`);

  if (!useAllLines)
    break;
}
console.timeEnd("time");

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
  return new Linq<T>(array);
}