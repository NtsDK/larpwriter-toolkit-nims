const { EventEmitter } = require('events');

((callback2) => {
    function baseAPI(LocalDBMS, opts) {
        const {
            Migrator, Constants, PC, R
        } = opts;

        LocalDBMS.prototype._init = function (listeners) {
            this.ee = new EventEmitter();
            const that = this;
            Object.keys(listeners).forEach((triggerName) => {
                listeners[triggerName].forEach((listener) => {
                    that.ee.on(triggerName, listener.bind(that));
                });
            });
        };

        // DBMS.get
        LocalDBMS.prototype.getDatabase = function () {
            this.database.Meta.saveTime = new Date().toString();
            return Promise.resolve(R.clone(this.database));
        };

        // DBMS.set
        LocalDBMS.prototype.setDatabase = function ({ database } = {}) {
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
        LocalDBMS.prototype.getMetaInfo = function () {
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
        LocalDBMS.prototype.setMetaInfoString = function ({ name, value } = {}) {
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
        LocalDBMS.prototype.setMetaInfoDate = function ({ name, value } = {}) {
            return new Promise((resolve, reject) => {
                const chain = PC.chainCheck([PC.isString(name), PC.elementFromEnum(name, Constants.metaInfoDates),
                    PC.isString(value)]);
                PC.precondition(chain, reject, () => {
                    this.database.Meta[name] = value;
                    resolve();
                });
            });
        };
    }

    callback2(baseAPI);
})(api => (typeof exports === 'undefined' ? (this.baseAPI = api) : (module.exports = api)));
