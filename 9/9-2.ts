import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";
import { lodash as _ } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";

const L = <T>(array: T[]): Linq<T> => new Linq<T>(array);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const PROD = true;
const inputFile = PROD ? "input.txt" : "input-test-2.txt";
console.log("Using " + inputFile);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const input = await Deno.readTextFile(inputFile);
const inputLines = input.trim().split(/\r?\n/g).map((l) => l.trim());

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here be Dragons ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
console.time("time");

interface Position {
    x: number;
    y: number;
}

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
const tailLength = 9;
const tails = new Array(tailLength).fill(null).map(() => ({ x: 0, y: 0 } as Position));
const snek = [head, ...tails];
const tailPath = new Set<string>([hash(head)]);

// Path
for (const command of commands) {
    const { direction, distance } = command;
    for (let i = 0; i < distance; i++) {
        move(head, direction);
        for (let i = 1; i < snek.length; i++) {
            follow(snek[i], snek[i - 1], i === snek.length - 1);
        }
    }
}

console.dir("Path length: " + tailPath.size);


// Functions

function move(position: Position, direction: Direction) {
    const step = Steps[direction];
    position.x += step.x;
    position.y += step.y;
}

function follow(follower: Position, follow: Position, isTail: boolean) {
    if (calcDistance(follow, follower) <= 1) {
        return;
    }

    const stepX = zeroSign(follow.x - follower.x);
    const stepY = zeroSign(follow.y - follower.y);

    follower.x += stepX;
    follower.y += stepY;

    if (isTail) {
        tailPath.add(hash(follower));
    }
}


function hash(p: Position) {
    return `${p.x},${p.y}`;
}

function calcDistance(a: Position, b: Position) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function zeroSign(a: number) {
    return a === 0 ? 0 : Math.sign(a);
}

console.timeEnd("time");