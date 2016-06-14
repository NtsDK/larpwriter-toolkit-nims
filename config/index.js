var nconf = require('nconf');
var path = require('path');
var fs = require("fs");

//nconf.argv().env().file({file: path.join(__dirname, "config.json")});
nconf.argv().env();
var configFile = path.join(__dirname, "config.json");

if (nconf.get("configFile")) {
    configFile = nconf.get("configFile");
    
}

if (!fs.existsSync(configFile)) {
    throw {
        name : "FileNotFoundException",
        message : "Unable to find configFile " + configFile
    };
}
nconf.file({file: configFile});

module.exports = nconf;