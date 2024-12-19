var fs = require('fs');
var path = require('path');
var {rimrafSync} = require('rimraf');

/**
 * DELETES all typescript definitions to run sub project from srn
 */

async function deleteFolderRecursive(path) {
  console.log('checking,', path);
  rimrafSync(path);

}
;

console.log('Cleaning working tree...');

const paths = [
  '@tcpos/backoffice-sample-app',
  '@tcpos/backoffice-components',
  '@tcpos/backoffice-core',
  '@tcpos/common-core',
  '@tcpos/common-components',
];

for (const id of paths) {
  let pathSegments;
  try {

    pathSegments = path.dirname(require.resolve(id+"/package.json"));
  } catch (e) {
    console.warn(`${id} not found`);
  }
  if (pathSegments)
    deleteFolderRecursive(path.resolve(pathSegments,  'dist'));
}

console.log('Successfully cleaned working tree!');
