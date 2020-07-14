
const name2str = a => a.displayName.toLowerCase();

class RemotePermissionInformer {
    state = {
        summary: {}
    }


    refresh = () => new Promise((resolve, reject) => {
        this.refreshInner((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    refreshInner = (callback) => {
        const request = $.ajax({
            url: '/api/getPermissionsSummary',
            dataType: 'text',
            method: 'GET',
            contentType: 'application/json;charset=utf-8',
            timeout: Constants.httpTimeout
        });

        request.done((data) => {
            this.state.summary = JSON.parse(data);
            if (callback) {
                callback();
            } else {
                this.subscribe();
            }
            //        alert(data);
            //        alert(state.summary);
        });

        request.fail((errorInfo, textStatus, errorThrown) => {
            if (callback) {
                callback(errorInfo.responseText || 'error');
            } else {
                setTimeout(this.subscribe, 500);
            }
        });
    };
    subscribe = () => {
        const request = $.ajax({
            url: '/api/subscribeOnPermissionsUpdate',
            dataType: 'text',
            method: 'GET',
            contentType: 'application/json;charset=utf-8',
            timeout: Constants.httpTimeout
        });

        request.done((data) => {
            this.state.summary = JSON.parse(data);
            //        alert(data);
            //        alert(state.summary);
            this.subscribe();
        });

        request.fail((errorInfo, textStatus, errorThrown) => {
            setTimeout(this.subscribe, 500);
        });
    };




    isAdmin = () => Promise.resolve(this.state.summary.isAdmin);

    isEditor = () => Promise.resolve(this.state.summary.isEditor);

    isObjectEditableSync = (type, name) => {
        if (this.state.summary.isEditor) {
            return true;
        }
        if (this.state.summary.existEditor) {
            return false;
        }
        return this.state.summary.user[type].indexOf(name) !== -1;
    };

    isEntityEditable = ({ type, name } = {}) => Promise.resolve(this.isObjectEditableSync(type, name));

    getEntityNamesArray = ({ type, editableOnly } = {}) => new Promise((resolve, reject) => {
        const userEntities = this.state.summary.user[type];
        const allEntities = this.state.summary.all[type];
        const ownerMap = this.state.summary.ownerMaps[type];
        const names = allEntities.filter((name) => {
            if (editableOnly) {
                return this.isObjectEditableSync(type, name);
            }
            return true;
        }).map(name => ({
            displayName: `${ownerMap[name]}. ${name}`,
            value: name,
            editable: this.isObjectEditableSync(type, name),
            isOwner: userEntities.indexOf(name) !== -1,
            hasOwner: ownerMap[name] !== '-'
        }));



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

    areAdaptationsEditable = ({ adaptations } = {}) => new Promise((resolve, reject) => {
        const map = {};
        const { isAdaptationRightsByStory } = this.state.summary;

        adaptations.forEach((elem) => {
            const key = `${elem.storyName}-${elem.characterName}`;
            if (isAdaptationRightsByStory) {
                map[key] = this.isObjectEditableSync('story', elem.storyName);
            } else {
                map[key] = this.isObjectEditableSync('character', elem.characterName);
            }
        });

        resolve(map);
    });
}

const remotePermissionInformer = new RemotePermissionInformer();

remotePermissionInformer.refreshInner();

export default remotePermissionInformer;

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
