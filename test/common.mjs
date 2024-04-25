import { statSync } from 'fs';
const filepath = '_posts/Demo/Demo.md';

const stat = statSync(filepath);

console.log(stat);
