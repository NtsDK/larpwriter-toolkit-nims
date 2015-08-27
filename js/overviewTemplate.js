/*global
 Utils, DBMS, Database
 */

"use strict";

var Overview = {};

Overview.init = function() {
    "use strict";
    var overviewDiv = document.createElement("div");
    overviewDiv.id = overviewDiv;
    overviewDiv.appendChild(document.createTextNode("Overview"));

    Overview.content = overviewDiv;
    // Overview.content = document.getElementById("overviewDiv");
};

Overview.refresh = function() {
    "use strict";

};