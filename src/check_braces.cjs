const fs = require('fs');
const path = require('path');
const text = fs.readFileSync(path.join(__dirname, 'App.jsx'), 'utf8');
const stack = [];
const opening = ['{', '(', '['];
const closing = ['}', ')', ']'];
let inSingleQuote = false;
let inDoubleQuote = false;
let inTemplate = false;
let inLineComment = false;
let inBlockComment = false;
for (let i = 0; i < text.length; i++) {
  const c = text[i];
  const prev = text[i - 1];
  const next = text[i + 1];
  if (inLineComment) {
    if (c === '\n') inLineComment = false;
    continue;
  }
  if (inBlockComment) {
    if (c === '*' && next === '/') {
      inBlockComment = false;
      i++;
    }
    continue;
  }
  if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
    if (c === '/' && next === '/') { inLineComment = true; i++; continue; }
    if (c === '/' && next === '*') { inBlockComment = true; i++; continue; }
  }
  if (!inDoubleQuote && !inTemplate && c === "'" && prev !== '\\') {
    inSingleQuote = !inSingleQuote;
    continue;
  }
  if (!inSingleQuote && !inTemplate && c === '"' && prev !== '\\') {
    inDoubleQuote = !inDoubleQuote;
    continue;
  }
  if (!inSingleQuote && !inDoubleQuote && c === '`' && prev !== '\\') {
    inTemplate = !inTemplate;
    continue;
  }
  if (inSingleQuote || inDoubleQuote || inTemplate) {
    if (c === '\\') i++;
    continue;
  }
  if (opening.includes(c)) stack.push({ c, i });
  else if (closing.includes(c)) {
    const last = stack.pop();
    const expected = opening[closing.indexOf(c)];
    if (!last || last.c !== expected) {
      console.log('Mismatch at', i, 'found', c, 'expected', expected, 'last', last);
      process.exit(1);
    }
  }
}
console.log('stack length', stack.length);
if (stack.length) stack.slice(-20).forEach((item) => console.log(item));
