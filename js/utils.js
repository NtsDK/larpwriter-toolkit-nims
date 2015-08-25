"use strict";

var Utils = {};

Utils.addView = function (rootObject, name, view, displayName, navigationId,
        contentAreaId, mainPage) {
    view.init();
    // var viewContent = initializer();
    rootObject.views[name] = view;
    var navigation = document.getElementById(navigationId);
    var button = document.createElement("button");
    button.appendChild(document.createTextNode(displayName));
    navigation.appendChild(button);

    var onClickDelegate = function (view) {
        return function () {
            var contentArea = document.getElementById(contentAreaId);
            removeChildren(contentArea);
            contentArea.appendChild(view.content);
            rootObject.currentView = view;
            view.refresh();
        };
    };

    button.addEventListener("click", onClickDelegate(view));
    if (mainPage) {
        var contentArea = document.getElementById(contentAreaId);
        contentArea.appendChild(view.content);
        rootObject.currentView = view;
        // view.refresh();
    }
};

Utils.globStringToRegex = function (str) {
    return new RegExp(Utils.preg_quote(str).replace(/\\\*/g, '.*').replace(
            /\\\?/g, '.'), 'g');
};
Utils.preg_quote = function (str, delimiter) {
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

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

if (document.getElementsByClassName) {

    var getElementsByClass = function (classList, node) {
        return (node || document).getElementsByClassName(classList);
    };

} else {

    var getElementsByClass = function (classList, node) {
        var node = node || document, list = node.getElementsByTagName('*'), length = list.length, classArray = classList
                .split(/\s+/), classes = classArray.length, result = [], i, j
        for (i = 0; i < length; i++) {
            for (j = 0; j < classes; j++) {
                if (list[i].className.search('\\b' + classArray[j] + '\\b') !== -1) {
                    result.push(list[i]);
                    break;
                }
            }
        }

        return result;
    };
}

function charOrdA (a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a > b)
        return 1;
    if (a < b)
        return -1;
    return 0;
};

function eventsByTime (a, b) {
    a = new Date(a.time);
    b = new Date(b.time);
    if (a > b)
        return 1;
    if (a < b)
        return -1;
    return 0;
};

function removeChildren (myNode) {
    if (!myNode) {
        return;
    }
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
};

function isEmpty (obj) {
    return (Object.getOwnPropertyNames(obj).length === 0);
};

function clone (o) {
    if (!o || 'object' !== typeof o) {
        return o;
    }
    var c = 'function' === typeof o.pop ? [] : {};
    var p, v;
    for (p in o) {
        if (o.hasOwnProperty(p)) {
            v = o[p];
            if (v && 'object' === typeof v) {
                c[p] = clone(v);
            } else {
                c[p] = v;
            }
        }
    }
    return c;
};