/*Copyright 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
    function logAPI(LocalDBMS, opts) {
        const { R, CU, PC, Constants } = opts;

        const filterMap = [
            ['date', 1],
            ['user', 2],
            ['action', 3],
            ['params', 4],
            ['status', 5],
        ];

        LocalDBMS.prototype.log = function (userName, time, funcName, rewrite, params, status, callback) {
            const chain = PC.chainCheck([PC.isString(userName), PC.isString(time), PC.isString(funcName),
                PC.isBoolean(rewrite), PC.isArray(params), PC.isString(status)]);
            PC.precondition(chain, err => console.error(err), () => {
                const info = [userName, time, funcName, JSON.stringify(params), status];
                if (this.database) {
                    if (rewrite && this.database.Log[this.database.Log.length - 1] !== undefined) {
                        if (this.database.Log[this.database.Log.length - 1][2] === funcName) {
                            this.database.Log[this.database.Log.length - 1] = info;
                        }
                    } else {
                        this.database.Log.push(info);
                        if (this.database.Log.length > 2000) {
                            this.database.Log.splice(0, 1000);
                        }
                    }
                    //                console.log(this.database.Log.length);
                }
                console.log(CU.strFormat('{0},{1},{2},{3},{4}', info));
                if (callback) callback();
            });
        };


        LocalDBMS.prototype.getLog = function (pageNumber, filter, callback) {
            const chain = PC.chainCheck([PC.isNumber(pageNumber), PC.isObject(filter)]);
            PC.precondition(chain, callback, () => {
                const chain2 = PC.chainCheck([PC.elementsFromEnum(
                    R.keys(filter),
                    Constants.logFilterTypes
                )].concat(R.values(filter).map(PC.isString)));
                PC.precondition(chain2, callback, () => {
                    const tmp = this.database.Log.map((arr, i) => [i + 1].concat(arr))
                        .filter(arr => filterMap.every((pair) => {
                            if (filter[pair[0]] === undefined) return true;
                            return arr[pair[1]].toLowerCase().indexOf(filter[pair[0]].toLowerCase()) !== -1;
                        }));

                    const max = tmp.length;
                    const requestedLog = R.slice((pageNumber * 100), ((pageNumber + 1) * 100), R.reverse(tmp));

                    callback(null, {
                        requestedLog,
                        pageNumber,
                        max,
                        logSize: Math.ceil(max / 100)
                    });
                });
            });
        };
    }

    callback2(logAPI);
})(api => (typeof exports === 'undefined' ? (this.logAPI = api) : (module.exports = api)));
