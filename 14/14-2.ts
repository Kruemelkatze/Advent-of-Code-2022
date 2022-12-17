import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";
import { lodash as _ } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";

const L = <T>(array: T[]): Linq<T> => new Linq<T>(array);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const PROD = true;
const inputFile = PROD ? "input.txt" : "input-test.txt";
console.log("Using " + inputFile);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const input = await Deno.readTextFile(inputFile);


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here be Dragons ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
console.time("time");

enum Tile {
    Empty = '.',
    Wall = '#',
    Sand = 'o',
}

const inputLines = input.trim().split(/\r?\n/g).map((l) => l.trim());

const lines = inputLines.map((l) => l.split(" ->").map((s) => s.split(",").map((s) => parseInt(s)) as [number, number]));
const map: Tile[][] = [];

let bedrockLevel = 0;
let leftmost = 500;
let rightmost = 500;

// Draw blocks
for (let points of lines) {
    for (let p = 0; p < points.length - 1; p++) {
        bedrockLevel = Math.max(bedrockLevel, points[p][1], points[p + 1][1]);
        leftmost = Math.min(leftmost, points[p][0], points[p + 1][0]);
        rightmost = Math.max(rightmost, points[p][0], points[p + 1][0]);
        drawLine(points[p], points[p + 1], Tile.Wall)
    }
}

bedrockLevel += 2;

printMap();

const sandDroppedAt = [500, 0];
const sandDirections = [
    [0, 1],
    [-1, 1],
    [1, 1],
]
const sandToDrop = 100000;

for (let s = 0; s < sandToDrop; s++) {
    const settlingPosition = dropSand();
    if (settlingPosition[0] === sandDroppedAt[0] && settlingPosition[1] === sandDroppedAt[1]) {
        console.log(`Sand settled after ${s + 1}th sand drop`);
        break;
    }

}

console.timeEnd("time");

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function set(x: number, y: number, tile: Tile) {
    if (!map[y]) {
        map[y] = [];
    }
    map[y][x] = tile;
}

function get(x: number, y: number): Tile {
    if (!map[y]) {
        map[y] = [];
    }

    if (y >= bedrockLevel) {
        return Tile.Wall;
    }

    return map[y][x] || Tile.Empty;
}

function drawLine([xStart, yStart]: [number, number], [xEnd, yEnd]: [number, number], tile: Tile) {
    const [xStep, yStep] = [Math.sign(xEnd - xStart), Math.sign(yEnd - yStart)];

    // Assume axis-aligned or diagonal, no fancy line rasterization stuff
    // For loop would be too long :)
    let [xCurrent, yCurrent] = [xStart, yStart];

    set(xCurrent, yCurrent, tile);
    while (xCurrent !== xEnd || yCurrent !== yEnd) {
        xCurrent += xStep;
        yCurrent += yStep;
        set(xCurrent, yCurrent, tile);
    }
}

function findLowestY(x: number, yStart: number, type: Tile = Tile.Empty): number {
    let lowestY = yStart;
    while (get(x, lowestY) === type) {
        lowestY++;
    }

    return lowestY - 1;
}

function tileToString(tile: Tile | null) {
    return tile || Tile.Empty;
}

function dropSand() {
    const targetPos = getNextSandPosition(sandDroppedAt[0], sandDroppedAt[1]);
    if (targetPos != null) {
        set(targetPos[0], targetPos[1], Tile.Sand);
    }

    //printMap();
    return targetPos;
}

function getNextSandPosition(x: number, y: number): [number, number] {
    let prevPos = [x, y];
    let nextPos = singleSandStep(x, y);
    while (nextPos && nextPos[1] !== prevPos[1]) {
        prevPos = nextPos;
        nextPos = singleSandStep(prevPos[0], prevPos[1]);
    }

    return nextPos;
}

function singleSandStep(x: number, y: number): [number, number] {
    const lowestY = findLowestY(x, y, Tile.Empty);

    if (lowestY !== y)
        return [x, lowestY];

    for (const dir of sandDirections) {
        const nextX = x + dir[0];
        const nextY = y + dir[1];
        if (get(nextX, nextY) === Tile.Empty) {
            return [nextX, nextY];
        }
    }

    return [x, y]; // Settled
}

function printMap() {
    console.log();

    for (let j = 0; j <= bedrockLevel; j++) {
        let str = "";
        for (let i = leftmost - 2; i <= rightmost + 2; i++) {
            const element = get(i, j);
            str += tileToString(element);
        }
        console.log(str);

    }
}