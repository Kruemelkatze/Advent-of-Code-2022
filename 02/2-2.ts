import { lodash } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";

enum InputSource {
    TestData,
    TestFile,
    ProdFile,
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const INPUT_SOURCE = InputSource.ProdFile as InputSource;
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
    Rock = 'R',
    Paper = 'P',
    Scissors = 'S',
}

const actionMap = new Map<string, Action>();
actionMap.set('A', Action.Rock);
actionMap.set('B', Action.Paper);
actionMap.set('C', Action.Scissors);

const matchupMap = new Map<Action, [Action, Action]>(); // action, [beats, loses to]
matchupMap.set(Action.Rock, [Action.Scissors, Action.Paper]);
matchupMap.set(Action.Paper, [Action.Rock, Action.Scissors]);
matchupMap.set(Action.Scissors, [Action.Paper, Action.Rock]);

const actionScores = new Map<Action, number>();
actionScores.set(Action.Rock, 1);
actionScores.set(Action.Paper, 2);
actionScores.set(Action.Scissors, 3);

const resultMap = new Map<string, number>();
resultMap.set('X', -1);
resultMap.set('Y', 0);
resultMap.set('Z', 1);

const resultScores = [0, 3, 6]; // [loose, draw, win]

let score = 0;
for (const line of inputLines) {
    const [enemy, target] = line.split(' ');
    const enemyAction = actionMap.get(enemy)!;
    const targetResult = resultMap.get(target)!;

    const matchup = matchupMap.get(enemyAction)!;
    let targetAction: Action;
    switch (targetResult) {
        case -1:
            targetAction = matchup[0];
            break;
        case 1:
            targetAction = matchup[1];
            break;
        default:
            targetAction = enemyAction;
    }

    console.log(`Enemy ${enemy}: ${enemyAction}, Target ${target}: ${targetResult}, Action: ${targetAction}`);

    const signScore = play(enemyAction, targetAction);
    score += resultScores[signScore + 1];
    score += actionScores.get(targetAction)!;
}

console.log(score);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
    return new Linq<T>(array);
}

function play(enemy: Action, you: Action) {
    if (enemy == you)
        return 0; // Draw

    const matchupEntry = matchupMap.get(you)!;
    return matchupEntry.indexOf(enemy) == 0 ? 1 : -1;
}