import { Linq } from "https://deno.land/x/linqts@1.0.7/mod.ts";
import { lodash as _ } from "https://deno.land/x/deno_ts_lodash@0.0.1/mod.ts";
import { bindAll } from "https://cdn.skypack.dev/lodash-es@4.17.21";

enum InputSource {
  TestData = "Test Data",
  TestFile = "Test File",
  ProdFile = "Prod File",
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Config ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const INPUT_SOURCE = InputSource.ProdFile as InputSource;

const TEST_DATA = ``;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
console.log("Using " + INPUT_SOURCE);
const input = INPUT_SOURCE === InputSource.TestData
  ? TEST_DATA
  : await Deno.readTextFile(
    INPUT_SOURCE === InputSource.TestFile ? "input-test.txt" : "input.txt",
  );

const inputLines = input.trim().split(/\r?\n/g).map((l) => l.trim());

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Here be Dragons ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
enum NodeType {
  Folder = "Folder",
  File = "File",
}

class Tree {
  name: string;
  children: Tree[] = [];
  type: NodeType;
  size = 0;
  parent: Tree | null = null;

  constructor(name: string, type: NodeType) {
    this.name = name;
    this.type = type;
  }

  addChild(child: Tree) {
    child.parent = this;
    this.children.push(child);
  }

  getChildren() {
    return this.children;
  }

  removeChild(child: Tree) {
    this.children = this.children.filter((c) => c !== child);
  }

  findChild(name: string) {
    return this.children.find((c) => c.name === name);
  }

  calculateSize() {
    if (this.type === NodeType.File) {
      return this.size;
    }

    let size = 0;
    for (const child of this.children) {
      size += child.calculateSize();
    }

    return this.size = size;
  }

  print(offset = "") {
    console.log(`${offset}- ${this.name} (${this.type}, ${this.size})`);
    this.children.forEach(c => c.print(offset + "  "))
  }

  getAllNodes(filter: (n: Tree) => boolean, shouldStopAtFilter = false, result: Set<Tree> = new Set<Tree>()): Set<Tree> {
    if (filter(this)) {
      result.add(this);
    } else if (shouldStopAtFilter) {
      return result;
    }

    for (const child of this.children) {
      child.getAllNodes(filter, shouldStopAtFilter, result);
    }

    return result;
  }

}

console.time("time");
const tree = new Tree("/", NodeType.Folder);
let current = tree;

// Build tree
for (let cmdIndex = 1; cmdIndex < inputLines.length; cmdIndex++) {
  const line = inputLines[cmdIndex];
  const [$, command, param, ...rest] = line.split(" ");

  if ($ !== '$')
    throw new Error("Read result line as command: " + (line + 1));

  switch (command) {
    case 'cd': {
      const nextNode = handleCd(param);
      current = nextNode;
      break;
    }
    case 'ls': {
      const nextIndex = handleLs(cmdIndex, current);
      cmdIndex = nextIndex;
      break;
    }
    default:
      throw new Error("Unknown command: " + command);
  }
}

// Remove parents
tree.calculateSize();
tree.print();

// 7-1
const folderThreshold = 100000;
const foldersBelowThreshold = tree.getAllNodes((n) => n.type === NodeType.Folder && n.size <= folderThreshold);
const foldersBelowThresholdResults = [...foldersBelowThreshold].map(({ name, size }) => ({ name, size }));
//console.dir(foldersBelowThresholdResults);
const sumBelowThreshold = foldersBelowThresholdResults.reduce((acc, { size }) => acc + size, 0);
console.dir("Result 7-1: " + sumBelowThreshold);

// 7-2
const totalSize = 7e7;
const updateSize = 3e7;
const rootSize = tree.size;

const currentlyFree = totalSize - rootSize;
const neededSize = updateSize - currentlyFree;

const foldersForDeletion = tree.getAllNodes((n) => n.type === NodeType.Folder && n.size >= neededSize, true);
let foldersForDeletionResults = [...foldersForDeletion].map(({ name, size }) => ({ name, size }));
foldersForDeletionResults = L(foldersForDeletionResults).OrderBy(x => x.size).ToArray();
console.dir(foldersForDeletionResults);
console.dir("Result 7-2: " + JSON.stringify(foldersForDeletionResults[0]));


console.timeEnd("time");

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function L<T>(array: T[]): Linq<T> {
  return new Linq<T>(array);
}

function handleCd(param: string) {
  if (param === '..') {
    return current.parent!;
  }

  let child = current.findChild(param);
  if (!child) {
    child = new Tree(param, NodeType.Folder);
    current.addChild(child);
  }
  return child;
}

function handleLs(cmdIndex: number, currentNode: Tree) {
  const { nextIndex, lines } = readLsLines(cmdIndex + 1);
  for (const line of lines) {
    if (line.startsWith('dir')) {
      const [, name] = line.split(" ");
      const child = new Tree(name, NodeType.Folder);
      currentNode.addChild(child);
    } else {
      const [size, name] = line.split(" ");
      const child = new Tree(name, NodeType.File);
      currentNode.addChild(child);
      child.size = +size;
    }
  }
  return nextIndex;
}

function readLsLines(startIndex: number) {
  const lines = new Array<string>();
  let i = startIndex;

  while (i <= inputLines.length) { // Walk over last index to be consistend with the index placement
    const line = inputLines[i];
    if (!line || line.startsWith('$'))
      break;

    lines.push(line);
    i++;
  }

  return { nextIndex: i - 1, lines };
}

function combinePaths(path1: string, path2: string): string {
  if (path2 === '..')
    return upwards(path1);

  return path1.replace(/\/$/, '') + "/" + path2.replace(/\/$/, '');
}

function upwards(path1: string) {
  return path1.substring(0, path1.lastIndexOf("/"));
}

