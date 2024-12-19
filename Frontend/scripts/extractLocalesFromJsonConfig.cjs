const _ = require('underscore');
const fs = require('fs');
const path = require('path');

var dirname = './public/config';

let messages = [];
const getLabels = function(json) {
  if (_.isArray(json)) {
    _.map(json, el => getLabels(el));
  } else if (_.isObject(json)) {
    _.map(_.keys(json), el => {
      if (el === 'label' && json[el] !== "") {
        messages.push(json[el]);
      } else if (_.isArray(json[el]) || _.isObject(json[el])) {
        getLabels(json[el]);
      }
    });
  }
};

const getMessages = function() {
  fs.readdir(dirname, (err, files) => {
    if (!err) {
      files.forEach(file => {
        if (path.extname(file) === '.json') {
          console.log('Extracting locales from file: ' + file);
          getLabels(JSON.parse(fs.readFileSync(dirname + "/" + file)));
        }
      });
    }
    console.log("Removing extracted duplicates...");
    messages = _.uniq(messages);
    messages = _.object(messages, messages.map(m => m.toString()));
    console.log("Removing existing keys...");
    const defaultLangFile = '../backoffice-lang/lang/en.json';
    const existingKeys = JSON.parse(fs.readFileSync(defaultLangFile));
    const reducedMessages = _.omit(_.omit(messages, Object.keys(existingKeys)), "");
    let composedMessages = {...existingKeys, ...reducedMessages};
    /**
     * sort the map
     * @type {{}}
     */
    composedMessages = _(composedMessages).chain().keys().sortBy(x=>String(x)).reduce((memo, key)=>{
      memo[key] = composedMessages[key];
      return memo;
    },{}).value();


    fs.writeFileSync(defaultLangFile,
        JSON.stringify(composedMessages, null, "\t"));
    console.log("Generated file en.json")
  });

};

getMessages();