/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

exports.refresh = () => {
    return Promise.resolve();
};

exports.isAdmin = () => {
    return Promise.resolve(true);
};

exports.isEditor = () => {
    return Promise.resolve(true);
};

exports.getEntityNamesArray = ({type, editableOnly}={}) => {
    return new Promise((resolve, reject) => {
        // function processNames(err, names) {
        //     if (err) { UI.handleError(err); return; }
        // }
        // DBMS.getEntityNamesArray(type, processNames);
        const Utils2 = UI;
        DBMS.getEntityNamesArray({type}).then( names => {
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
};

exports.isEntityEditable = ({type, name}={}) => {
    return Promise.resolve(true);
};

exports.areAdaptationsEditable = ({adaptations}={}) => {
    const map = {};
    adaptations.forEach((elem) => {
        map[`${elem.storyName}-${elem.characterName}`] = true;
    });

    return Promise.resolve(map);
};


