const literal = `
Line 1
Line 2
Line 3
`;

// Some random code here to get additional lines in the snippet
const lines = literal.trim().split(/\r?\n/g);

console.log(literal.length);
console.log(lines.length);
console.dir(literal);