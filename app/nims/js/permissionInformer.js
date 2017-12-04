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

/*global
 */

'use strict';

(function (exports, mode) {
    const state = {};

    state.summary = {};

    if (mode === 'NIMS_Server' && PERMISSION_INFORMER_ENABLED) {
        exports.refresh = function (callback) {
            const request = $.ajax({
                url: '/getPermissionsSummary',
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

        exports.subscribe = function () {
            const request = $.ajax({
                url: '/subscribeOnPermissionsUpdate',
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

        exports.refresh();

        exports.isAdmin = function (callback) {
            callback(null, state.summary.isAdmin);
        };

        exports.isEditor = function (callback) {
            callback(null, state.summary.isEditor);
        };

        exports.isEntityEditable = function (type, entityName, callback) {
            callback(null, isObjectEditableSync(type, entityName));
        };

        var isObjectEditableSync = function (type, name) {
            if (state.summary.isEditor) {
                return true;
            }
            if (state.summary.existEditor) {
                return false;
            }
            return state.summary.user[type].indexOf(name) !== -1;
        };

        exports.getEntityNamesArray = R.curry((type, editableOnly, callback) => {
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
                isOwner: userEntities.indexOf(name) !== -1
            }));

            names.sort(Utils.charOrdAObject);

            callback(null, names);
        });

        exports.areAdaptationsEditable = function (adaptations, callback) {
            const map = {};
            const isAdaptationRightsByStory = state.summary.isAdaptationRightsByStory;

            adaptations.forEach((elem) => {
                const key = `${elem.storyName}-${elem.characterName}`;
                if (isAdaptationRightsByStory) {
                    map[key] = isObjectEditableSync('story', elem.storyName);
                } else {
                    map[key] = isObjectEditableSync('character', elem.characterName);
                }
            });

            callback(null, map);
        };
    } else if (mode === 'Standalone') {
        exports.refresh = function (callback) {
            callback();
        };

        exports.isAdmin = function (callback) {
            callback(null, true);
        };

        exports.isEditor = function (callback) {
            callback(null, true);
        };

        exports.getEntityNamesArray = R.curry((type, editableOnly, callback) => {
            function processNames(err, names) {
                if (err) { Utils.handleError(err); return; }
                const newNames = [];
                names.forEach((name) => {
                    newNames.push({
                        displayName: name,
                        value: name,
                        editable: true
                    });
                });
                callback(null, newNames);
            }
            DBMS.getEntityNamesArray(type, processNames);
        });

        exports.isEntityEditable = function (type, entityName, callback) {
            callback(null, true);
        };

        exports.areAdaptationsEditable = function (adaptations, callback) {
            const map = {};
            adaptations.forEach((elem) => {
                map[`${elem.storyName}-${elem.characterName}`] = true;
            });

            callback(null, map);
        };
    }
}(this.PermissionInformer = {}, MODE));
