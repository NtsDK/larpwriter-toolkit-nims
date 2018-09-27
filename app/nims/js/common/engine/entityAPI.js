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

'use strict';

/* eslint-disable func-names */

((callback2) => {
    function entityAPI(LocalDBMS, opts) {
        const {
            R, Constants, Errors, CU, PC
        } = opts;

        LocalDBMS.prototype.getEntityNamesArray = function (type, callback) {
            this.getEntityNamesArrayNew({type}).then(res => callback(null, res)).catch(callback);
        };
        LocalDBMS.prototype.getEntityNamesArrayNew = function ({type}={}) {
            return new Promise((resolve,reject) => {
                const chain = PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.ownedEntityTypes)]);
                const callback = (err, result) => {
                    if(err){
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
                PC.precondition(chain, reject, () => {
                    switch (type) {
                    case 'character':
                    case 'player':
                        this.getProfileNamesArray(type, callback);
                        break;
                    case 'group':
                        this.getGroupNamesArray(callback);
                        break;
                    case 'story':
                        this.getStoryNamesArray(callback);
                        break;
                    default:
                        reject(new Errors.InternalError('errors-unexpected-switch-argument', [type]));
                    }
                });
            });
        };
    }
    callback2(entityAPI);
})(api => (typeof exports === 'undefined' ? (this.entityAPI = api) : (module.exports = api)));
