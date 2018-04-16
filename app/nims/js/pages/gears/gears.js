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
    const root = '.gears-tab ';
    const state = {};
    state.nodesDataset = new vis.DataSet();
    state.edgesDataset = new vis.DataSet();
    
    var nodes = [];
    var edges = [];
    var dictionary = {};

    exports.init = () => {
        queryEl(`${root}.custom-physics-settings`).value = '';
        
        document.querySelector('.nodesText').value = charExample;
        setAttr(document.querySelector('.nodesText'),'rows', charExample.split('\n').length);
        document.querySelector('.edgesText').value = edgesExample;
        setAttr(document.querySelector('.edgesText'),'rows', edgesExample.split('\n').length);
        
        document.querySelector('.draw-button').addEventListener('click', draw);
        document.querySelector('.get-image-button').addEventListener('click', getImage);
        document.querySelector('.download-button').addEventListener('click', downloadCsv);
        document.querySelector('.download-json-button').addEventListener('click', downloadJSON);
        document.querySelector('.download-graphml-button').addEventListener('click', downloadYED);
        document.querySelector('.clear-button').addEventListener('click', clearNetwork);
        var closeBtn = addEl(addClasses(makeEl('button'), ['btn','btn-default']),makeText('Закрыть'));
        
        listenOnEnter(queryEl(`${root}#node-label`), () => document.getElementById('saveButton').click());
        listenOnEnter(queryEl(`${root}#node-group`), () => document.getElementById('saveButton').click());
        listenOnEnter(queryEl(`${root}#node-notes`), () => document.getElementById('saveButton').click());
        
        listen(queryEl(`${root}.save-edge-button`), 'click', updateEdge);
        listenOnEnter(queryEl(`${root}.add-edge-label-input`), () => queryEl(`${root}.save-edge-button`).click());
        listen(queryEl(`${root}.cancel-add-edge-button`), 'click', cancel('.board-add-edge-popup'));
        
        listen(queryEl(`${root}.close-settings-popup-button`), 'click', cancel('#config'));
        listen(queryEl(`${root}.physics-settings-button`), 'click', () => showPopup(`${root}#config`, true));
        
        listen(queryEl(`${root}.search-node`), 'change', onNodeFocus);
        
        listen(queryEl(`${root}.custom-physics-settings-button`), 'click', () => {
            var options = queryEl(`${root}.custom-physics-settings`).value;
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
                alert('Ошибка при загрузке настроек');
                return;
            }
            state.network.setOptions(options);
        });
        
        queryEl(`${root}.physics-enabled-checkbox`).checked = false;
        listen(queryEl(`${root}.physics-enabled-checkbox`), 'change', (event) => {
            state.network.setOptions({
                "physics": {
                    "enabled": event.target.checked,
                    "minVelocity": 0.75
                }
            })
        });
        
        queryEl(`${root}.show-notes-checkbox`).checked = false;
        listen(queryEl(`${root}.show-notes-checkbox`), 'change', draw);
        
        listen(document, 'keyup', function(e) {
            if (e.keyCode == 27) { // escape key maps to keycode `27`
                queryEls(`${root}.hidable-popup`).forEach(el => addClass(el, 'hidden'));
            }
        });
        
        queryEl(`${root}.big-picture-checkbox`).checked = false;
        listen(queryEl(`${root}.big-picture-checkbox`), 'change', (event) => {
            setClassByCondition(queryEl(`${root}#mynetwork > div`),'big-picture',event.target.checked);
        });
        
        state.nodesDataset.on('*', () => {
            updateNodeTextArea();
            fillSearchSelect();
        });
        state.edgesDataset.on('*', () => {
            updateEdgeTextArea();
        });
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        draw();
    };
    



