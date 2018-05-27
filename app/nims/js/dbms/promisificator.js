/*Copyright 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

((exports) => {
    exports.promisify = (src, dst) => {
        Object.keys(src.__proto__).forEach((name) => {
            dst.prototype[name + 'Pm'] = function () {
                if (CommonUtils.startsWith(name, 'get') || CommonUtils.startsWith(name, 'is') || R.equals(name, 'log')) {
                    const arr = [];
                    for (let i = 0; i < arguments.length; i++) {
                        arr.push(arguments[i]);
                    }
                    
                    return new Promise(function(resolve, reject) {
                        arr.push(function(err, value) {
                            if(err) {reject(err); return;}
                            resolve(value);
                        });
                        this.dbms[name].apply(this.dbms, arr);
                    }.bind(this));
                } else {
                    const arr = [];
                    for (let i = 0; i < arguments.length; i++) {
                        arr.push(arguments[i]);
                    }
                    
                    CallNotificator.onCallStart();
                    
                    return new Promise(function(resolve, reject) {
                        arr.push(function(err, value) {
                            CallNotificator.onCallFinished(err);
                            
                            if(err) {reject(err); return;}
                            resolve();
                        });
                        this.dbms[name].apply(this.dbms, arr);
                    }.bind(this));
                }
            }
        });
    }
    
    
})(this.Promisificator = {});
