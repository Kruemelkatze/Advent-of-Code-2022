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

enum ValidationResult {
    Valid = "Valid",
    Invalid = "Invalid",
    Continue = "Continue",
}

const validationSortMap = new Map<ValidationResult, number>([
    [ValidationResult.Valid, -1],
    [ValidationResult.Invalid, 1],
]);

type Content = number | [] | undefined;

const packets = inputLines.filter(x => x !== "").map(x => JSON.parse(x) as Content[]);
const divider1 = [[2]] as unknown as Content[]; // The heck, TypeScript?
const divider2 = [[6]] as unknown as Content[];
packets.push(divider1);
packets.push(divider2);

const sortedPackages = packets.sort((a, b) => validationSortMap.get(validate(a, b))!);
sortedPackages.forEach(x => console.log(JSON.stringify(x)));
const key1 = sortedPackages.findIndex(p => p === divider1) + 1;
const key2 = sortedPackages.findIndex(p => p === divider2) + 1;
console.log(`key1: ${key1}, key2: ${key2}, decodder key: ${key1 * key2}`);


function validate(packet1: Content[], packet2: Content[]): ValidationResult {
    let toCompare: [Content, Content][] = _.zip(packet1, packet2); // Nice typing

    let validation = ValidationResult.Continue;
    while (toCompare.length > 0 && validation === ValidationResult.Continue) {
        const [left, right] = toCompare.shift()!;
        //console.log(`${i + 1}: ${JSON.stringify(left)} and ${JSON.stringify(right)}`)

        if (left == null && right == null) {
            throw new Error("This should never happen");
        } else if (left == null) {
            validation = ValidationResult.Valid;
        } else if (right == null) {
            validation = ValidationResult.Invalid;
        } else if (Number.isFinite(left) && Number.isFinite(right)) {
            validation = left === right
                ? ValidationResult.Continue
                : (left < right ? ValidationResult.Valid : ValidationResult.Invalid);
        } else if (left instanceof Array && right instanceof Array) {
            const newEntries: [Content, Content][] = _.zip(left, right);
            toCompare = newEntries.concat(toCompare);
        } else if (left instanceof Array && Number.isFinite(right)) {
            const newEntries: [Content, Content][] = _.zip(left, [right]);
            toCompare = newEntries.concat(toCompare);
        } else if (Number.isFinite(left) && right instanceof Array) {
            const newEntries: [Content, Content][] = _.zip([left], right);
            toCompare = newEntries.concat(toCompare);
        } else {
            throw new Error("What the heck should I validate?");
        }
    }

    return validation;
}


console.timeEnd("time");

// Functions
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