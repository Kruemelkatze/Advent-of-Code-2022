import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";
import { lodash as _ } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";

const L = <T>(array: T[]): Linq<T> => new Linq<T>(array);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const PROD = false;
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

const lines = inputLines.map((l) => l.split(" ->").map((s) => s.split(",").map((s) => parseInt(s))));
const map: Tile[][] = [];

for (let points of lines) {
    for (let p = 0; p < points.length - 1, p++) {
        drawLine(points[p], points[p + 1], Tile.Wall)
    }
}


console.timeEnd("time");

function set(x: number, y: number, tile: Tile) {
    if (!map[y]) {
        map[y] = [];
    }
    map[y][x] = tile;
}

function get(x: number, y: number): Tile {
    if (!map[y]) {
        return Tile.Empty;
    }
    return map[y][x] || Tile.Empty;
}

function drawLine([xStart, yStart]: [number, number], [xEnd, yEnd]: [number, number], tile: Tile) {
    const [xStep, yStep] = [Math.sign(xEnd - xStart), Math.sign(yEnd - yStart)];

    // Assume axis-aligned or diagonal, no fancy line rasterization stuff
    // For loop would be too long :)
    let [xCurrent, yCurrent] = [xStart, yStart];
    while (xCurrent !== xEnd || yCurrent !== yEnd) {
        xCurrent += xStep;
        yCurrent += yStep;
        set(xCurrent, yCurrent, tile);
    }
}

function findLowestY(x: number, yStart: number, type: Tile = Tile.Empty) {
    let lowestY = yStart;
    while (get(x, lowestY) === type) {
        lowestY++;
    }

    return lowestY - 1;
}