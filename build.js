const { execSync } = require('child_process');
const { writeFile } = require('fs');

execSync('npx next build');

// Create an empty export file
writeFile('out/export-marker', '', (err) => {
  if (err) throw err;
});
