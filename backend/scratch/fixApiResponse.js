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
  path.resolve('./src/controllers'),
  path.resolve('./src/middleware'),
  path.resolve('./src/routes')
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

  // Replace new ApiResponse with multi-line support
  content = content.replace(/new\s+ApiResponse\(\s*(\d+)\s*,\s*(.*?)\s*,\s*(["'`].*?["'`])\s*\)/gs, '{ success: true, data: $2, message: $3 }');

  // Replace new ApiError with multi-line support
  content = content.replace(/new\s+ApiError\(\s*(\d+)\s*,\s*(["'`].*?["'`])\s*\)/gs, 'Object.assign(new Error($2), { statusCode: $1 })');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log('Fix complete.');
