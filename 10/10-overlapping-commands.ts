import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";
import { lodash as _ } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";

const L = <T>(array: T[]): Linq<T> => new Linq<T>(array);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const PROD = false;
const inputFile = PROD ? "input.txt" : "input-test-2.txt";
console.log("Using " + inputFile);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const input = await Deno.readTextFile(inputFile);
const inputLines = input.trim().split(/\r?\n/g).map((l) => l.trim());

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here be Dragons ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
console.time("time");



class Command {
    cmd: string;
    arg: number | null;
    start: number;
    end: number;

    static durations: Map<string, number> = new Map<string, number>([
        ["noop", 1],
        ["addx", 2],
    ]);

    constructor(index: number, cmd: string, arg: string) {
        this.cmd = cmd;
        this.arg = arg ? parseInt(arg) : null;
        this.start = index;
        this.end = this.start + Command.durations.get(cmd)!;
    }

    act(cycle: number): boolean {
        if (cycle !== this.end)
            return false;

        // Could leave this to a subclass, but for AoC, it's not worth it :)
        switch (this.cmd) {
            case "noop":
                return true;
            case "addx":
                console.log(`Adding ${this.arg} to register at cycle ${cycle}`)
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
let sumSignalStrength = 0;
// A linked list would be better, but this is AoC, not a real project
let commandQueue = new Set<Command>();

const lastCycle = commands[commands.length - 1].end;

for (let i = 0; i <= lastCycle; i++) {
    const newCommand = commands[i];

    // Start cycle
    if (newCommand) {
        commandQueue.add(newCommand);
    }

    // Mid term cycle
    const signalIndex = i + 1;
    const isSignalStrengthIndex = (signalIndex - 20) % 40 === 0;
    if (isSignalStrengthIndex) {
        const signalStrength = register * signalIndex;
        sumSignalStrength += signalStrength;

        console.log(`Signal strength at ${signalIndex} is ${signalStrength}`);
    }

    // End cycle
    for (const command of commandQueue) {
        if (command.act(i)) {
            // Thank you JS for allowing concurrent modification of a Set
            commandQueue.delete(command);
        }
    }
}

console.log(`Sum of signal strengths is ${sumSignalStrength}`);
console.log(`Register is ${register}`);

console.timeEnd("time");


// Linked List