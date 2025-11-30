// Test the "flyed" example
import { calculatePositions } from './dist/lib/ai/diffUtils.js';

const original = "I want to flyed";
const corrected = "I want to fly";

console.log('Original:', original);
console.log('Corrected:', corrected);
console.log('\nCalculated changes:');

const changes = calculatePositions(original, corrected);

changes.forEach((change, index) => {
  console.log(`\n[${index}] ${change.type}`);
  console.log(`  Position: ${change.start}-${change.end}`);
  console.log(`  Original text: "${original.slice(change.start, change.end)}"`);
  console.log(`  Change: "${change.original}" → "${change.corrected}"`);
});

