const vis = require('vis');
require('vis/dist/vis.min.css');
require('./gears.css');
//const Constants = require('dbms/constants');
//const R = require('ramda');
const { saveAs } = require('file-saver');

/*Copyright 2015-2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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
 Utils, DBMS
 */

const root = '.gears-tab';
const state = {};
const l10n = L10n.get('gears');
state.nodesDataset = new vis.DataSet();
state.edgesDataset = new vis.DataSet();

exports.init = () => {
    state.addNodeDialog = UI.createModalDialog(root, updateNode, {
        bodySelector: 'add-or-edit-node-body',
        dialogTitle: 'gears-add-node',
        actionButtonTitle: 'common-save',
        onCancel: onNodeCancel
    });

    state.editNodeDialog = UI.createModalDialog(root, updateNode, {
        bodySelector: 'add-or-edit-node-body',
        dialogTitle: 'gears-edit-node',
        actionButtonTitle: 'common-save',
        onCancel: onNodeCancel
    });

    state.renameEdgeDialog = UI.createModalDialog(root, renameEdge, {
        bodySelector: 'modal-prompt-body',
        dialogTitle: 'gears-rename-edge',
        actionButtonTitle: 'common-save',
    });

    const configureNetworkDialog = UI.createModalDialog(root, dialog => () => dialog.hideDlg(), {
        bodySelector: 'config-inner-body',
        dialogTitle: 'gears-configure-network',
        actionButtonTitle: 'common-close',
    });

    U.addClass(U.qee(configureNetworkDialog, '.modal-dialog'), 'gears-config-dialog');

    U.queryEl(`${root} .custom-physics-settings`).value = '';

    //        document.querySelector('.nodesText').value = charExample;
    //        U.setAttr(document.querySelector('.nodesText'),'rows', charExample.split('\n').length);
    //        document.querySelector('.edgesText').value = edgesExample;
    //        U.setAttr(document.querySelector('.edgesText'),'rows', edgesExample.split('\n').length);

    U.listen(U.qe(`${root} .draw-button`), 'click', exports.refresh);
    U.listen(U.qe(`${root} .get-image-button`), 'click', getImage);
    U.listen(U.qe(`${root} .download-button`), 'click', downloadCsv);
    U.listen(U.qe(`${root} .download-json-button`), 'click', downloadJSON);
    U.listen(U.qe(`${root} .download-graphml-button`), 'click', downloadYED);
    U.listen(U.qe(`${root} .clear-button`), 'click', clearNetwork);

    U.listen(U.queryEl(`${root} .physics-settings-button`), 'click', () => configureNetworkDialog.showDlg());

    U.listen(U.queryEl(`${root} .search-node`), 'change', onNodeFocus);

    U.listen(U.queryEl(`${root} .custom-physics-settings-button`), 'click', () => {
        let options = U.queryEl(`${root} .custom-physics-settings`).value;
        if (options.trim() === '') {
            return;
        }
        if (R.startsWith('var options = ', options)) {
            options = options.substring('var options = '.length);
        }
        try {
            options = JSON.parse(options);
        } catch (e) {
            console.error(e);
            UI.alert(l10n('error-on-settings-loading'));
            return;
        }
        state.network.setOptions(options);
    });

    U.queryEl(`${root} .physics-enabled-checkbox`).checked = false;
    U.listen(U.queryEl(`${root} .physics-enabled-checkbox`), 'change', (event) => {
        DBMS.setGearsPhysicsEnabled({ enabled: event.target.checked }).then(() => {
            state.network.setOptions({
                physics: {
                    enabled: event.target.checked,
                    minVelocity: 0.75
                }
            });
        }).catch(UI.handleError);
    });

    U.queryEl(`${root} .show-notes-checkbox`).checked = false;
    U.listen(U.queryEl(`${root} .show-notes-checkbox`), 'change', (event) => {
        DBMS.setGearsShowNotesEnabled({ enabled: event.target.checked })
            .then(exports.refresh).catch(UI.handleError);
    });

    U.queryEl(`${root} .big-picture-checkbox`).checked = false;
    U.listen(U.queryEl(`${root} .big-picture-checkbox`), 'change', (event) => {
        U.setClassByCondition(U.queryEl(`${root} .mynetwork > div`), 'big-picture', event.target.checked);
    });

    state.nodesDataset.on('*', () => {
        fillSearchSelect();
    });
    exports.content = U.queryEl(root);
};

exports.refresh = () => {
    DBMS.getAllGearsData().then((data) => {
        U.queryEl(`${root} .show-notes-checkbox`).checked = data.settings.showNotes;
        U.queryEl(`${root} .physics-enabled-checkbox`).checked = data.settings.physicsEnabled;

        data.nodes.forEach((node) => {
            node.label = makeLabel(node.name, node.notes);
        });
        state.nodesDataset.clear();
        state.nodesDataset.add(data.nodes);
        state.edgesDataset.clear();
        state.edgesDataset.add(data.edges);
        drawNetwork();
    }).catch(UI.handleError);
};

