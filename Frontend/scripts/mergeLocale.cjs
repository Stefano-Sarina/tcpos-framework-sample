const fs = require("fs");
var dirname = './lang';

const merged = fs.readdirSync(dirname).reduce((memo,name) => {

    memo[name.replace(/\.json/,"")] = JSON.parse(fs.readFileSync(dirname+"/"+name));
    return memo;
},{});


fs.writeFileSync("./locales/locale.json",JSON.stringify(merged));
