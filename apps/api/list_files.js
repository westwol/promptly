const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'dist'); // or './dist'

fs.readdir(dir, (err, files) => {
  if (err) {
    console.error('Could not list the directory.', err);
    process.exit(1);
  }
  files.forEach((file) => {
    console.log(file);
  });
});