// create a network
function drawNetwork() {
    const container = U.qe(`${root} .mynetwork`);
    U.clearEl(U.queryEl(`${root} .configInner`));
    const options = {
        locale: L10n.getLocale(),
        locales: Constants.visLocales,
        manipulation: {
            addNode(data, callback) {
                data.label = '';
                data.name = '';

                U.qee(state.addNodeDialog, '.node-id').value = data.id;
                U.qee(state.addNodeDialog, '.node-name').value = data.name;
                U.qee(state.addNodeDialog, '.node-group').value = '';
                U.qee(state.addNodeDialog, '.node-notes').value = '';

                state.nodeData = data;
                state.nodeCallback = callback;

                state.addNodeDialog.showDlg();
            },
            editNode(data, callback) {
                U.qee(state.editNodeDialog, '.node-id').value = data.id;
                U.qee(state.editNodeDialog, '.node-name').value = data.name;
                U.qee(state.editNodeDialog, '.node-group').value = data.group;
                U.qee(state.editNodeDialog, '.node-notes').value = data.notes;

                state.nodeData = data;
                state.nodeCallback = function (data2) {
                    callback(data2);
                };

                state.editNodeDialog.showDlg();
            },
            addEdge(data, callback) {
                data.arrows = 'to';
                data.label = '';
                if (data.from === data.to) {
                    UI.confirm(l10n('do-you-want-to-connect-node-to-itself'), () => {
                        callback(data);
                    }, () => callback());
                } else {
                    callback(data);
                }
            },
            editEdge(data, callback) {
                callback(data);
                storeData();
            },
            deleteNode(data, callback) {
                callback(data);
                storeData();
            },
            deleteEdge(data, callback) {
                callback(data);
                storeData();
            },
        },
        physics: {
            enabled: U.queryEl(`${root} .physics-enabled-checkbox`).checked,
            stabilization: false
        },
        edges: {
            smooth: {
                type: 'discrete',
                forceDirection: 'none'
            }
        },
        configure: {
            filter(option, path) {
                if (path.indexOf('physics') !== -1) {
                    return true;
                }
                if (path.indexOf('smooth') !== -1 || option === 'smooth') {
                    return true;
                }
                return false;
            },
            container: U.qe(`${root} .configInner`)
        }
    };
    const data = {
        nodes: state.nodesDataset,
        edges: state.edgesDataset
    };
    state.network = new vis.Network(container, data, options);
    state.network.on('selectEdge', showEdgeLabelEditor);
    state.network.on('dragEnd', params => storeData());
    state.network.on('stabilized', params => storeData());
}

function storeData(callback) {
    DBMS.setGearsData({ data: exportNetwork() }).then(() => {
        if (callback) callback();
    }).catch(UI.handleError);
}

function exportNetwork() {
    state.network.storePositions();
    const nodePositions = state.network.getPositions();

    console.log(nodePositions);
    const nodes = R.clone(state.nodesDataset.get());
    const edges = state.edgesDataset.get();
    nodes.forEach(node => delete node.color);
    return {
        nodes,
        edges
    };
}

function importNetwork(data) {
    const { nodes, edges } = data;
    state.nodesDataset.clear();
    state.edgesDataset.clear();
    state.nodesDataset.update(nodes);
    state.edgesDataset.update(edges);
}

function showEdgeLabelEditor(params) {
    if (params.edges.length !== 0 && params.nodes.length === 0) {
        const edge = state.edgesDataset.get(params.edges[0]);
        U.qee(state.renameEdgeDialog, '.entity-input').value = edge.label || '';
        state.edgeData = edge;
        state.edgeCallback = state.edgesDataset.update;
        state.renameEdgeDialog.showDlg();
    }
}

function makeLabel(name, notes) {
    let label = prepareStr(name);
    if (U.queryEl(`${root} .show-notes-checkbox`).checked) {
        label += (notes.trim() !== '' ? (`\n\n${prepareStr(notes)}`) : '');
    }
    return label;
}

function prepareStr(text) {
    const maxStrLength = 30;
    return text.split('\n').map((str, i, strings) => {
        let counter = 0;
        const words = str.split(' ');
        return words.reduce((acc, word) => {
            if ((counter + word.length + 1) <= maxStrLength) {
                acc += `${word} `;
                counter += word.length + 1;
            } else {
                acc += `\n${word} `;
                counter = 0;
            }
            return acc;
        }, '');
    }).join('\n');


//        return text.split('\n').map(R.splitEvery(30)).map(R.join('-\n')).join('\n');
}


