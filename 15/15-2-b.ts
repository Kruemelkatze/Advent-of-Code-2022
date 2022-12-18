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

interface Point {
    x: number;
    y: number;
}

class Sensor {
    position: Point;
    detectedBeacons: Beacon[] = [];
    closestBeacon: Beacon | null = null;
    primedDistance = 0;

    constructor(position: Point) {
        this.position = position;
    }

    primeOnBeacon(beacon: Beacon) {
        if (!this.detectedBeacons.includes(beacon)) {
            this.detectedBeacons.push(beacon);
        }

        this.closestBeacon = beacon;
        this.primedDistance = Math.abs(this.position.x - beacon.position.x) + Math.abs(this.position.y - beacon.position.y);
    }

    isInPrimedRange(point: Point) {
        return Math.abs(this.position.x - point.x) + Math.abs(this.position.y - point.y) <= this.primedDistance;
    }
}

class Beacon {
    position: Point;
    detectedBySensors: Sensor[] = [];

    constructor(position: Point) {
        this.position = position;
    }

    get detectedBySensor() {
        return this.detectedBySensors[0] || null;
    }
}

class MapLookup<T> {
    backingArray: T[][] = [];

    get(x: number, y: number) {
        if (!this.backingArray[x]) {
            return null;
        }

        return this.backingArray[x][y] || null;
    }

    set(x: number, y: number, value: T) {
        if (!this.backingArray[x]) {
            this.backingArray[x] = [];
        }

        this.backingArray[x][y] = value;
    }
}

// CODE
let minX = PROD ? 0 : 0; //Number.MAX_SAFE_INTEGER;
let minY = PROD ? 0 : 0; //Number.MAX_SAFE_INTEGER;
let maxX = PROD ? 4000000 : 20; //Number.MIN_SAFE_INTEGER;
let maxY = PROD ? 4000000 : 20; //Number.MIN_SAFE_INTEGER;

const sensors = new Array<Sensor>();
const beacons = new Array<Beacon>();
const beaconsMap = new MapLookup<Beacon>();

const lineRegex = /^Sensor at x=(-?\d+), y=(-?\d+):.*beacon is at x=(-?\d+), y=(-?\d+)$/;
for (let line of inputLines) {
    const [, sensorX, sensorY, beaconX, beaconY] = lineRegex.exec(line)!;

    const beacon = new Beacon({ x: parseInt(beaconX), y: parseInt(beaconY) });
    const sensor = new Sensor({ x: parseInt(sensorX), y: parseInt(sensorY) });

    beacon.detectedBySensors.push(sensor);
    sensor.detectedBeacons.push(beacon);
    sensor.primeOnBeacon(beacon);

    beacons.push(beacon);
    sensors.push(sensor);
    beaconsMap.set(beacon.position.x, beacon.position.y, beacon);
}

for (let l = minY; l <= maxY; l++) {
    const intervals = sensors.map(s => getSensorIntervalInLine(l, s)).filter(i => i !== null) as [number, number][];
    const mergedIntervals = mergeIntervals(intervals);
    if (mergedIntervals.length > 1) {
        let missingSlot = mergedIntervals[0][1] + 1;
        console.log(`Missing middle slot at line at ${missingSlot},${l} - ${4000000 * missingSlot + l}`);
        break;
    } else if (mergedIntervals[0][0] > minX) {
        console.log(`Missing left slot at line at ${mergedIntervals[0][0] - 1},${l} - ${4000000 * (mergedIntervals[0][0] - 1) + l}`);
        break;
    } else if (mergedIntervals[0][1] < maxX) {
        console.log(`Missing right slot at line at ${mergedIntervals[0][1] + 1},${l} - ${4000000 * (mergedIntervals[0][1] + 1) + l}`);
        break;
    }
}


console.timeEnd("time");

function getSensorIntervalInLine(line: number, sensor: Sensor): [number, number] | null {
    const lineDiff = Math.abs(line - sensor.position.y);
    if (lineDiff > sensor.primedDistance) {
        return null;
    }

    const xDiff = sensor.primedDistance - lineDiff;
    return [sensor.position.x - xDiff, sensor.position.x + xDiff];
}

function mergeIntervals(intervals: [number, number][]): [number, number][] {
    intervals.sort((a, b) => a[0] - b[0]);

    const merged: [number, number][] = [];
    let current = intervals[0];

    for (let i = 1; i < intervals.length; i++) {
        const next = intervals[i];

        if (next[0] <= current[1]) {
            current[1] = Math.max(current[1], next[1]);
        } else {
            merged.push(current);
            current = next;
        }
    }

    merged.push(current);

    return merged;
}