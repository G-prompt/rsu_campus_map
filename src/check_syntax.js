const fs = require('fs');
const path = require('path');
const text = fs.readFileSync(path.join(__dirname, 'App.jsx'), 'utf8');
const pairs = { '{': '}', '[': ']', '(': ')' };
const stack = [];
for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if ('[{('.includes(c)) stack.push({ c, i });
    else if (']})'.includes(c)) {
        const last = stack.pop();
        if (!last || pairs[last.c] !== c) {
            console.log('Mismatch at', i, 'found', c, 'expected', last ? pairs[last.c] : 'none');
            process.exit(1);
        }
    }
}
console.log('stack length', stack.length);
if (stack.length) stack.slice(-10).forEach(e => console.log('unclosed', e.c, 'at', e.i));
