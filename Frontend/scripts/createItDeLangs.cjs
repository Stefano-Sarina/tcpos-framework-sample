const fs = require("fs");
var dirname = '../backoffice-lang/lang';

const newDataEn =  JSON.parse(fs.readFileSync(dirname+"/en.json"));
const newDataIt =  JSON.parse(fs.readFileSync(dirname+"/it.json"));
const newDataDe =  JSON.parse(fs.readFileSync(dirname+"/de.json"));

Object.keys(newDataEn).forEach(key => {
    if (!newDataIt[key]) {
        newDataIt[key] = "";
    }
    if (!newDataDe[key]) {
        newDataDe[key] = "";
    }
})

fs.writeFileSync(dirname+"/it.json" ,JSON.stringify(newDataIt));
fs.writeFileSync(dirname+"/de.json" ,JSON.stringify(newDataDe));