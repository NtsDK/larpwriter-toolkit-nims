const nconf = require('nconf');
const path = require('path');
const fs = require('fs');

//nconf.argv().env().file({file: path.join(__dirname, "config.json")});
nconf.argv().env();
let configFile = path.join(__dirname, 'config.json');

if (nconf.get('configFile')) {
    configFile = nconf.get('configFile');
}

if (!fs.existsSync(configFile)) {
    throw new Error({
        name: 'FileNotFoundException',
        message: `Unable to find configFile ${configFile}`
    });
}
nconf.file({ file: configFile });

module.exports = nconf;
