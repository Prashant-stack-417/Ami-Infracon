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

  // 1. Remove imports
  content = content.replace(/import\s+\{\s*ApiResponse\s*\}\s+from\s+['"].*?apiResponse\.js['"];?\n?/g, '');
  content = content.replace(/import\s+\{\s*ApiError\s*\}\s+from\s+['"].*?apiError\.js['"];?\n?/g, '');
  content = content.replace(/import\s+\{\s*asyncHandler\s*\}\s+from\s+['"].*?asyncHandler\.js['"];?\n?/g, '');

  // 2. Replace new ApiError(..., ...) with throw Object.assign(new Error(...), { statusCode: ... })
  content = content.replace(/new\s+ApiError\(\s*(\d+)\s*,\s*([^,]+?)\s*\)/gs, 'Object.assign(new Error($2), { statusCode: $1 })');
  
  // 3. Replace new ApiResponse(..., ..., ...) with { success: true, data: ..., message: ... }
  content = content.replace(/new\s+ApiResponse\(\s*(\d+)\s*,\s*([^,]+?)\s*,\s*(.+?)\s*\)/gs, (match, status, data, msg) => {
    // Some messages have trailing commas, remove it if so
    msg = msg.trim().replace(/,$/, '');
    return `{ success: true, data: ${data}, message: ${msg} }`;
  });

  // 4. Remove asyncHandler wrapping
  content = content.replace(/asyncHandler\(\s*async\s*\((.*?)\)\s*=>\s*\{/gs, 'async ($1) => {');
  // For routes: asyncHandler(funcName)
  content = content.replace(/asyncHandler\(([a-zA-Z0-9_]+)\)/g, '$1');

  if (file.includes('controllers')) {
    content = content.replace(/^\}\);\s*$/gm, '};');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log('Fix complete.');
