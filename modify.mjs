import { appendFileSync } from 'node:fs';
import parser from 'yargs-parser';

const options = parser(process.argv.slice(2), {
  string: ['type'],
  number: ['amount'],
});

const type = options.type;
const amount = options.amount || Infinity;
const rootPkg = 'large-pkg1';
const numMiddlePkgs = 12;
const numLeafPkgs = 20;

function modifyFile(file) {
  console.log(`Update ${file}`);
  appendFileSync(file, `\n// bump`);
}

let modified = 0;
if (type === 'root') {
  modifyFile(`./packages/${rootPkg}/src/index.ts`);
} else if (type === 'middle') {
  for (let i = 1; i <= numMiddlePkgs; i++) {
    if (modified++ >= amount) break;
    modifyFile(`./packages/${rootPkg}-${i}/src/index.ts`);
  }
} else if (type === 'leaf') {
  for (let i = 1; i <= numMiddlePkgs; i++) {
    for (let j = 1; j <= numLeafPkgs; j++) {
      if (modified++ >= amount) break;
      modifyFile(`./packages/${rootPkg}-${i}-${j}/src/index.ts`);
    }
  }
} else {
  throw new Error(`Unknown type: ${type}`);
}
