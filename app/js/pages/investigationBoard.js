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

/*global
 Utils, DBMS
 */

"use strict";

var InvestigationBoard = {};

InvestigationBoard.init = function () {
    
    
    InvestigationBoard.content = queryEl(".investigation-board-tab");
};

InvestigationBoard.refresh = function () {
    PermissionInformer.getGroupNamesArray(true, Utils.processError(function(groupNames){
        DBMS.getInvestigationBoardData(function(err, ibData){
            var allGroupNames = groupNames.map(R.prop('value'));
            var ibGroupNames = R.keys(ibData.groups);
            var freeGroupNames = R.difference(allGroupNames,ibGroupNames);
            
            clearEl(queryEl(".investigation-board-tab .group-add-select"));
            $(".investigation-board-tab .group-add-select").select2(arr2Select2(freeGroupNames));

            clearEl(queryEl(".investigation-board-tab .group-remove-select"));
            $(".investigation-board-tab .group-remove-select").select2(arr2Select2(ibGroupNames));
        });
    }));
    
    
    DBMS.getGroupSchemas(function(err, schemas){
        InvestigationBoard.redrawSchema(schemas.theory);
    });
};

InvestigationBoard.redrawSchema = function (graph) {
    var container = queryEl('.investigation-board-tab .schema-container');
    
    var options = {
        nodes : {
            scaling : {
                min : 10,
                max : 30,
                label : {
                    min : 8,
                    max : 30,
                    drawThreshold : 5,
                    maxVisible : 30
                }
            },
            font : {
                size : 20,
                face : 'Tahoma'
            }
        },
        manipulation : false,
        height : '90%',
        layout : {
            hierarchical : {
                enabled : true,
                levelSeparation : 200
            }
        },
        physics : {
            hierarchicalRepulsion : {
                nodeDistance : 140
            }
        }
    };
    
    if(InvestigationBoard.network){
        InvestigationBoard.network.destroy();
    }
    graph.edges = graph.edges.map(function(edge){
        return R.merge(edge, {
            'physics' : false,
        });
    });
    
    InvestigationBoard.network = new vis.Network(container, graph, options);
};