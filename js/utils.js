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

"use strict";

var Utils = {};

Utils.addView = function (rootObject, name, view, displayName, navigationId, contentAreaId, mainPage) {
    "use strict";
    view.init();
    var buttonClass = "navigation-button";
    rootObject.views[name] = view;
    var navigation = document.getElementById(navigationId);
    var button = document.createElement("div");
    addClass(button, buttonClass);
    addClass(button, "-test-" + name);
    button.appendChild(document.createTextNode(displayName));
    navigation.appendChild(button);
    

    var contentArea, elems, i;
    var onClickDelegate = function (view) {
        return function (evt) {
            elems = navigation.getElementsByClassName(buttonClass);
            for (i = 0; i < elems.length; i++) {
                removeClass(elems[i], "active");
            }
            addClass(evt.target, "active");
            
            contentArea = document.getElementById(contentAreaId);
            Utils.removeChildren(contentArea);
            contentArea.appendChild(view.content);
            rootObject.currentView = view;
            view.refresh();
        };
    };

    button.addEventListener("click", onClickDelegate(view));
    if (mainPage) {
        addClass(button, "active");
        var contentArea = document.getElementById(contentAreaId);
        contentArea.appendChild(view.content);
        rootObject.currentView = view;
        // view.refresh();
    }
};

Utils.globStringToRegex = function (str) {
    "use strict";
    return new RegExp(Utils.preg_quote(str).replace(/\\\*/g, '.*').replace(
            /\\\?/g, '.'), 'g');
};
Utils.preg_quote = function (str, delimiter) {
    "use strict";
    // http://kevin.vanzonneveld.net
    // + original by: booeyOH
    // + improved by: Ates Goral (http://magnetiq.com)
    // + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // + bugfixed by: Onno Marsman
    // + improved by: Brett Zamir (http://brett-zamir.me)
    // * example 1: preg_quote("$40");
    // * returns 1: '\$40'
    // * example 2: preg_quote("*RRRING* Hello?");
    // * returns 2: '\*RRRING\* Hello\?'
    // * example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    // * returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\'
            + (delimiter || '') + '-]', 'g'), '\\$&');
};

Utils.alert = function (message) {
    "use strict";
    window.alert(message);
};

Utils.confirm = function (message) {
    "use strict";
    return window.confirm(message);
};

Utils.removeChildren = function (myNode) {
    "use strict";
    if (!myNode) {
        return;
    }
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
};



String.prototype.endsWith = function (suffix) {
    "use strict";
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function isEmpty (obj) {
    "use strict";
    return (Object.getOwnPropertyNames(obj).length === 0);
};

function addClass(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    if (re.test(o.className)) return;
    o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "")
};

function toggleClass(o, c){
    if(hasClass(o, c)){
        removeClass(o, c);
    } else {
        addClass(o, c);
    }
};

function hasClass(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    return (re.test(o.className));
};
 
function removeClass(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "")
};

// from date format utils
//For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};