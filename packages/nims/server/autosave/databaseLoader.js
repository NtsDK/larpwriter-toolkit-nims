const fs = require('fs');
const path = require('path');
const config = require('../config');
const log = require('../libs/log')(module);

const copyNumber = config.get('autosave:copyNumber');
const root = config.get('autosave:root');
// const root = config.get('autosaveDir');

const projectName = config.get('inits:projectName');
const instanceName = config.get('instanceName');

if (!fs.existsSync(root)) {
    throw Error(`Dir not exists: ${root}`);
}

function loadLastDatabase() {
    let filePath, stat, file, date;
    for (let i = 0; i < copyNumber; i++) {
        log.info(i);
        filePath = path.normalize(path.join(root, `${instanceName}-${projectName}-base${i + 1}.json`));
        try {
            stat = fs.statSync(filePath);
            if (!file) {
                file = filePath;
                date = stat.mtime;
            } else if (date < stat.mtime) {
                file = filePath;
                date = stat.mtime;
            }
            log.info(date);
        } catch (e) {
            log.error(`Error on file check: ${filePath}, ${e}`);
        }
    }
    if (file) {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    return null;
}

exports.loadLastDatabase = loadLastDatabase;
