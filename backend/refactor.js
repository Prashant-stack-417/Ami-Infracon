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

  // Remove imports
  content = content.replace(/import\s+\{\s*ApiError\s*\}\s*from\s*["'].*?apiError\.js["'];?\r?\n/g, '');
  content = content.replace(/import\s+\{\s*ApiResponse\s*\}\s*from\s*["'].*?apiResponse\.js["'];?\r?\n/g, '');
  content = content.replace(/import\s+\{\s*asyncHandler\s*\}\s*from\s*["'].*?asyncHandler\.js["'];?\r?\n/g, '');

  // Replace new ApiResponse(status, data, "msg") -> { success: true, data, message: "msg" }
  content = content.replace(/new\s+ApiResponse\(\s*(\d+)\s*,\s*(.*?)\s*,\s*(["'].*?["'])\s*\)/g, '{ success: true, data: $2, message: $3 }');

  // Replace throw new ApiError(code, "msg") -> throw Object.assign(new Error("msg"), { statusCode: code })
  content = content.replace(/new\s+ApiError\(\s*(\d+)\s*,\s*(["'].*?["'])\s*\)/g, 'Object.assign(new Error($2), { statusCode: $1 })');

  // Remove asyncHandler wrapping from named exports
  content = content.replace(/export\s+const\s+(\w+)\s*=\s*asyncHandler\(async\s*\((.*?)\)\s*=>\s*\{/g, 'export const $1 = async ($2) => {');
  
  // Remove asyncHandler wrapping from default exports or plain functions
  content = content.replace(/asyncHandler\(async\s*\((.*?)\)\s*=>\s*\{/g, 'async ($1) => {');



  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log('Refactor complete.');