//    function init(){
//      
//      //draw();
//    }

    function draw(){
      parseData();
      drawNetwork();
    }

    // create a network
    function drawNetwork() {
      var container = document.getElementById('mynetwork');
      clearEl(queryEl('#configInner'));
      var options = {
        locale: 'ru',
        locales: visLocales,
        manipulation: {
            addNode: function (data, callback) {
              // filling in the popup DOM elements
              data.label = '';
              data.name = '';
              document.getElementById('operation').innerHTML = "Добавить узел";
              document.getElementById('node-id').value = data.id;
              document.getElementById('node-label').value = data.name;
              document.getElementById('node-group').value = "";
              document.getElementById('node-notes').value = "";
              document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
              document.getElementById('cancelButton').onclick = clearPopUp.bind();
              document.getElementById('network-popUp').style.display = 'block';
              document.getElementById('node-label').focus();
            },
            editNode: function (data, callback) {
              // filling in the popup DOM elements
              document.getElementById('operation').innerHTML = "Редактировать узел";
              document.getElementById('node-id').value = data.id;
              document.getElementById('node-label').value = data.name;
              document.getElementById('node-group').value = data.group;
              document.getElementById('node-notes').value = data.notes;
              document.getElementById('saveButton').onclick = saveData.bind(this, data, callback);
              document.getElementById('cancelButton').onclick = cancelEdit.bind(this,callback);
              document.getElementById('network-popUp').style.display = 'block';
              document.getElementById('node-label').focus();
            },
            addEdge: function (data, callback) {
              data.arrows ='to';
              if (data.from == data.to) {
                var r = confirm("Хотите ли вы присоединить узел к самому себе?");
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
          enabled: queryEl(`${root}.physics-enabled-checkbox`).checked,
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
          container: document.getElementById('configInner')
        }
      };
      const data = {
        nodes: state.nodesDataset,
        edges: state.edgesDataset
      };
      state.network = new vis.Network(container, data, options);
      state.network.on('selectEdge', showEdgeLabelEditor);
      state.network.on('deselectEdge', hideEdgeLabelEditor);
    }

    function showEdgeLabelEditor(params) {
        if (params.edges.length !== 0 && params.nodes.length === 0) {
            const edge = state.edgesDataset.get(params.edges[0]);
            state.modifyArgs = {
                edge,
                callback(edge2) {
                    if (edge2) {
                        state.edgesDataset.update(edge2);
                    }
                },
                editEdge: true
            };
            queryEl(`${root}.add-edge-label-input`).value = edge.label || '';
            showPopup('.board-add-edge-popup', true);
            queryEl(`${root}.add-edge-label-input`).focus();
        }
    }
    function hideEdgeLabelEditor(params) {
        showPopup('.board-add-edge-popup', false);
    }

    function showPopup(selector, show) {
        setClassByCondition(queryEl(selector), 'hidden', !show);
    }

    function clearPopUp() {
      document.getElementById('saveButton').onclick = null;
      document.getElementById('cancelButton').onclick = null;
      document.getElementById('network-popUp').style.display = 'none';
    }

    function cancelEdit(callback) {
      clearPopUp();
      callback(null);
    }

    function saveData(data,callback) {
      data.id = document.getElementById('node-id').value;
      data.name = document.getElementById('node-label').value;
      data.group = document.getElementById('node-group').value;
      data.notes = document.getElementById('node-notes').value;
      data.label = makeLabel(data.name, data.notes);
      data.shape = 'box';
      clearPopUp();
      callback(data);
    }

    function makeLabel(name, notes){
      let label = name; 
      if(queryEl(`${root}.show-notes-checkbox`).checked){
        label += (notes.trim() !== '' ? ('\n\n' + prepareStr(notes)) : '');
      }
      return label;
    }

    function prepareStr(str) {
        return str.split('\n').map(R.splitEvery(20)).map(R.join('\n')).join('\n');
    }

    function parseData(){
      nodes = [];
      const nodesText = document.querySelector('.nodesText').value;
      nodesText.split('\n').filter(el => el.trim() !== '').forEach((str, index) => {
        let arr = str.split('\t');
        dictionary[arr[0].toLowerCase().trim()] = index;
        var label = makeLabel(arr[0], arr[2]);
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
      
      edges = [];
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
      var canvas = document.querySelector("canvas");
      
      var context = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#ffffff";
      context.fillRect(0,0,w,h);
      
      var img    = canvas.toDataURL("image/png");
      var link = document.querySelector(".link");
      event.target.href = img;
      drawNetwork();
    }

    function clearNetwork(){
      var r = confirm("Очистка шестеренки необратима. Вы уверены?");
      if (r == true) {
        document.querySelector('.nodesText').value = '';
        document.querySelector('.edgesText').value = '';
        draw();
      }
    }

    function updateEdge() {
        const input = queryEl(`${root}.add-edge-label-input`);
        const label = input.value.trim();
        const { edge } = state.modifyArgs;
        edge.label = label;
        showPopup('.board-add-edge-popup', false);
        input.value = '';
        state.modifyArgs.callback(edge);
    }

    function cancel(selector) {
        return () => {
            showPopup(selector, false);
            state.modifyArgs.callback();
        };
    }

    function updateNodeTextArea(){
      document.querySelector('.nodesText').value = state.nodesDataset.map((node) => [node.name, node.group, node.notes].join('\t')).join('\n');
    }

    function updateEdgeTextArea(){
      document.querySelector('.edgesText').value = state.edgesDataset.map((edge) => [state.nodesDataset.get(edge.from).name, edge.label, 
          state.nodesDataset.get(edge.to).name].join('\t')).join('\n');
    }

    function fillSearchSelect(){
      var arr = state.nodesDataset.map((node) => ({name: node.name, value: node.id}));
      arr.sort(CommonUtils.charOrdAFactory(a => a.name.toLowerCase()));
      fillSelector(clearEl(queryEl('.search-node')), arr);
    }

    function downloadCsv() {
        var arr = state.nodesDataset.map((node) => [node.name, node.group, node.notes]);
        var arr2 = state.edgesDataset.map((edge) => [state.nodesDataset.get(edge.from).name, edge.label, 
          state.nodesDataset.get(edge.to).name]);
          
        arr2d2Csv(arr.concat([['']]).concat(arr2), 'cogs.csv');
    }

    function downloadJSON() {
      var arr = state.nodesDataset.map((node) => [node.name, node.group, node.notes]);
      var arr2 = state.edgesDataset.map((edge) => [state.nodesDataset.get(edge.from).name, edge.label, 
        state.nodesDataset.get(edge.to).name]);
        
      const out = new Blob([JSON.stringify({nodes: arr, edges: arr2})], {
          type: 'text/csv;charset=utf-8;'
      });
      saveAs(out, 'cogs.json');
    }

    function downloadYED() {
      var arr = state.nodesDataset.map((node) => [node.name, node.group, node.notes]);
      var arr2 = state.edgesDataset.map((edge) => [state.nodesDataset.get(edge.from).name, edge.label, 
        state.nodesDataset.get(edge.to).name]);
      
      var groups = {};
      var index = 1;
      state.nodesDataset.map(node => {
        if(groups[node.group] === undefined){
          groups[node.group] = index;
          index++;
        }
      });
        
      var nodes = state.nodesDataset.map(node => {
        var colors = colorPalette[groups[node.group]-1].color;
        return CommonUtils.strFormat(nodeTmpl, [node.id, node.name, colors.background, colors.border]);
      }).join('\n');
      
      var edges = state.edgesDataset.map(edge => {
        return CommonUtils.strFormat(edgeTmpl, [edge.id, edge.label, edge.from, edge.to]);
      }).join('\n');
      const out = new Blob([CommonUtils.strFormat(gmlBase, [nodes, edges])], {
          type: 'text/xml;charset=utf-8;'
      });
      saveAs(out, 'cogs.graphml');
    }




    function preprocessCsvStr(str) {
        if (!(typeof str === 'string' || str instanceof String)) {
            return str;
        }
        let result = str.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0) {
            result = `"${result}"`;
        }
        return result;
    }

    var arr2d2Csv = (arr, fileName) => {
        const csv = `\ufeff${arr.map(dataArray => dataArray.map(preprocessCsvStr).join(';')).join('\n')}`;

        const out = new Blob([csv], {
            type: 'text/csv;charset=utf-8;'
        });
        saveAs(out, fileName);
    };

    function onNodeFocus(event) {
        state.network.focus(event.target.value, snFocusOptions);
    }


    var visLocales = {
        ru: {
            edit: 'Редактировать',
            del: 'Удалить выбранное',
            back: 'Назад',
            addNode: 'Добавить узел',
            addEdge: 'Добавить связь',
            editNode: 'Редактировать узел',
            editEdge: 'Редактировать связь',
            addDescription: 'Кликните в свободное место, чтобы добавить новый узел.',
            edgeDescription: 'Кликните на узел и протяните связь к другому узлу, чтобы соединить их.',
            editEdgeDescription: 'Кликните на контрольные точки и перетащите их к другому узлу, чтобы соединить узлы.',
            createEdgeError: 'Невозможно соединить ребра в кластер.',
            deleteClusterError: 'Кластеры не могут быть удалены',
            editClusterError: 'Кластеры недоступны для редактирования.'
        },
        en: {
            edit: 'Edit',
            del: 'Delete selected',
            back: 'Back',
            addNode: 'Add Node',
            addEdge: 'Add Edge',
            editNode: 'Edit Node',
            editEdge: 'Edit Edge',
            addDescription: 'Click in an empty space to place a new node.',
            edgeDescription: 'Click on a node and drag the edge to another node to connect them.',
            editEdgeDescription: 'Click on the control points and drag them to a node to connect to it.',
            createEdgeError: 'Cannot link edges to a cluster.',
            deleteClusterError: 'Clusters cannot be deleted.',
            editClusterError: 'Clusters cannot be edited.'
        }
    };
    
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

    var snFocusOptions = {
        scale: 1.2,
        offset: {
            x: 0,
            y: 0
        },
        animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
        }
    };

    var gmlBase = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:java="http://www.yworks.com/xml/yfiles-common/1.0/java" xmlns:sys="http://www.yworks.com/xml/yfiles-common/markup/primitives/2.0" xmlns:x="http://www.yworks.com/xml/yfiles-common/markup/2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:y="http://www.yworks.com/xml/graphml" xmlns:yed="http://www.yworks.com/xml/yed/3" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd">
      <!--Created by yEd 3.15.0.2-->
      <key attr.name="Description" attr.type="string" for="graph" id="d0"/>
      <key for="port" id="d1" yfiles.type="portgraphics"/>
      <key for="port" id="d2" yfiles.type="portgeometry"/>
      <key for="port" id="d3" yfiles.type="portuserdata"/>
      <key attr.name="url" attr.type="string" for="node" id="d4"/>
      <key attr.name="description" attr.type="string" for="node" id="d5"/>
      <key for="node" id="d6" yfiles.type="nodegraphics"/>
      <key for="graphml" id="d7" yfiles.type="resources"/>
      <key attr.name="url" attr.type="string" for="edge" id="d8"/>
      <key attr.name="description" attr.type="string" for="edge" id="d9"/>
      <key for="edge" id="d10" yfiles.type="edgegraphics"/>
      <graph edgedefault="directed" id="G">
        <data key="d0"/>
        {0}
        {1}
      </graph>
      <data key="d7">
        <y:Resources/>
      </data>
    </graphml>`;

    var nodeTmpl = `<node id="{0}">
          <data key="d5"/>
          <data key="d6">
            <y:ShapeNode>
              <y:Geometry height="45.0" width="151.0" x="94.0" y="152.75"/>
              <y:Fill color="{2}" transparent="false"/>
              <y:BorderStyle color="{3}" type="line" width="1.0"/>
              <y:NodeLabel alignment="center" autoSizePolicy="content" fontFamily="Dialog" fontSize="12" fontStyle="plain" hasBackgroundColor="false" hasLineColor="false" height="18.701171875" modelName="custom" textColor="#000000" visible="true" width="35.8515625" x="57.57421875" y="13.1494140625">{1}<y:LabelModel>
                  <y:SmartNodeLabelModel distance="4.0"/>
                </y:LabelModel>
                <y:ModelParameter>
                  <y:SmartNodeLabelModelParameter labelRatioX="0.0" labelRatioY="0.0" nodeRatioX="0.0" nodeRatioY="0.0" offsetX="0.0" offsetY="0.0" upX="0.0" upY="-1.0"/>
                </y:ModelParameter>
              </y:NodeLabel>
              <y:Shape type="roundrectangle"/>
            </y:ShapeNode>
          </data>
        </node>`;
        
    var edgeTmpl = `<edge id="{0}" source="{2}" target="{3}">
          <data key="d9"/>
          <data key="d10">
            <y:ArcEdge>
              <y:Path sx="0.0" sy="0.0" tx="0.0" ty="0.0">
                <y:Point x="346.6875" y="333.375"/>
              </y:Path>
              <y:LineStyle color="#000000" type="line" width="1.0"/>
              <y:Arrows source="none" target="standard"/>
              <y:EdgeLabel alignment="center" configuration="AutoFlippingLabel" distance="2.0" fontFamily="Dialog" fontSize="12" fontStyle="plain" hasBackgroundColor="false" hasLineColor="false" height="18.701171875" modelName="custom" preferredPlacement="anywhere" ratio="0.5" textColor="#000000" visible="true" width="41.30078125" x="-234.82116743359467" y="-7.955110597360772">{1}<y:LabelModel>
                  <y:SmartEdgeLabelModel autoRotationEnabled="false" defaultAngle="0.0" defaultDistance="10.0"/>
                </y:LabelModel>
                <y:ModelParameter>
                  <y:SmartEdgeLabelModelParameter angle="0.0" distance="30.0" distanceToCenter="true" position="center" ratio="0.189477660359121" segment="-1"/>
                </y:ModelParameter>
                <y:PreferredPlacementDescriptor angle="0.0" angleOffsetOnRightSide="0" angleReference="absolute" angleRotationOnRightSide="co" distance="-1.0" frozen="true" placement="anywhere" side="anywhere" sideReference="relative_to_edge_flow"/>
              </y:EdgeLabel>
              <y:Arc height="106.20632934570312" ratio="1.0" type="fixedRatio"/>
            </y:ArcEdge>
          </data>
        </edge>`;

    var colorPalette = [
    {color: {border: "#2B7CE9", background: "#97C2FC", highlight: {border: "#2B7CE9", background: "#D2E5FF"},
              hover: {border: "#2B7CE9", background: "#D2E5FF"}}}, // 0: blue
    {color: {border: "#FFA500", background: "#FFFF00", highlight: {border: "#FFA500", background: "#FFFFA3"},
              hover: {border: "#FFA500", background: "#FFFFA3"}}}, // 1: yellow
      {
          color: {
              border: '#FA0A10', background: '#FB7E81', highlight: { border: '#FA0A10', background: '#FFAFB1' }, hover: { border: '#FA0A10', background: '#FFAFB1' }
          }
      }, // 2: red
      {
          color: {
              border: '#41A906', background: '#7BE141', highlight: { border: '#41A906', background: '#A1EC76' }, hover: { border: '#41A906', background: '#A1EC76' }
          }
      }, // 3: green
      {
          color: {
              border: '#E129F0', background: '#EB7DF4', highlight: { border: '#E129F0', background: '#F0B3F5' }, hover: { border: '#E129F0', background: '#F0B3F5' }
          }
      }, // 4: magenta
      {
          color: {
              border: '#7C29F0', background: '#AD85E4', highlight: { border: '#7C29F0', background: '#D3BDF0' }, hover: { border: '#7C29F0', background: '#D3BDF0' }
          }
      }, // 5: purple
      {
          color: {
              border: '#C37F00', background: '#FFA807', highlight: { border: '#C37F00', background: '#FFCA66' }, hover: { border: '#C37F00', background: '#FFCA66' }
          }
      }, // 6: orange
      {
          color: {
              border: '#4220FB', background: '#6E6EFD', highlight: { border: '#4220FB', background: '#9B9BFD' }, hover: { border: '#4220FB', background: '#9B9BFD' }
          }
      }, // 7: darkblue
      {
          color: {
              border: '#FD5A77', background: '#FFC0CB', highlight: { border: '#FD5A77', background: '#FFD1D9' }, hover: { border: '#FD5A77', background: '#FFD1D9' }
          }
      }, // 8: pink
      {
          color: {
              border: '#4AD63A', background: '#C2FABC', highlight: { border: '#4AD63A', background: '#E6FFE3' }, hover: { border: '#4AD63A', background: '#E6FFE3' }
          }
      }, // 9: mint

      {
          color: {
              border: '#990000', background: '#EE0000', highlight: { border: '#BB0000', background: '#FF3333' }, hover: { border: '#BB0000', background: '#FF3333' }
          }
      }, // 10:bright red

      {
          color: {
              border: '#FF6000', background: '#FF6000', highlight: { border: '#FF6000', background: '#FF6000' }, hover: { border: '#FF6000', background: '#FF6000' }
          }
      }, // 12: real orange
      {
          color: {
              border: '#97C2FC', background: '#2B7CE9', highlight: { border: '#D2E5FF', background: '#2B7CE9' }, hover: { border: '#D2E5FF', background: '#2B7CE9' }
          }
      }, // 13: blue
      {
          color: {
              border: '#399605', background: '#255C03', highlight: { border: '#399605', background: '#255C03' }, hover: { border: '#399605', background: '#255C03' }
          }
      }, // 14: green
      {
          color: {
              border: '#B70054', background: '#FF007E', highlight: { border: '#B70054', background: '#FF007E' }, hover: { border: '#B70054', background: '#FF007E' }
          }
      }, // 15: magenta
      {
          color: {
              border: '#AD85E4', background: '#7C29F0', highlight: { border: '#D3BDF0', background: '#7C29F0' }, hover: { border: '#D3BDF0', background: '#7C29F0' }
          }
      }, // 16: purple
      {
          color: {
              border: '#4557FA', background: '#000EA1', highlight: { border: '#6E6EFD', background: '#000EA1' }, hover: { border: '#6E6EFD', background: '#000EA1' }
          }
      }, // 17: darkblue
      {
          color: {
              border: '#FFC0CB', background: '#FD5A77', highlight: { border: '#FFD1D9', background: '#FD5A77' }, hover: { border: '#FFD1D9', background: '#FD5A77' }
          }
      }, // 18: pink
      {
          color: {
              border: '#C2FABC', background: '#74D66A', highlight: { border: '#E6FFE3', background: '#74D66A' }, hover: { border: '#E6FFE3', background: '#74D66A' }
          }
      }, // 19: mint

      {
          color: {
              border: '#EE0000', background: '#990000', highlight: { border: '#FF3333', background: '#BB0000' }, hover: { border: '#FF3333', background: '#BB0000' }
          }
      } // 20:bright red
    ];
    
})(this.Gears = {});
