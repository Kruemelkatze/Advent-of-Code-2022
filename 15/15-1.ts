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
let minX = Number.MAX_SAFE_INTEGER;
let minY = Number.MAX_SAFE_INTEGER;
let maxX = Number.MIN_SAFE_INTEGER;
let maxY = Number.MIN_SAFE_INTEGER;

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

    minX = Math.min(minX, sensor.position.x - sensor.primedDistance, beacon.position.x);
    minY = Math.min(minY, sensor.position.y - sensor.primedDistance, beacon.position.y);
    maxX = Math.max(maxX, sensor.position.x + sensor.primedDistance, beacon.position.x);
    maxY = Math.max(maxY, sensor.position.y + sensor.primedDistance, beacon.position.y);
}

const interestedRow = 2000000;
let knownEmptyPositions = 0;
for (let x = minX; x <= maxX; x++) {
    let p = { x, y: interestedRow };
    if (sensors.some(s => s.isInPrimedRange(p)) && !beaconsMap.get(p.x, p.y)) {
        knownEmptyPositions++;
    }
}

console.log("Part 1: " + knownEmptyPositions);

console.timeEnd("time");