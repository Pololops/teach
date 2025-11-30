// Check raw diff for flyed example
import diff from 'fast-diff';

const original = "I want to flyed";
const corrected = "I want to fly";

console.log('Diff results:');
const diffs = diff(original, corrected);
let pos = 0;

diffs.forEach(([op, text], index) => {
  const opName = op === -1 ? 'DELETE' : op === 1 ? 'INSERT' : 'EQUAL';
  console.log(`[${index}] ${opName} at pos ${pos}: "${text}"`);
  
  if (op !== 1) {
    pos += text.length;
  }
});

