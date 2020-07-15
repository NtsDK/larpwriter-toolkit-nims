import { UI } from 'nims-app-core';

class LocalPermissionInformer {
    refresh = () => Promise.resolve();

    isAdmin = () => Promise.resolve(true);

    isEditor = () => Promise.resolve(true);

    getEntityNamesArray = ({ type, editableOnly } = {}) => new Promise((resolve, reject) => {
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

    isEntityEditable = ({ type, name } = {}) => Promise.resolve(true);

    areAdaptationsEditable = ({ adaptations } = {}) => {
        const map = {};
        adaptations.forEach((elem) => {
            map[`${elem.storyName}-${elem.characterName}`] = true;
        });

        return Promise.resolve(map);
    };
}

const localPermissionInformer = new LocalPermissionInformer();

export default localPermissionInformer;
