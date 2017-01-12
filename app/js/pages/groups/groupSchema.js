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

var GroupSchema = {};

GroupSchema.init = function () {
    GroupSchema.content = queryEl(".group-schema-tab");
};

GroupSchema.refresh = function () {
    DBMS.getGroupSchemas(function(err, schemas){
        GroupSchema.redrawSchema(schemas.theory);
    });
};

GroupSchema.redrawSchema = function (graph) {
    var container = queryEl('.group-schema-tab .schema-container');
    
    if(GroupSchema.network){
        GroupSchema.network.destroy();
    }
    graph.edges = graph.edges.map(function(edge){
        return R.merge(edge, {
            'physics' : false,
        });
    });
    
    GroupSchema.network = new vis.Network(container, graph, Constants.groupSchemaOpts);
};