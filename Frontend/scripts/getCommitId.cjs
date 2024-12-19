const fs = require('fs');
const fileName = '../webdaily-UI/package.json';

require('child_process').exec('git rev-parse HEAD', function(err, stdout) {
  const file = JSON.parse(fs.readFileSync(fileName));
  file.versionInfo.commitId = stdout.toString().trim();
  fs.writeFileSync(fileName, JSON.stringify(file, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
    console.log(stdout.toString().trim());
    console.log('Writing to ' + fileName);
  });
});
