import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(f => f.endsWith('.js'));
}

const targetDirs = [
  path.resolve('./src/routes'),
  path.resolve('./src/middleware')
];

let allFiles = [];
for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    allFiles = allFiles.concat(getFiles(dir));
  }
}

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix syntax error introduced by previous script (rateLimit closing brace)
  // We'll replace `  },\n};` with `  },\n});` where it applies.
  content = content.replace(/message:\s*\{\s*success:\s*false,\s*message:\s*".*?",\s*\},\s*\n\};/g, (match) => {
    return match.replace(/\n\};$/, '\n});');
  });
  
  // Actually, the regex above might be too specific. Let's just fix rateLimit({ ... }; to rateLimit({ ... });
  content = content.replace(/rateLimit\(\{(.*?)\n\};/gs, 'rateLimit({$1\n});');

  // Remove asyncHandler from routes e.g. asyncHandler(login) -> login
  content = content.replace(/asyncHandler\((.*?)\)/g, '$1');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
}
console.log('Fix complete.');
