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
A Y
B X
C Z
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

enum Action {
    Rock,
    Paper,
    Scissors,
}

const actionMap = new Map<string, Action>();
actionMap.set('A', Action.Rock);
actionMap.set('B', Action.Paper);
actionMap.set('C', Action.Scissors);
actionMap.set('X', Action.Rock);
actionMap.set('Y', Action.Paper);
actionMap.set('Z', Action.Scissors);

const actionScores = new Map<Action, number>();
actionScores.set(Action.Rock, 1);
actionScores.set(Action.Paper, 2);
actionScores.set(Action.Scissors, 3);

const resultScores = [0, 3, 6]; // [loose, draw, win]

let score = 0;
for (const line of inputLines) {
    const [enemy, you] = line.split(' ');
    const enemyAction = actionMap.get(enemy)!;
    const yourAction = actionMap.get(you)!;

    const signScore = play(enemyAction, yourAction);
    score += resultScores[signScore + 1];
    score += actionScores.get(yourAction)!;
}

console.log(score);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
    return new Linq<T>(array);
}

function play(enemy: Action, you: Action) {
    if (enemy == you)
        return 0; // Draw
    if (enemy == Action.Rock && you == Action.Paper)
        return 1; // Win
    if (enemy == Action.Paper && you == Action.Scissors)
        return 1; // Win
    if (enemy == Action.Scissors && you == Action.Rock)
        return 1; // Win
    return -1; // Lose
}