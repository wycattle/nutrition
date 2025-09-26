
//this file is designed to recursively generate and print 
// a visual representation of a directory structure (a "tree") to the console.

const fs = require('fs');
const path = require('path');

function shouldIgnore(path, ignorePatterns) {
  return ignorePatterns.some(pattern => path.includes(pattern));
}

function generateProjectTree(dirPath, prefix = '', ignorePatterns = []) {
  const relativePath = path.relative('./', dirPath);
  if (shouldIgnore(relativePath, ignorePatterns)) {
    return;
  }

  const dirContents = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = dirContents.filter(dirent => dirent.isFile() && !shouldIgnore(path.join(relativePath, dirent.name), ignorePatterns));
  const directories = dirContents.filter(dirent => dirent.isDirectory() && !shouldIgnore(path.join(relativePath, dirent.name), ignorePatterns));

  directories.forEach((dir, index) => {
    console.log(`${prefix}${index < directories.length - 1 || files.length ? '├──' : '└──'} ${dir.name}`);
    generateProjectTree(path.join(dirPath, dir.name), `${prefix}${index < directories.length - 1 || files.length ? '│   ' : '    '}`, ignorePatterns);
  });

  files.forEach((file, index) => {
    console.log(`${prefix}${index < files.length - 1 ? '├──' : '└──'} ${file.name}`);
  });
}

// Example usage: Ignoring 'node_modules', '.git', and anything within '.next' directory
generateProjectTree('./', '', [
  'node_modules', 
  '.git', 
  '.next',
'.env'

]);