const fs = require('fs');
const path = require('path');
const config = require('../config');
const log = require('../libs/log')(module);

module.exports = (db) => {
    const copyNumber = config.get('autosave:copyNumber');
    const root = config.get('autosave:root');
    // const root = config.get('autosaveDir');

    const projectName = config.get('inits:projectName');
    const instanceName = config.get('instanceName');

    if (!fs.existsSync(root)) {
        throw Error(`Dir not exists: ${root}`);
    }

    let curIndex = 0;
    setInterval(() => {
        log.info(curIndex++);
        if (curIndex >= copyNumber) {
            curIndex = 0;
        }
        const filePath = path.normalize(path.join(root, `${instanceName}-${projectName}-base${curIndex + 1}.json`));
        log.info(`filePath:${filePath}`);

        //  fs.writeFile(filePath, filePath, function(err) {
        db.getDatabase().then((data) => {
            fs.writeFile(filePath, JSON.stringify(data, null, 2), (err2) => {
                if (err2) { console.error(err2); }
            });
        }).catch(err => console.error(err));

        // (err, data) => {
        //     if (err) { console.error(err); return; }
        // });
    }, config.get('autosave:interval'));
};
