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

class Command {
    idx: number;
    cmd: string;
    arg: number | null;
    start: number | null = null;
    end: number | null = null;

    static durations: Map<string, number> = new Map<string, number>([
        ["noop", 1],
        ["addx", 2],
    ]);

    get hasStarted() {
        return this.start != null;
    }

    constructor(index: number, cmd: string, arg: string) {
        this.cmd = cmd;
        this.arg = arg ? parseInt(arg) : null;
        this.idx = index;
    }

    begin(cycle: number): void {
        if (this.hasStarted)
            return;

        this.start = cycle;
        this.end = this.start + Command.durations.get(this.cmd)! - 1;
    }

    act(cycle: number): boolean {
        // Commands only act on the cycle they end
        if (cycle !== this.end)
            return false;

        // Could leave this to a subclass, but for AoC, it's not worth it :)
        switch (this.cmd) {
            case "noop":
                return true;
            case "addx":
                register += this.arg!;
                return true;
            default:
                return true;
        }
    }
}

const commands = inputLines.map((l, i) => {
    const [cmd, arg] = l.split(" ");
    return new Command(i, cmd, arg);
})

let register = 1;
let currentCommandIndex = 0;
let currentCommand: Command | null = null;
let cycle = 0;

let lineStr = ""

do {
    // Begin cycle
    if (currentCommand == null && currentCommandIndex < commands.length) {
        currentCommand = commands[currentCommandIndex];
        currentCommandIndex++;

        currentCommand.begin(cycle);
    }

    // Mid term cycle
    const pixelIndex = cycle + 1;
    lineStr += shouldDrawSprite(cycle) ? "#" : ".";

    const isNewLineIndex = pixelIndex % 40 === 0;
    if (isNewLineIndex) {
        console.log(lineStr);
        lineStr = "";
    }

    if (currentCommand?.act(cycle)) {
        currentCommand = null;
    }

    cycle++;
} while (currentCommand != null || currentCommandIndex < commands.length);

if (lineStr.length > 0) {
    lineStr = lineStr.padEnd(40, '.');
    console.log(lineStr);
}

function shouldDrawSprite(cycle: number): boolean {
    cycle = cycle % 40;
    return Math.abs(cycle - register) <= 1;
}

console.timeEnd("time");