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
 Utils, DBMS
 */

'use strict';

((exports) => {
    const root = '.gears-tab';
    const state = {};
    const l10n = L10n.get('gears');
    state.nodesDataset = new vis.DataSet();
    state.edgesDataset = new vis.DataSet();
    
    function renameEdge(dialog) {
        return () => {
            if(state.edgeData){
                const toInput = qee(dialog, '.entity-input');
                const label = toInput.value.trim();
                const edge = state.edgeData;
                edge.label = label;
                toInput.value = '';
                state.edgeCallback(edge);
                state.edgeData = null;
                state.edgeCallback = null;
                dialog.hideDlg();
            }
        }
    }
    function updateNode(dialog) {
        return () => {
            if( state.nodeData ){
                const data = state.nodeData;
                data.id = qee(dialog, '.node-id').value;
                data.name = qee(dialog, '.node-name').value;
                data.group = qee(dialog, '.node-group').value;
                data.notes = qee(dialog, '.node-notes').value;
                data.label = makeLabel(data.name, data.notes);
                data.shape = 'box';
                
                state.nodeCallback(data);
//                state.nodesDataset.update(data);
                
                state.nodeData = null;
                state.nodeCallback = null;
                
                dialog.hideDlg();
            }
        };
    }

    exports.init = () => {
        state.addNodeDialog = UI.createModalDialog(root,
                updateNode, {
                bodySelector: 'add-or-edit-node-body',
                dialogTitle: 'gears-add-node',
                actionButtonTitle: 'common-save',
            }
        );
        
        state.editNodeDialog = UI.createModalDialog(root,
                updateNode, {
                bodySelector: 'add-or-edit-node-body',
                dialogTitle: 'gears-edit-node',
                actionButtonTitle: 'common-save',
            }
        );
        
        state.renameEdgeDialog = UI.createModalDialog(root,
            renameEdge, {
                bodySelector: 'modal-prompt-body',
                dialogTitle: 'gears-rename-edge',
                actionButtonTitle: 'common-save',
            }
        );
        
        const configureNetworkDialog = UI.createModalDialog(root, (dialog) => () => dialog.hideDlg(), {
                bodySelector: 'config-inner-body',
                dialogTitle: 'gears-configure-network',
                actionButtonTitle: 'common-close',
            }
        );
        
        addClass(qee(configureNetworkDialog, '.modal-dialog'), 'gears-config-dialog');
        
        queryEl(`${root} .custom-physics-settings`).value = '';
        
        document.querySelector('.nodesText').value = charExample;
        setAttr(document.querySelector('.nodesText'),'rows', charExample.split('\n').length);
        document.querySelector('.edgesText').value = edgesExample;
        setAttr(document.querySelector('.edgesText'),'rows', edgesExample.split('\n').length);
        
        listen(qe(`${root} .draw-button`), 'click', exports.refresh);
        listen(qe(`${root} .get-image-button`), 'click', getImage);
        listen(qe(`${root} .download-button`), 'click', downloadCsv);
        listen(qe(`${root} .download-json-button`), 'click', downloadJSON);
        listen(qe(`${root} .download-graphml-button`), 'click', downloadYED);
        listen(qe(`${root} .clear-button`), 'click', clearNetwork);
        
//        listen(queryEl(`${root} .save-edge-button`), 'click', updateEdge);
//        listenOnEnter(queryEl(`${root} .add-edge-label-input`), () => queryEl(`${root} .save-edge-button`).click());
//        listen(queryEl(`${root} .cancel-add-edge-button`), 'click', cancel('.board-add-edge-popup'));
        
//        listen(queryEl(`${root} .close-settings-popup-button`), 'click', cancel(`${root} .config`));
//        listen(queryEl(`${root} .physics-settings-button`), 'click', () => showPopup(`${root} .config`, true));
        listen(queryEl(`${root} .physics-settings-button`), 'click', () => configureNetworkDialog.showDlg());
        
        listen(queryEl(`${root} .search-node`), 'change', onNodeFocus);
        
        listen(queryEl(`${root} .custom-physics-settings-button`), 'click', () => {
            const options = queryEl(`${root} .custom-physics-settings`).value;
            if(options.trim() === ''){
                return;
            }
            if(CommonUtils.startsWith(options, 'var options = ')){
                options = options.substring('var options = '.length);
            }
            try{
                options = JSON.parse(options);
            }catch(e){
                console.error(e);
                alert(l10n('error-on-settings-loading'));
                return;
            }
            state.network.setOptions(options);
        });
        
        queryEl(`${root} .physics-enabled-checkbox`).checked = false;
        listen(queryEl(`${root} .physics-enabled-checkbox`), 'change', (event) => {
            state.network.setOptions({
                "physics": {
                    "enabled": event.target.checked,
                    "minVelocity": 0.75
                }
            })
        });
        
        queryEl(`${root} .show-notes-checkbox`).checked = false;
        listen(queryEl(`${root} .show-notes-checkbox`), 'change', exports.refresh);
        
        queryEl(`${root} .big-picture-checkbox`).checked = false;
        listen(queryEl(`${root} .big-picture-checkbox`), 'change', (event) => {
            setClassByCondition(queryEl(`${root} .mynetwork > div`),'big-picture',event.target.checked);
        });
        
        state.nodesDataset.on('*', () => {
//            updateNodeTextArea();
            fillSearchSelect();
        });
//        state.edgesDataset.on('*', () => {
//            updateEdgeTextArea();
//        });
        parseData();
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        drawNetwork();
    };
    
    // create a network
    function drawNetwork() {
      const container = qe(`${root} .mynetwork`);
      clearEl(queryEl(`${root} .configInner`));
      const options = {
        locale: 'ru',
        locales: Constants.visLocales,
        manipulation: {
            addNode: function (data, callback) {
                
//                qee(state.renameProfileItemDialog, '.entity-input').value = profileSettings.name;
//                state.renameProfileItemDialog.fromName = profileSettings.name;
//                state.renameProfileItemDialog.showDlg();                
                
//              state.
//              // filling in the popup DOM elements
                data.label = '';
                data.name = '';
                
                qee(state.addNodeDialog, '.node-id').value = data.id;
                qee(state.addNodeDialog, '.node-name').value = data.name;
                qee(state.addNodeDialog, '.node-group').value = '';
                qee(state.addNodeDialog, '.node-notes').value = '';
                
                state.nodeData = data;
                state.nodeCallback = callback;
                
                state.addNodeDialog.showDlg();
//              document.getElementById('node-id').value = data.id;
//              document.getElementById('node-label').value = data.name;
//              document.getElementById('node-group').value = "";
//              document.getElementById('node-notes').value = "";
//              document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
              
//              document.getElementById('cancelButton').onclick = clearPopUp.bind();
//              document.getElementById('network-popUp').style.display = 'block';
//              document.getElementById('node-label').focus();
            },
            editNode: function (data, callback) {
//                data.label = '';
//                data.name = '';
                
                qee(state.editNodeDialog, '.node-id').value = data.id;
                qee(state.editNodeDialog, '.node-name').value = data.name;
                qee(state.editNodeDialog, '.node-group').value = data.group;
                qee(state.editNodeDialog, '.node-notes').value = data.notes;
                
                state.nodeData = data;
                state.nodeCallback = function(data) {
                    callback(data);
                }.bind(this);
                
                state.editNodeDialog.showDlg();
//              // filling in the popup DOM elements
//              document.getElementById('node-id').value = data.id;
//              document.getElementById('node-label').value = data.name;
//              document.getElementById('node-group').value = data.group;
//              document.getElementById('node-notes').value = data.notes;
//              document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
//              document.getElementById('cancelButton').onclick = cancelEdit.bind(this,callback);
//              document.getElementById('network-popUp').style.display = 'block';
//              document.getElementById('node-label').focus();
            },
            addEdge: function (data, callback) {
              data.arrows ='to';
              if (data.from == data.to) {
                const r = confirm(l10n('do-you-want-to-connect-node-to-itself'));
                if (r == true) {
                  callback(data);
                  //updateTextAreas();
                }
              }
              else {
                callback(data);
                //updateTextAreas();
              }
            },
            editEdge:function (data, callback) {
              callback(data);
              //updateTextAreas();
            },
            deleteNode:function (data, callback) {
              callback(data);
              //updateTextAreas();
            },
            deleteEdge:function (data, callback) {
              callback(data);
              //updateTextAreas();
            },
        },
        physics: {
          enabled: queryEl(`${root} .physics-enabled-checkbox`).checked,
          stabilization: false
        },
        "edges": {
          "smooth": {
            "type": "discrete",
            "forceDirection": "none"
          }
        },
        configure: {
          filter:function (option, path) {
            if (path.indexOf('physics') !== -1) {
              return true;
            }
            if (path.indexOf('smooth') !== -1 || option === 'smooth') {
              return true;
            }
            return false;
          },
          container: qe(`${root} .configInner`)
        }
      };
      const data = {
        nodes: state.nodesDataset,
        edges: state.edgesDataset
      };
      state.network = new vis.Network(container, data, options);
      state.network.on('selectEdge', showEdgeLabelEditor);
//      state.network.on('deselectEdge', hideEdgeLabelEditor);
      state.network.on('dragEnd', function (params) {
//          console.log('drag end')
          console.log(exportNetwork())
//          importNetwork(exportNetwork())
      });
      state.network.on('stabilized', function (params) {
//          console.log('drag end')
          console.log(exportNetwork())
//          importNetwork(exportNetwork())
      });
    }
    
    function exportNetwork() {
//        clearOutputArea();
        state.network.storePositions();
        const nodePositions = state.network.getPositions();
//        R.keys(nodePositions).map(id => state.nodesDataset.get(id))
        
        console.log(nodePositions);
        const nodes = state.nodesDataset.get();
        const edges = state.edgesDataset.get();
        return {
            nodes,
            edges
        };
//        importNetwork({
//            nodes,
//            edges
//        });
        
        
//        console.log(state.nodesDataset.get());
//        console.log(state.edgesDataset.get());
//        const nodes = objectToArray(state.network.getPositions());
//        nodes.forEach(addConnections);
//        return nodes;
        // pretty print node data
//        const exportValue = JSON.stringify(nodes, undefined, 2);
//        exportArea.value = exportValue;
//        resizeExportArea();
    }
    
    function importNetwork(data) {
        const {nodes, edges} = data;
        state.nodesDataset.clear();
        state.edgesDataset.clear();
        state.nodesDataset.update(nodes);
        state.edgesDataset.update(edges);
//        const inputValue = exportArea.value;
//        const inputData = JSON.parse(inputValue);

//        const data = {
//            nodes: getNodeData(nodes),
//            edges: getEdgeData(nodes)
//        }
//        
//        state.network.setData(data);

//        network = new vis.Network(container, data, {});
//
//        resizeExportArea();
    }
    
//    function getNodeData(data) {
//        const networkNodes = [];
//
//        data.forEach(function(elem, index, array) {
//            networkNodes.push({id: elem.id, label: elem.id, x: elem.x, y: elem.y});
//        });
//
//        return new vis.DataSet(networkNodes);
//    }
    
//    function getEdgeData(data) {
//        const networkEdges = [];
//
//        data.forEach(function(node) {
//            // add the connection
//            node.connections.forEach(function(connId, cIndex, conns) {
//                networkEdges.push({from: node.id, to: connId});
//                let cNode = getNodeById(data, connId);
//
//                const elementConnections = cNode.connections;
//
//                // remove the connection from the other node to prevent duplicate connections
//                const duplicateIndex = elementConnections.findIndex(function(connection) {
//                  return connection == node.id; // double equals since id can be numeric or string
//                });
//
//
//                if (duplicateIndex != -1) {
//                  elementConnections.splice(duplicateIndex, 1);
//                };
//          });
//        });
//
//        return new vis.DataSet(networkEdges);
//    }
    
//    function getNodeById(data, id) {
//        for (let n = 0; n < data.length; n++) {
//            if (data[n].id == id) {  // double equals since id can be numeric or string
//              return data[n];
//            }
//        };
//
//        throw 'Can not find id \'' + id + '\' in data';
//    }
//    
//    function addConnections(elem, index) {
//        // need to replace this with a tree of the network, then get child direct children of the element
//        elem.connections = state.network.getConnectedNodes(index);
//    }
//    
//    function objectToArray(obj) {
//        return Object.keys(obj).map(function (key) {
//          obj[key].id = key;
//          return obj[key];
//        });
//    }

    function showEdgeLabelEditor(params) {
        if (params.edges.length !== 0 && params.nodes.length === 0) {
//            listen(qee(row, '.rename'), 'click', () => {
            const edge = state.edgesDataset.get(params.edges[0]);
            qee(state.renameEdgeDialog, '.entity-input').value = edge.label || '';
//                state.renameEdgeDialog.fromName = profileSettings.name;
//            state.renameEdgeDialog.edge = edge;
            state.edgeData = edge;
            state.edgeCallback = (edge) => state.edgesDataset.update(edge);
            state.renameEdgeDialog.showDlg();
//            });
            
//            const edge = state.edgesDataset.get(params.edges[0]);
//            state.modifyArgs = {
//                edge,
//                callback(edge2) {
//                    if (edge2) {
//                        state.edgesDataset.update(edge2);
//                    }
//                },
//                editEdge: true
//            };
//            queryEl(`${root} .add-edge-label-input`).value = edge.label || '';
//            showPopup('.board-add-edge-popup', true);
//            queryEl(`${root} .add-edge-label-input`).focus();
        }
    }
//    function hideEdgeLabelEditor(params) {
//        showPopup('.board-add-edge-popup', false);
//    }

//    function showPopup(selector, show) {
//        setClassByCondition(queryEl(selector), 'hidden', !show);
//    }

    function clearPopUp() {
//      document.getElementById('saveButton').onclick = null;
//      document.getElementById('cancelButton').onclick = null;
//      document.getElementById('network-popUp').style.display = 'none';
    }

    function cancelEdit(callback) {
      clearPopUp();
      callback(null);
    }

//    function saveData(data,callback) {
//      data.id = document.getElementById('node-id').value;
//      data.name = document.getElementById('node-label').value;
//      data.group = document.getElementById('node-group').value;
//      data.notes = document.getElementById('node-notes').value;
//      data.label = makeLabel(data.name, data.notes);
//      data.shape = 'box';
//      clearPopUp();
//      callback(data);
//    }

    function makeLabel(name, notes){
      let label = name; 
      if(queryEl(`${root} .show-notes-checkbox`).checked){
        label += (notes.trim() !== '' ? ('\n\n' + prepareStr(notes)) : '');
      }
      return label;
    }

    function prepareStr(str) {
        return str.split('\n').map(R.splitEvery(20)).map(R.join('\n')).join('\n');
    }

    function parseData(){
//      nodes = [];
      let nodes = [];
      let dictionary = {};
      const nodesText = document.querySelector('.nodesText').value;
      nodesText.split('\n').filter(el => el.trim() !== '').forEach((str, index) => {
        let arr = str.split('\t');
        dictionary[arr[0].toLowerCase().trim()] = index;
        const label = makeLabel(arr[0], arr[2]);
        nodes.push({
          id: index,
          label,
          group: arr[1],
          notes: arr[2],
          name: arr[0],
          shape: 'box'
        })
      });
      
      state.nodesDataset.clear();
      state.nodesDataset.add(nodes);
      
//      edges = [];
      let edges = [];
      const edgesText = document.querySelector('.edgesText').value;
      edgesText.split('\n').filter(el => el.trim() !== '').forEach((str, index) => {
        let arr = str.split('\t');
        
        let from = arr[0].toLowerCase().trim();
        let to = arr[2].toLowerCase().trim();
        if(dictionary[from] !== undefined && dictionary[to] !== undefined){
          edges.push({
            from: dictionary[from],
            to: dictionary[to],
            label: arr[1],
            arrows:'to',
          })
        }
        
      });
      
      state.edgesDataset.clear();
      state.edgesDataset.add(edges);
    }



    function getImage(event){
//      const data = exportNetwork(); 
      const canvas = document.querySelector("canvas");
      
      const context = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#ffffff";
      context.fillRect(0,0,w,h);
      
      const img    = canvas.toDataURL("image/png");
      const link = document.querySelector(".link");
      event.target.href = img;
//      importNetwork(data);
      drawNetwork();
    }

    function clearNetwork(){
//        Utils.confirm(getL10n('utils-new-base-warning'), () => {
//            DBMS.setDatabase(CommonUtils.clone(EmptyBase.data), state.callback);
//        });
      const r = confirm(l10n('confirm-clearing'));
      if (r == true) {
        document.querySelector('.nodesText').value = '';
        document.querySelector('.edgesText').value = '';
        exports.refresh();
      }
    }

//    function updateEdge() {
//        const input = queryEl(`${root} .add-edge-label-input`);
//        const label = input.value.trim();
//        const { edge } = state.modifyArgs;
//        edge.label = label;
//        showPopup('.board-add-edge-popup', false);
//        input.value = '';
//        state.modifyArgs.callback(edge);
//    }

//    function cancel(selector) {
//        return () => {
//            showPopup(selector, false);
//            state.modifyArgs.callback();
//        };
//    }

    function updateNodeTextArea(){
      document.querySelector('.nodesText').value = state.nodesDataset.map((node) => [node.name, node.group, node.notes].join('\t')).join('\n');
    }

    function updateEdgeTextArea(){
      document.querySelector('.edgesText').value = state.edgesDataset.map((edge) => [state.nodesDataset.get(edge.from).name, edge.label, 
          state.nodesDataset.get(edge.to).name].join('\t')).join('\n');
    }

    function fillSearchSelect(){
      const arr = state.nodesDataset.map((node) => ({name: node.name, value: node.id}));
      arr.sort(CommonUtils.charOrdAFactory(a => a.name.toLowerCase()));
      fillSelector(clearEl(queryEl('.search-node')), arr);
    }

    function downloadCsv() {
        const arr = state.nodesDataset.map((node) => [node.name, node.group, node.notes]);
        const arr2 = state.edgesDataset.map((edge) => [state.nodesDataset.get(edge.from).name, edge.label, 
          state.nodesDataset.get(edge.to).name]);
          
        FileUtils.arr2d2Csv(arr.concat([['']]).concat(arr2), 'cogs.csv');
    }

    function downloadJSON() {
      const arr = state.nodesDataset.map((node) => [node.name, node.group, node.notes]);
      const arr2 = state.edgesDataset.map((edge) => [state.nodesDataset.get(edge.from).name, edge.label, 
        state.nodesDataset.get(edge.to).name]);
        
      const out = new Blob([JSON.stringify({nodes: arr, edges: arr2}, null, '  ')], {
          type: 'application/json;charset=utf-8;'
      });
      saveAs(out, 'cogs.json');
    }

    function downloadYED() {
      const arr = state.nodesDataset.map((node) => [node.name, node.group, node.notes]);
      const arr2 = state.edgesDataset.map((edge) => [state.nodesDataset.get(edge.from).name, edge.label, 
        state.nodesDataset.get(edge.to).name]);
      
      const groups = {};
      let index = 1;
      state.nodesDataset.map(node => {
        if(groups[node.group] === undefined){
          groups[node.group] = index;
          index++;
        }
      });
        
      const nodes = state.nodesDataset.map(node => {
        const colors = Constants.colorPalette[groups[node.group]-1].color;
        return CommonUtils.strFormat(Constants.yedNodeTmpl, [node.id, node.name, colors.background, colors.border]);
      }).join('\n');
      
      const edges = state.edgesDataset.map(edge => {
        return CommonUtils.strFormat(Constants.yedEdgeTmpl, [edge.id, edge.label, edge.from, edge.to]);
      }).join('\n');
      const out = new Blob([CommonUtils.strFormat(Constants.yedGmlBase, [nodes, edges])], {
          type: 'text/xml;charset=utf-8;'
      });
      saveAs(out, 'cogs.graphml');
    }

    function onNodeFocus(event) {
        state.network.focus(event.target.value, Constants.snFocusOptions);
    }

    var charExample = `Арагорн	персонаж	
Бильбо	персонаж	Удачливый, старый
Фродо	персонаж	Юркий, слабый
кольцо	предмет	
Назгул	персонаж	бессмертный`;

    var edgesExample = `Фродо	несет	Кольцо
Бильбо	ждет	Фродо
Назгул	ищет	Фродо
Фродо	убегает от	Назгул
Арагорн	ищет	Назгул`;

})(this.Gears = {});
