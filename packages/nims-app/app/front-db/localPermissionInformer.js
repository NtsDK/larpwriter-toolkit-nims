exports.refresh = () => Promise.resolve();

exports.isAdmin = () => Promise.resolve(true);

exports.isEditor = () => Promise.resolve(true);

exports.getEntityNamesArray = ({ type, editableOnly } = {}) => new Promise((resolve, reject) => {
    // function processNames(err, names) {
    //     if (err) { UI.handleError(err); return; }
    // }
    // DBMS.getEntityNamesArray(type, processNames);
    const Utils2 = UI;
    DBMS.getEntityNamesArray({ type }).then((names) => {
        const newNames = [];
        names.forEach((name) => {
            newNames.push({
                displayName: name,
                value: name,
                editable: true
            });
        });
        resolve(newNames);
    }).catch(Utils2.handleError);
});

exports.isEntityEditable = ({ type, name } = {}) => Promise.resolve(true);

exports.areAdaptationsEditable = ({ adaptations } = {}) => {
    const map = {};
    adaptations.forEach((elem) => {
        map[`${elem.storyName}-${elem.characterName}`] = true;
    });

    return Promise.resolve(map);
};
