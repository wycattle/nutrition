const fs = require('fs');

const filePath = 'D:/Git_repos/React/react_next_nutrition/node_modules/@prisma/client/runtime/library.js.map';

fs.access(filePath, fs.constants.F_OK, (err) => {
  if (err) {
    console.log('File does not exist');
  } else {
    console.log('File exists');
  }
});