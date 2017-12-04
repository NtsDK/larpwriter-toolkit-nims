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

'use strict';

((exports) => {
    const state = {};

    exports.init = function () {
        exports.content = queryEl('.group-schema-tab');
    };

    exports.refresh = function () {
        DBMS.getGroupSchemas((err, schemas) => {
            redrawSchema(schemas.theory);
        });
    };

    var redrawSchema = function (graph) {
        const container = queryEl('.group-schema-tab .schema-container');

        if (state.network) {
            state.network.destroy();
        }
        graph.edges = graph.edges.map(edge => R.merge(edge, {
            physics: false,
        }));

        state.network = new vis.Network(container, graph, Constants.groupSchemaOpts);
    };
})(this.GroupSchema = {});
