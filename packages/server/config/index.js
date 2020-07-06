const nconf = require('nconf');
const path = require('path');
const fs = require('fs');
const R = require('ramda');

nconf.argv().env();
let configFile = path.join(__dirname, 'config.json');
let globalConfigFile;

if (nconf.get('configFile')) {
    configFile = nconf.get('configFile');
}
if (nconf.get('globalConfigFile')) {
    globalConfigFile = nconf.get('globalConfigFile');
}

if (!fs.existsSync(configFile)) {
    throw Error(JSON.stringify({
        name: 'FileNotFoundException',
        message: `Unable to find configFile ${configFile}`
    }));
}
if (!globalConfigFile || !fs.existsSync(globalConfigFile)) {
    throw Error(JSON.stringify({
        name: 'FileNotFoundException',
        message: `Unable to find globalConfigFile ${globalConfigFile}`
    }));
}

// nconf.overrides(require('../' + configFile));
nconf.file('local', { file: configFile });
nconf.file('global', { file: globalConfigFile });

module.exports = nconf;
