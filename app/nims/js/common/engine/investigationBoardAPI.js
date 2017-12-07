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
    function investigationBoardAPI(LocalDBMS, opts) {
        const {
            R, Constants, Errors, addListener, CU, PC
        } = opts;

        const resourcesPath = ['InvestigationBoard', 'resources'];
        const groupsPath = ['InvestigationBoard', 'groups'];
        const relationsPath = ['InvestigationBoard', 'relations'];
        const context = 'investigation-board';

        LocalDBMS.prototype.getInvestigationBoardData = function (callback) {
            callback(null, CU.clone(this.database.InvestigationBoard));
        };

        LocalDBMS.prototype.addBoardGroup = function (groupName, callback) {
            const container = R.path(groupsPath, this.database);
            const chain = PC.chainCheck([PC.entityExistsCheck(groupName, R.keys(this.database.Groups)),
                PC.entityIsNotUsed(groupName, R.keys(container))]);
            PC.precondition(chain, callback, () => {
                container[groupName] = {
                    name: groupName,
                    notes: ''
                };
                this.ee.trigger('nodeAdded', [groupName, 'groups']);
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.switchGroups = function (fromName, toName, callback) {
            const container = R.path(groupsPath, this.database);
            const check = PC.switchEntityCheck(fromName, toName, R.keys(this.database.Groups), R.keys(container));
            PC.precondition(check, callback, () => {
                const data = container[fromName];
                data.name = toName;
                container[toName] = data;
                delete container[fromName];
                this.ee.trigger('nodeRenamed', [fromName, toName, 'groups']);
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.setGroupNotes = function (groupName, notes, callback) {
            const container = R.path(groupsPath, this.database);
            const chain = PC.chainCheck([PC.entityExistsCheck(groupName, R.keys(this.database.Groups)),
                PC.entityExists(groupName, R.keys(container)), PC.isString(notes)]);
            PC.precondition(chain, callback, () => {
                container[groupName].notes = notes;
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.removeBoardGroup = function (groupName, callback) {
            const container = R.path(groupsPath, this.database);
            const chain = PC.chainCheck([PC.entityExistsCheck(groupName, R.keys(this.database.Groups)),
                PC.entityExists(groupName, R.keys(container))]);
            PC.precondition(chain, callback, () => {
                delete container[groupName];
                this.ee.trigger('nodeRemoved', [groupName, 'groups']);
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.createResource = function (resourceName, callback) {
            const container = R.path(resourcesPath, this.database);
            PC.precondition(PC.createEntityCheck(resourceName, R.keys(container)), callback, () => {
                container[resourceName] = {
                    name: resourceName
                };
                this.ee.trigger('nodeAdded', [resourceName, 'resources']);
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.renameResource = function (fromName, toName, callback) {
            const container = R.path(resourcesPath, this.database);
            PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(container)), callback, () => {
                const data = container[fromName];
                data.name = toName;
                container[toName] = data;
                delete container[fromName];
                this.ee.trigger('nodeRenamed', [fromName, toName, 'resources']);
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.removeResource = function (resourceName, callback) {
            const container = R.path(resourcesPath, this.database);
            PC.precondition(PC.removeEntityCheck(resourceName, R.keys(container)), callback, () => {
                delete container[resourceName];
                this.ee.trigger('nodeRemoved', [resourceName, 'resources']);
                if (callback) callback();
            });
        };

        const isNotResource = R.curry(id => () => {
            const info = _edgeEndId2info(id);
            return !R.equals('resources', info[0]) ? null : ['investigation-board-resource-node-cant-be-first'];
        });

        const edgeEndCheck = (id, database) => {
            const info = _edgeEndId2info(id);
            const container = R.path(info[0] === 'groups' ? groupsPath : resourcesPath, database);
            return PC.entityExists(info[1], R.keys(container));
        };

        const getEdgeList = container => R.flatten(R.toPairs(container).map(pair => R.keys(pair[1])
            .map(toId2 => `${pair[0]}-${toId2}`)));

        const edgeExistsCheck = (fromId, toId, container) => PC.chainCheck([PC.isString(fromId), PC.isString(toId),
            PC.entityExists(`${fromId}-${toId}`, getEdgeList(container))]);

        const edgeNotExistCheck = (fromId, toId, container) => PC.chainCheck([PC.isString(fromId), PC.isString(toId),
            PC.entityIsNotUsed(`${fromId}-${toId}`, getEdgeList(container))]);

        LocalDBMS.prototype.addEdge = function (fromId, toId, callback) {
            let chain = PC.chainCheck([PC.isString(fromId), PC.isString(toId)]);
            PC.precondition(chain, callback, () => {
                const container = R.path(relationsPath, this.database);
                chain = PC.chainCheck([isNotResource(fromId), edgeEndCheck(fromId, this.database),
                    edgeEndCheck(toId, this.database), edgeNotExistCheck(fromId, toId, container)]);
                PC.precondition(chain, callback, () => {
                    container[fromId][toId] = '';
                    if (callback) callback();
                });
            });
        };

        LocalDBMS.prototype.setEdgeLabel = function (fromId, toId, label, callback) {
            const container = R.path(relationsPath, this.database);
            const chain = PC.chainCheck([edgeExistsCheck(fromId, toId, container), PC.isString(label)]);
            PC.precondition(chain, callback, () => {
                container[fromId][toId] = label;
                if (callback) callback();
            });
        };

        LocalDBMS.prototype.removeEdge = function (fromId, toId, callback) {
            const container = R.path(relationsPath, this.database);
            PC.precondition(edgeExistsCheck(fromId, toId, container), callback, () => {
                delete container[fromId][toId];
                if (callback) callback();
            });
        };

        const _info2edgeEndId = (name, type) => (type === 'groups' ? 'group-' : 'resource-') + name;

        const _edgeEndId2info = (id) => {
            const info = [];
            if (CU.startsWith(id, 'resource-')) {
                info[0] = 'resources';
                info[1] = id.substring('resource-'.length);
                return info;
            } else if (CU.startsWith(id, 'group-')) {
                info[0] = 'groups';
                info[1] = id.substring('group-'.length);
                return info;
            }
            throw new Error(`Unknown type of edge end: ${id}`);
        };

        function _nodeAdded(nodeName, type) {
            if (type === 'resources') return;
            R.path(relationsPath, this.database)[_info2edgeEndId(nodeName, type)] = {};
        }

        addListener('nodeAdded', _nodeAdded);

        function _nodeRemoved(nodeName, type) {
            const relNodeName = _info2edgeEndId(nodeName, type);
            const data = R.path(relationsPath, this.database);
            delete data[relNodeName];
            R.values(data).forEach((item) => {
                delete item[relNodeName];
            });
        }

        addListener('nodeRemoved', _nodeRemoved);

        function _nodeRenamed(fromName, toName, group) {
            const container = R.path(relationsPath, this.database);
            const toId = _info2edgeEndId(toName, group);
            const fromId = _info2edgeEndId(fromName, group);
            if (group === 'groups') {
                container[toId] = container[fromId];
                delete container[fromId];
            }
            R.values(container).forEach((item) => {
                if (item[fromId] !== undefined) {
                    item[toId] = item[fromId];
                    delete item[fromId];
                }
            });
        }

        addListener('nodeRenamed', _nodeRenamed);

        function _renameGroup(fromName, toName) {
            const container = R.path(groupsPath, this.database);
            if (container[fromName] !== undefined) {
                const data = container[fromName];
                data.name = toName;
                container[toName] = data;
                delete container[fromName];

                _nodeRenamed.apply(this, [fromName, toName, 'groups']);
            }
        }

        addListener('renameGroup', _renameGroup);

        function _removeGroup(groupName) {
            let container = R.path(groupsPath, this.database);
            if (container[groupName] !== undefined) {
                delete container[groupName];

                container = R.path(relationsPath, this.database);
                const nodeId = _info2edgeEndId(groupName, 'groups');
                delete container[nodeId];
                R.values(container).forEach((item) => {
                    if (item[nodeId] !== undefined) {
                        delete item[nodeId];
                    }
                });
            }
        }

        addListener('removeGroup', _removeGroup);
    }

    callback2(investigationBoardAPI);
})(api => (typeof exports === 'undefined' ? (this.investigationBoardAPI = api) : (module.exports = api)));
