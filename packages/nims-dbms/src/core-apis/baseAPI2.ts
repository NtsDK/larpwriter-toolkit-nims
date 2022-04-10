// const { EventEmitter } = require('events');

import { EventEmitter } from 'events';
import * as R from 'ramda';

import * as Migrator from "../db-utils/migrator";
import * as Constants from "../nimsConstants";
import { PC } from "nims-dbms-core";
import type { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//     function baseAPI(LocalDBMS) {

// export function _init(this: ILocalDBMS, listeners) {
//     this.ee = new EventEmitter();
//     const that = this;
//     Object.keys(listeners).forEach((triggerName) => {
//         listeners[triggerName].forEach((listener) => {
//             that.ee.on(triggerName, listener.bind(that));
//         });
//     });
// };

// DBMS.get
export function getDatabase(this: ILocalDBMS) {
    this.database.Meta.saveTime = new Date().toString();
    return Promise.resolve(R.clone(this.database));
};

// DBMS.set
export function setDatabase(this: ILocalDBMS, { database }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            this.database = Migrator.migrate(database);
            this.ee.emit('setDatabase', [{ database, reject }]);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};
// DBMS.meta.get
export function getMetaInfo(this: ILocalDBMS) {
    return Promise.resolve(R.clone(this.database.Meta));
};
//  [
//      {
//          name: 'name',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'elementFromEnum',
//              arr: Constants.metaInfoStrings
//          }]
//      },
//      {
//          name: 'value',
//          check: [{
//              type: 'isString'
//          }]
//      },
//  ]
// overview
// DBMS.meta.property.set()
export function setMetaInfoString(this: ILocalDBMS, { name, value }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const chain = PC.chainCheck([PC.isString(name), PC.elementFromEnum(name, Constants.metaInfoStrings),
            PC.isString(value)]);
        PC.precondition(chain, reject, () => {
            this.database.Meta[name] = value;
            resolve();
        });
    });
};
//  [
//      {
//          name: 'name',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'elementFromEnum',
//              arr: Constants.metaInfoDates
//          }]
//      },
//      {
//          name: 'value',
//          check: [{
//              type: 'isString'
//          }, {
//              type: 'isDate',
//          }]
//      },
//  ]
export function setMetaInfoDate(this: ILocalDBMS, { name, value }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const chain = PC.chainCheck([PC.isString(name), PC.elementFromEnum(name, Constants.metaInfoDates),
            PC.isString(value)]);
        PC.precondition(chain, reject, () => {
            this.database.Meta[name] = value;
            resolve();
        });
    });
};
// }

//     callback2(baseAPI);
// })(api => (typeof exports === 'undefined' ? (this.baseAPI = api) : (module.exports = api)));
