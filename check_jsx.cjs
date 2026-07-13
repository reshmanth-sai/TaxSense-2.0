const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');

let stack = [];
let lines = code.split('\n');
let re = /<\/?([a-zA-Z0-9\.]+)[^>]*>/g;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.includes('//')) line = line.split('//')[0];
  if (line.includes('/*')) continue; // lazy

  let match;
  while ((match = re.exec(line)) !== null) {
    let tag = match[1];
    let full = match[0];
    
    // Ignore self-closing
    if (full.endsWith('/>') || tag === 'input' || tag === 'img' || tag === 'br') continue;
    if (full.startsWith('</')) {
      let last = stack.pop();
      if (last.tag !== tag) {
        console.log(`Mismatch at line ${i+1}: expected </${last.tag}> (from line ${last.line}), found </${tag}>`);
        process.exit(1);
      }
    } else {
      stack.push({tag, line: i+1});
    }
  }
}
console.log('OK, Stack left:', stack.map(s => `${s.tag} (${s.line})`));
