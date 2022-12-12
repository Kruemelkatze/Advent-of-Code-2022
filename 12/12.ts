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
class Node {
    x: number;
    y: number;
    value: number;
    neighboursCoordinates: { x: number, y: number }[] = [];
    neighbours: Node[] = [];

    get isStartNode() {
        return this.value === 83; // 'S'
    }

    get isEndNode() {
        return this.value === 69; // 'E'
    }

    get charValue() {
        return String.fromCharCode(this.value);
    }


    constructor(x: number, y: number, value: number) {
        this.x = x;
        this.y = y;
        this.value = value;
    }
}

const directions = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
];

console.time("time");
const map = inputLines.map((l) => l.split("").map((c) => c.charCodeAt(0)));

// Build Graph
const graph: Node[][] = [];
let startNode: Node = null!;
let endNode: Node = null!;
for (let y = 0; y < map.length; y++) {
    graph[y] = [];
    for (let x = 0; x < map[0].length; x++) {
        const value = get(x, y);
        const node = new Node(x, y, value);
        node.neighboursCoordinates = getValidNeighbours(x, y);
        graph[y][x] = node;

        if (startNode == null && node.isStartNode) { // 'S'
            startNode = node;
        } else if (endNode == null && node.isEndNode) { // 'E', nice
            endNode = node;
        }
    }
}

_.flatten(graph).forEach((node) => node.neighbours = node.neighboursCoordinates.map((c) => graph[c.y][c.x]));

// Breadth First Search
// 12-1
const myPath = findPath(startNode, endNode);
//console.log(myPath.map((n) => `${n.charValue}:${n.y},${n.x}`).join(" "));
console.log("12-1: " + (myPath.length - 1));

const allLowestPoints = _.flatten(graph).filter((n) => n.value == 97);
const allPathsFromLowestPoint = allLowestPoints.map((n) => findPath(n, endNode)).filter(p => p.length > 0);
const shortestPath = allPathsFromLowestPoint.reduce((a, b) => a.length < b.length ? a : b);
//console.log(shortestPath.map((n) => `${n.charValue}:${n.y},${n.x}`).join(" "));
console.log("12-2: " + (shortestPath.length - 1));

console.timeEnd("time");

// graph.forEach(line => {
//     console.log(line.map(n => n.neighbours.map(n => n.charValue).join("")).join("\t"));
// })


// FUNCTIONS

function findPath(startNode: Node, endNode: Node) {
    const queue: Node[] = [startNode];
    const visited = new Set<Node>([startNode]);
    const parents = new Map<Node, Node>();

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === endNode) {
            break;
        }

        for (const n of current.neighbours) {
            if (visited.has(n))
                continue;

            visited.add(n);
            queue.push(n);
            parents.set(n, current);
        }
    }

    // Build Path
    if (!parents.has(endNode)) {
        return [];
    }
    
    const path: Node[] = [];
    let current: Node | undefined = endNode;
    while (current != null) {
        path.push(current);
        current = parents.get(current);
    }

    path.reverse();

    return path;
}

function get(x: number, y: number) {
    const my = map[y];
    return my && my[x];
}

function set(x: number, y: number, value: number) {
    map[y][x] = value;
}

function isValidNeighbor(current: number, neighbor: number) {
    if (current === 83) { // 'S'
        current = 97; // 'a'
    } else if (current === 69) { // 'E', nice
        current = 122; // 'z'
    }

    if (neighbor === 83) { // 'S'
        neighbor = 97; // 'a'
    } else if (neighbor === 69) { // 'E', nice
        neighbor = 122; // 'z'
    }

    return neighbor - current <= 1;
}

function getValidNeighbours(x: number, y: number) {
    const current = get(x, y);

    const adjacent = new Array<{ x: number, y: number }>();
    for (const { x: dx, y: dy } of directions) {
        const i = x + dx;
        const j = y + dy;

        const neighbour = get(i, j);
        if (neighbour != null && isValidNeighbor(current, neighbour)) {
            adjacent.push({ x: i, y: j });
        }
    }

    return adjacent;
}