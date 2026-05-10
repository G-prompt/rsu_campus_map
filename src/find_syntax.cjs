const fs = require('fs');
const parser = require('@babel/parser');
const lines = fs.readFileSync('App.jsx', 'utf8').split(/\r?\n/);
let low = 0, high = lines.length, lastOK = 0;
while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  const code = lines.slice(0, mid).join('\n');
  try {
    parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
    lastOK = mid;
    low = mid + 1;
  } catch (e) {
    high = mid - 1;
  }
}
console.log('last ok line', lastOK);
if (lastOK < lines.length) {
  const start = Math.max(0, lastOK - 10);
  const end = Math.min(lines.length, lastOK + 20);
  for (let i = start; i < end; i++) {
    console.log(String(i + 1).padStart(4, ' ') + ': ' + lines[i]);
  }
}
