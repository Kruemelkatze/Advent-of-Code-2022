import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";
import { lodash as _ } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";

const L = <T>(array: T[]): Linq<T> => new Linq<T>(array);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const PROD = true;
const inputFile = PROD ? "input.txt" : "input-test.txt";
console.log("Using " + inputFile);

const DEBUG = false;
const logDebug = (...args: any[]) => {
    if (DEBUG) {
        console.log(...args);
    }
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const input = await Deno.readTextFile(inputFile);
const inputLines = input.trim().split(/\r?\n/g);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here be Dragons ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
console.time("time");

class Item {
    worryLevel: number;

    constructor(worryLevel: number) {
        this.worryLevel = (worryLevel);
    }

    modifyWorryLevel(modifier: (old: number) => number): number {
        return this.worryLevel = modifier(this.worryLevel);
    }

    static postInspectionModification = (old: number) => Math.floor(old / 3);

    postInspection(): void {
        this.worryLevel = Item.postInspectionModification(this.worryLevel);
    }
}

// Return to Monke
class Monke {
    id: number;
    items: Item[] = [];
    operation: (old: number) => number = (old) => old;
    test: (worry: number) => number = () => this.id;
    worryDivider: number;

    inspections = 0;

    constructor(id: number, worryDivider: number) {
        this.id = id;
        this.worryDivider = worryDivider;
    }

    handleItem(item: Item): number {
        let oldWorryLevel = item.worryLevel;
        item.modifyWorryLevel(this.operation);
        this.inspections++;
        logDebug(`Monkey ${this.id}: ${oldWorryLevel} -> ${item.worryLevel}`);
        item.postInspection();

        logDebug(`Monkey ${this.id}: ${oldWorryLevel} -> ${item.worryLevel}`);

        const targetMonkey = this.test(item.worryLevel);
        return targetMonkey;
    }

    logItems(): void {
        logDebug(`Monkey ${this.id}: ${this.items.map(i => i.worryLevel).join(', ')}`);
    }

}

function parseMonke(monkeLines: string[]): Monke {
    if (monkeLines.length !== 6)
        throw new Error("Invalid monke lines");

    monkeLines = monkeLines.map(l => l.trim());
    const [monkeIdLine, itemsLine, operationLine, testLine, testTrueLine, testFalseLine] = monkeLines;

    const monkeId = parseInt(monkeIdLine.substring(monkeIdLine.lastIndexOf(' ') + 1, monkeIdLine.length - 1));
    const itemIds = itemsLine.substring(itemsLine.lastIndexOf(':') + 2).split(/, /).map(i => parseInt(i));
    const items = itemIds.map(i => new Item(i));

    const [operand1Str, operator, operand2Str] = operationLine.substring(operationLine.lastIndexOf('=') + 2).split(' ');
    const operand1 = operand1Str === 'old' ? null : (parseInt(operand1Str));
    const operand2 = operand2Str === 'old' ? null : (parseInt(operand2Str));
    const operation = (old: number) => {
        const op1 = operand1 == null ? old : operand1;
        const op2 = operand2 == null ? old : operand2;

        switch (operator) {
            case '+':
                return op1 + op2;
            case '*':
                return op1 * op2;
            case '-':
                return op1 - op2;
            case '/':
                return op1 / op2;
            default:
                throw new Error("Invalid operator");
        }
    };

    // Only support divisible for now, as nothiog else is stated
    const monkeTrue = parseInt(testTrueLine.substring(testTrueLine.lastIndexOf(' ') + 1));
    const monkeFalse = parseInt(testFalseLine.substring(testFalseLine.lastIndexOf(' ') + 1));

    const worryDivider = parseInt(testLine.substring(testLine.lastIndexOf(' ') + 1));
    const test = (worry: number) => {
        return worry % worryDivider === 0 ? monkeTrue : monkeFalse;
    }

    const monke = new Monke(monkeId, worryDivider);
    monke.items = items;
    monke.operation = operation;
    monke.test = test;

    return monke;
}

const monkeLines = chunkArrayByValue(inputLines, '');
const monkes = monkeLines.map(parseMonke);
const monkeModulo = monkes.map(m => m.worryDivider).reduce((a, b) => lcmForPair(a, b), 1);
Item.postInspectionModification = (old) => old % monkeModulo;
console.log("Monke Modulo: " + monkeModulo);


const rounds = 10000;
for (let i = 0; i < rounds; i++) {
    for (const monke of monkes) {
        for (const item of monke.items) {
            const targetMonke = monkes[monke.handleItem(item)];
            targetMonke.items.push(item);
        }
        monke.items = [];
    }

    monkes.forEach(m => m.logItems());
}

monkes.forEach(m => console.log(`Monkey ${m.id} inspected items ${m.inspections} times.`));
const results = L(monkes).OrderByDescending(m => m.inspections).Take(2).Select(m => m.inspections).Aggregate((a, b) => a * b!, 1);
console.log(`Monkey Business after ${rounds} rounds: ${results}`);

console.timeEnd("time");

function chunkArrayByValue<T>(array: T[], value: T): T[][] {
    const chunks: T[][] = [];
    let chunk: T[] = [];
    for (const item of array) {
        if (item === value) {
            chunks.push(chunk);
            chunk = [];
        } else {
            chunk.push(item);
        }
    }
    chunks.push(chunk);
    return chunks;
}

function lcm(...numbers: number[]): number {
    return numbers.reduce((a, b) => lcmForPair(a, b), 1);
}

function lcmForPair(a: number, b: number): number {
    return (a * b) / gcdForPair(a, b);
}

function gcdForPair(a: number, b: number): number {
    if (b === 0) return a;
    return gcdForPair(b, a % b);
}




