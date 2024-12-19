const _ = require("underscore");
const fs = require("fs");
const path = require("path");
let existingData;
try {
existingData = fs.readFileSync(
    path.resolve(__dirname, '../../backoffice-lang/lang/en.json'));

}catch (e) {
  console.error(e);
}
const existingJson = existingData?JSON.parse(existingData): {};

module.exports = {
    format: function (msgs) {
  return _(msgs).reduce((memo, value, key) => {
    if (value.defaultMessage) {
      //if I have the default message I use it as an ID (TCPOS compliancy)
      memo[value.defaultMessage] = value;
    } else {
      //if I don't have a default probably I'm in the web business logic and the default is the id;
      memo[key] = {...value, defaultMessage: existingJson[key]?String(existingJson[key]):key};
    }
    return memo;
  }, {});
}
};
