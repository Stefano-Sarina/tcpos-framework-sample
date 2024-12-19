const fs = require('fs');
const updateVersionHistory = (targetFile) => {
  const version = JSON.parse(
      JSON.stringify(require('../package.json'))).version;
  const versionInfo = JSON.parse(
      JSON.stringify(require('../package.json'))).versionInfo;
  if (versionInfo) {
    const versionDescription = versionInfo.description ?? '';
    const versionBuild = !!versionInfo.build;
    const versionDate = new Date().toISOString().split('T')[0];
    const commitId = versionInfo.commitId ?? "";
    let currentVersionList = JSON.parse(JSON.stringify(
        require(targetFile)));
    if (currentVersionList && currentVersionList[0]) {
      if (currentVersionList[0].version !== version) {
        currentVersionList = [
          {
            version: version,
            description: versionDescription,
            build: versionBuild,
            date: versionDate,
            commitId: commitId
          }, ...currentVersionList];
        fs.writeFileSync(targetFile,
            JSON.stringify(currentVersionList, null, 2));
      }
    }
  }
}

module.exports = { updateVersionHistory };