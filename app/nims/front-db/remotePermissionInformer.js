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


//const R = require('ramda');

const state = {};
const Constants = require('common/constants');

state.summary = {};

exports.refresh = () => new Promise((resolve, reject) => {
    exports.refreshInner((err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

exports.refreshInner = (callback) => {
    const request = $.ajax({
        url: '/api/getPermissionsSummary',
        dataType: 'text',
        method: 'GET',
        contentType: 'application/json;charset=utf-8',
        timeout: Constants.httpTimeout
    });

    request.done((data) => {
        state.summary = JSON.parse(data);
        if (callback) {
            callback();
        } else {
            exports.subscribe();
        }
        //        alert(data);
        //        alert(state.summary);
    });

    request.fail((errorInfo, textStatus, errorThrown) => {
        if (callback) {
            callback(errorInfo.responseText || 'error');
        } else {
            setTimeout(exports.subscribe, 500);
        }
    });
};
exports.subscribe = () => {
    const request = $.ajax({
        url: '/api/subscribeOnPermissionsUpdate',
        dataType: 'text',
        method: 'GET',
        contentType: 'application/json;charset=utf-8',
        timeout: Constants.httpTimeout
    });

    request.done((data) => {
        state.summary = JSON.parse(data);
        //        alert(data);
        //        alert(state.summary);
        exports.subscribe();
    });

    request.fail((errorInfo, textStatus, errorThrown) => {
        setTimeout(exports.subscribe, 500);
    });
};


exports.refreshInner();

exports.isAdmin = () => Promise.resolve(state.summary.isAdmin);

exports.isEditor = () => Promise.resolve(state.summary.isEditor);

const isObjectEditableSync = (type, name) => {
    if (state.summary.isEditor) {
        return true;
    }
    if (state.summary.existEditor) {
        return false;
    }
    return state.summary.user[type].indexOf(name) !== -1;
};

exports.isEntityEditable = ({ type, name } = {}) => Promise.resolve(isObjectEditableSync(type, name));

exports.getEntityNamesArray = ({ type, editableOnly } = {}) => new Promise((resolve, reject) => {
    const userEntities = state.summary.user[type];
    const allEntities = state.summary.all[type];
    const ownerMap = state.summary.ownerMaps[type];
    const names = allEntities.filter((name) => {
        if (editableOnly) {
            return isObjectEditableSync(type, name);
        }
        return true;
    }).map(name => ({
        displayName: `${ownerMap[name]}. ${name}`,
        value: name,
        editable: isObjectEditableSync(type, name),
        isOwner: userEntities.indexOf(name) !== -1,
        hasOwner: ownerMap[name] !== '-'
    }));

    const name2str = a => a.displayName.toLowerCase();

    const entityCmp = CU.charOrdAFactoryBase('asc', (a, b) => {
        if (a.isOwner && b.isOwner) return name2str(a) > name2str(b);
        if (a.isOwner) return false;
        if (b.isOwner) return true;

        if (a.hasOwner && b.hasOwner) return name2str(a) > name2str(b);
        if (a.hasOwner) return false;
        if (b.hasOwner) return true;

        return name2str(a) > name2str(b);
    }, R.identity);

    //            names.sort(CU.charOrdAObject);
    names.sort(entityCmp);

    resolve(names);
});

exports.areAdaptationsEditable = ({ adaptations } = {}) => new Promise((resolve, reject) => {
    const map = {};
    const { isAdaptationRightsByStory } = state.summary;

    adaptations.forEach((elem) => {
        const key = `${elem.storyName}-${elem.characterName}`;
        if (isAdaptationRightsByStory) {
            map[key] = isObjectEditableSync('story', elem.storyName);
        } else {
            map[key] = isObjectEditableSync('character', elem.characterName);
        }
    });

    resolve(map);
});


// Object.keys(exports).forEach((funcName) => {
//     const oldFun = exports[funcName];
//     exports[funcName] = function () {
//         try {
//             // const exclude = ['_init','refreshInner', 'subscribe'];
//             // if(!funcName.endsWith('') && !R.contains(funcName, exclude)){
//             //     console.error('Old PermInfo call', funcName, arguments);
//             //     // console.trace('Old API call', funcName);
//             // }
//             return oldFun.apply(null, arguments);
//         } catch (err) {
//             const { length } = arguments;
//             const callbackPos = length + (typeof arguments[length - 1] === 'function' ? -1 : -2);
//             const callback = arguments[callbackPos];
//             console.error(funcName, err);
//             return callback(err);
//         }

//     };
// });
//     return exports;
// }
