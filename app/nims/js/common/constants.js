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

/*
 */

'use strict';

// ((exports) => {
    exports.profileFieldTypes = {
        text: {
            name: 'text',
            value: ''
        },
        string: {
            name: 'string',
            value: ''
        },
        enum: {
            name: 'enum',
            value: '_'
        },
        number: {
            name: 'number',
            value: 0
        },
        checkbox: {
            name: 'checkbox',
            value: false
        },
        multiEnum: {
            name: 'multiEnum',
            value: ''
        }
    };

    exports.relationFields = ['origin', 'starterTextReady', 'enderTextReady', 'essence', 'starter', 'ender'];

    exports.relationEssences = ['starterToEnder', 'allies', 'enderToStarter'];

    exports.playerAccessTypes = ['write', 'readonly', 'hidden'];

    exports.originProperties = ['name', 'text', 'time'];

    exports.adaptationProperties = ['text', 'time', 'ready'];

    exports.playersOptionTypes = ['allowPlayerCreation', 'allowCharacterCreation'];

    exports.objectSubsets = [
        'allObjects',
        'selectedCharacters',
        'selectedStories',
    ];

    exports.networks = [
        'socialRelations',
        'characterPresenceInStory',
        'characterActivityInStory',
        'characterRelations',
    ];

    exports.ownedEntityTypes = ['character', 'player', 'story', 'group'];
    exports.ownedEntityTypes2 = ['characters', 'players', 'stories', 'groups'];

    exports.metaInfoStrings = ['name', 'description'];

    exports.metaInfoDates = ['date', 'preGameDate'];

    exports.profileTypes = ['character', 'player'];

    exports.groupProfileStructure = [{
        name: 'filterModel',
        type: 'container',
    }, {
        name: 'characterList',
        type: 'container',
    }, {
        name: 'masterDescription',
        type: 'text',
    }, {
        name: 'doExport',
        type: 'checkbox',
    }, {
        name: 'characterDescription',
        type: 'text',
    }];

    exports.groupEditableItems = ['masterDescription', 'characterDescription'];

    exports.noGroup = 'noGroup';

    exports.characterActivityTypes = [
        'active',
        'follower',
        'defensive',
        'passive',
    ];

    exports.characterRelationTypes = [
        'allies',
        'directional',
        'neutral',
    ];

    exports.numberFilter = [
        'ignore',
        'greater',
        'equal',
        'lesser',
    ];

    exports.multiEnumFilter = [
        'ignore',
        'every',
        'equal',
        'some',
    ];

    exports.finishedText = 'finishedText';
    exports.finishedSuffix = 'finishedSuffix';
    exports.emptySuffix = 'emptySuffix';

    exports.true = 'yes';
    exports.false = 'no';

    exports.yesNo = [exports.true, exports.false];

    exports.briefingNumber = [1, 5, 10, 20, 50];

    exports.logFilterTypes = [
        'date',
        'user',
        'action',
        'params',
        'status',
    ];

    exports.adaptationRightsModes = ['ByStory', 'ByCharacter'];

    exports.colorPalette = [
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

    exports.CHAR_NAME = 'char-name';
    exports.CHAR_OWNER = 'char-owner';
    exports.CHAR_PREFIX = 'profile-';
    exports.PLAYER_NAME = 'player-name';
    exports.PLAYER_OWNER = 'player-owner';
    exports.PLAYER_PREFIX = 'player-profile-';
    exports.SUMMARY_PREFIX = 'summary-';

    exports.summaryStats = [
        ['active', 'constant-active'],
        ['follower', 'constant-follower'],
        ['defensive', 'constant-defensive'],
        ['passive', 'constant-passive'],
        ['completeness', 'profile-filter-completeness'],
        ['totalStories', 'profile-filter-totalStories']
    ];

    exports.socialNetworkOpts = {
        nodes: {
            shape: 'dot',
            scaling: {
                min: 10,
                max: 30,
                label: {
                    min: 8,
                    // min : 4,
                    max: 30,
                    // max : 50,
                    // drawThreshold : 12,
                    drawThreshold: 5,
                    maxVisible: 30
                // maxVisible : 20
                }
            },
            font: {
                // size : 12,
                size: 20,
                face: 'Tahoma'
            }
        },
        edges: {
            width: 0.15,
            color: {
                inherit: 'from'
            },
            smooth: {
                //                    type : 'continuous'
                type: 'dynamic'
            }
        },
        physics: {
            barnesHut: {
                //                    gravitationalConstant : -15000
                gravitationalConstant: -30000,
                //                 gravitationalConstant : -60000
                //                    springLength: 20,
                springConstant: 0.1
            },
            stabilization: {
                //                    iterations : 2500
                iterations: 50
            }
        },
        // physics : false,
        // layout : true,
        layout: {
            randomSeed: 1200
        },
        interaction: {
            tooltipDelay: 200,
        // hideEdgesOnDrag : true
        },
    };

    exports.groupSchemaOpts = {
        nodes: {
            scaling: {
                min: 10,
                max: 30,
                label: {
                    min: 8,
                    max: 30,
                    drawThreshold: 5,
                    maxVisible: 30
                }
            },
            font: {
                size: 20,
                face: 'Tahoma'
            }
        },
        manipulation: false,
        height: '90%',
        layout: {
            hierarchical: {
                enabled: true,
                levelSeparation: 200
            }
        },
        physics: {
            hierarchicalRepulsion: {
                nodeDistance: 140
            }
        }
    };

    exports.snActivityColors = {
        active: 'red',
        follower: 'blue',
        defensive: 'green',
        passive: 'grey'
    };

    exports.snRelationColors = {
        starterToEnder: 'red',
        enderToStarter: 'red',
        allies: 'green',
        neutral: 'grey'
    };

    exports.snFocusOptions = {
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

    exports.snFixedColors = {
        storyColor: {
            color: {
                background: 'rgb(255,255,0)',
                border: 'rgb(255,168,3)'
            }
        },
        noGroup: {
            color: {
                background: 'rgb(151,194,252)',
                border: 'rgb(43,124,233)'
            }
        },
        fromGroup: {
            color: {
                background: '#7BE141',
                border: '#41A906'
            }
        },
        thirdDegreeNode: {
            color: {
                background: 'rgba(200,200,200,0.5)',
                border: 'rgba(200,200,200,0.5)'
            }
        },
        secondDegreeNode: {
            color: {
                background: 'rgba(150,150,150,0.75)',
                border: 'rgba(150,150,150,0.75)'
            }
        },
        firstDegreeNode: {
            color: {
                background: 'rgb(151,194,252)',
                border: 'rgb(43,124,233)'
            }
        }
    };


    exports.visLocales = {
        ru: {
            edit: 'Редактировать',
            del: 'Удалить выбранное',
            back: 'Назад',
            addNode: 'Добавить узел',
            addEdge: 'Добавить ребро',
            editNode: 'Редактировать узел',
            editEdge: 'Редактировать ребро',
            addDescription: 'Кликните в свободное место, чтобы добавить новый узел.',
            edgeDescription: 'Кликните на узел и протяните ребро к другому узлу, чтобы соединить их.',
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

    exports.visLocales.en_EN = exports.visLocales.en;
    exports.visLocales.en_US = exports.visLocales.en;
    exports.visLocales.ru_RU = exports.visLocales.ru;

    exports.serverSpecificFunctions = ['getManagementInfo', 'assignAdmin', 'assignEditor', 'removeEditor',
        'changeAdaptationRightsMode',
        'removeOrganizer', 'removePermission', 'assignPermission', 'getPlayerLoginsArray', 'removePlayerLogin',
        'getWelcomeText', 'setWelcomeText', 'getPlayersOptions', 'setPlayerOption', 'createOrganizer',
        'changeOrganizerPassword', 'createPlayer', 'createPlayerLogin', 'changePlayerPassword',
        'getPlayerProfileInfo', 'createCharacterByPlayer', 'publishPermissionsUpdate'];

    exports.commonIgnoreList = ['_init', 'log'];



    exports.yedGmlBase = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
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

    exports.yedNodeTmpl = `<node id="{0}">
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

    exports.yedEdgeTmpl = `<edge id="{0}" source="{2}" target="{3}">
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

    exports.gearsNodeRequiredFields = ['id', 'x', 'y', 'label', 'name', 'group', 'notes', 'shape'];

    exports.httpTimeout = 60000;
// })(typeof exports === 'undefined' ? this.Constants = {} : exports);