function getImage(event) {
    const canvas = document.querySelector('canvas');

    const context = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    context.globalCompositeOperation = 'destination-over';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, w, h);

    U.setAttr(event.target, 'download', FileUtils.makeFileName('gears', 'png'));

    const img = canvas.toDataURL('image/png');
    const link = document.querySelector('.link');
    event.target.href = img;
    drawNetwork();
}

function clearNetwork() {
    UI.confirm(l10n('confirm-clearing'), () => {
        state.nodesDataset.clear();
        state.edgesDataset.clear();
        storeData(exports.refresh);
    });
}

function updateNodeTextArea() {
    document.querySelector('.nodesText').value = state.nodesDataset.map(node => [node.name, node.group, node.notes].join('\t')).join('\n');
}

function updateEdgeTextArea() {
    document.querySelector('.edgesText').value = state.edgesDataset.map(edge => [state.nodesDataset.get(edge.from).name, edge.label,
        state.nodesDataset.get(edge.to).name].join('\t')).join('\n');
}

function fillSearchSelect() {
    const arr = state.nodesDataset.map(node => ({ name: node.name, value: node.id }));
    arr.sort(CU.charOrdAFactory(a => a.name.toLowerCase()));
    U.fillSelector(U.clearEl(U.queryEl('.search-node')), arr);
}

function downloadCsv() {
    const arr = state.nodesDataset.map(node => [node.name, node.group, node.notes]);
    const arr2 = state.edgesDataset.map(edge => [state.nodesDataset.get(edge.from).name, edge.label,
        state.nodesDataset.get(edge.to).name]);

    FileUtils.arr2d2Csv(arr.concat([['']]).concat(arr2), 'gears');
}

function downloadJSON() {
    const arr = state.nodesDataset.map(node => [node.name, node.group, node.notes]);
    const arr2 = state.edgesDataset.map(edge => [state.nodesDataset.get(edge.from).name, edge.label,
        state.nodesDataset.get(edge.to).name]);

    const out = new Blob([JSON.stringify({ nodes: arr, edges: arr2 }, null, '  ')], {
        type: 'application/json;charset=utf-8;'
    });
    saveAs(out, FileUtils.makeFileName('gears', 'json'));
}

function downloadYED() {
    const arr = state.nodesDataset.map(node => [node.name, node.group, node.notes]);
    const arr2 = state.edgesDataset.map(edge => [state.nodesDataset.get(edge.from).name, edge.label,
        state.nodesDataset.get(edge.to).name]);

    const groups = {};
    let index = 1;
    state.nodesDataset.forEach((node) => {
        if (groups[node.group] === undefined) {
            groups[node.group] = index;
            index++;
        }
    });

    const nodes = state.nodesDataset.map((node) => {
        const colors = Constants.colorPalette[groups[node.group] - 1].color;
        return CU.strFormat(Constants.yedNodeTmpl, [node.id, node.label, colors.background, colors.border]);
    }).join('\n');

    const edges = state.edgesDataset.map(edge => CU.strFormat(Constants.yedEdgeTmpl, [edge.id, edge.label || '', edge.from, edge.to])).join('\n');
    const out = new Blob([CU.strFormat(Constants.yedGmlBase, [nodes, edges])], {
        type: 'text/xml;charset=utf-8;'
    });
    saveAs(out, FileUtils.makeFileName('gears', 'graphml'));
}

function onNodeFocus(event) {
    state.network.focus(event.target.value, Constants.snFocusOptions);
}

function renameEdge(dialog) {
    return () => {
        if (state.edgeData) {
            const toInput = U.qee(dialog, '.entity-input');
            const label = toInput.value.trim();
            const edge = state.edgeData;
            edge.label = label;
            toInput.value = '';
            state.edgeCallback(edge);
            state.edgeData = null;
            state.edgeCallback = null;
            storeData();
            dialog.hideDlg();
        }
    };
}

function updateNode(dialog) {
    return () => {
        if (state.nodeData) {
            let data = state.nodeData;
            data.id = U.qee(dialog, '.node-id').value;
            data.name = U.qee(dialog, '.node-name').value;
            data.group = U.qee(dialog, '.node-group').value;
            data.notes = U.qee(dialog, '.node-notes').value;
            data.label = makeLabel(data.name, data.notes);
            data.shape = 'box';

            const extraFields = R.difference(R.keys(data), Constants.gearsNodeRequiredFields);
            data = R.omit(extraFields, data);

            state.nodeCallback(data);

            state.nodeData = null;
            state.nodeCallback = null;
            storeData(exports.refresh);
            dialog.hideDlg();
        }
    };
}

function onNodeCancel() {
    if (state.nodeData) {
        state.nodeCallback(null);
        state.nodeData = null;
        state.nodeCallback = null;
    }
}
// })(window.Gears = {});
