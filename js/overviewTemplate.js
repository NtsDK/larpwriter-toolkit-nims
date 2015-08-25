"use strict";

var Overview = {};

Overview.init = function() {
    var overviewDiv = document.createElement("div");
    overviewDiv.id = overviewDiv;
    overviewDiv.appendChild(document.createTextNode("Overview"));

    Overview.content = overviewDiv;
    // Stories.content = document.getElementById("storiesDiv");
};

Overview.refresh = function() {

};