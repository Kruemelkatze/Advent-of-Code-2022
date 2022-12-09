import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";
import { lodash as _ } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";

const L = <T>(array: T[]): Linq<T> => new Linq<T>(array);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const PROD = true;
const inputFile = PROD ? "input.txt" : "input-test.txt";
console.log("Using " + inputFile);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const input = await Deno.readTextFile(inputFile);
const inputLines = input.trim().split(/\r?\n/g).map((l) => l.trim());

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here be Dragons ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
console.time("time");

enum Direction {
    Right = "R",
    Left = "L",
    Up = "U",
    Down = "D",
}

const Steps = {
    [Direction.Right]: { x: 1, y: 0 },
    [Direction.Left]: { x: -1, y: 0 },
    [Direction.Up]: { x: 0, y: 1 },
    [Direction.Down]: { x: 0, y: -1 },
};

// Read commands
const commands = inputLines.map((line) => {
    const split = line.split(" ");
    const [direction, distance] = [split[0] as Direction, parseInt(split[1])];
    return { direction, distance };
});

const head = { x: 0, y: 0 };
const tail = { x: 0, y: 0 };
const path = new Set<string>([hash(0, 0)]);

// Path
for (const command of commands) {
    const { direction, distance } = command;
    for (let i = 0; i < distance; i++) {
        moveHead(direction);
        followTail()
    }
}

console.dir(path);
console.dir("Path length: " + path.size);


// Functions

function moveHead(direction: Direction) {
    const step = Steps[direction];
    head.x += step.x;
    head.y += step.y;
}

function followTail() {
    if (calcDistance() <= 1) {
        return;
    }

    const stepX = zeroSign(head.x - tail.x);
    const stepY = zeroSign(head.y - tail.y);

    tail.x += stepX;
    tail.y += stepY;

    path.add(hash(tail.x, tail.y));
}


function hash(x: number, y: number) {
    return `${x},${y}`;
}

function calcDistance() {
    return Math.max(Math.abs(head.x - tail.x), Math.abs(head.y - tail.y));
}

function zeroSign(a: number) {
    return a === 0 ? 0 : Math.sign(a);
}

console.timeEnd("time");