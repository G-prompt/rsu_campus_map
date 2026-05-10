const fs = require('fs');
const path = require('path');
const text = fs.readFileSync(path.join(__dirname, 'App.jsx'), 'utf8');
const stack = [];
let inSingle = false;
let inDouble = false;
let inTemplate = false;
let templateExprDepth = 0;
let inLineComment = false;
let inBlockComment = false;
for (let i = 0; i < text.length; i++) {
  const c = text[i];
  const prev = i > 0 ? text[i - 1] : '';
  const next = i < text.length - 1 ? text[i + 1] : '';
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
  if (!inSingle && !inDouble && !inTemplate) {
    if (c === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (c === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
  }
  if (inSingle) {
    if (c === '\\') {
      i++;
      continue;
    }
    if (c === "'" && prev !== '\\') {
      inSingle = false;
    }
    continue;
  }
  if (inDouble) {
    if (c === '\\') {
      i++;
      continue;
    }
    if (c === '"' && prev !== '\\') {
      inDouble = false;
    }
    continue;
  }
  if (inTemplate) {
    if (c === '\\') {
      i++;
      continue;
    }
    if (c === '`' && templateExprDepth === 0) {
      inTemplate = false;
      continue;
    }
    if (c === '$' && next === '{') {
      templateExprDepth++;
      i++;
      continue;
    }
    if (c === '}') {
      if (templateExprDepth > 0) {
        templateExprDepth--;
        continue;
      }
    }
    if (templateExprDepth > 0) {
      if ('([{'.includes(c)) stack.push({ c, i });
      else if (')]}'.includes(c)) {
        const last = stack.pop();
        const expect = '({['[')}'; // hmm fix below
      }
    }
    continue;
  }
  if (c === "'") { inSingle = true; continue; }
  if (c === '"') { inDouble = true; continue; }
  if (c === '`') { inTemplate = true; templateExprDepth = 0; continue; }
  if ('([{'.includes(c)) stack.push({ c, i });
  else if (')]}'.includes(c)) {
    const last = stack.pop();
    if (!last) { console.log('Unexpected', c, 'at', i); process.exit(1); }
    const expected = { ')': '(', ']': '[', '}': '{' }[c];
    if (last.c !== expected) {
      console.log('Mismatch at', i, 'found', c, 'expected', expected, 'last', last);
      process.exit(1);
    }
  }
}
console.log('stack length', stack.length);
if (stack.length) stack.slice(-20).forEach((item) => console.log(item));
