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

/** opts
 *      tooltip - add tooltip to button, used for iconic buttons
 *      id - set button id
 *      mainPage - enable view as first page
 *      toggle - toggle content, associated with button
 */
Utils.addView = function (containers, name, view, opts) {
    "use strict";
    var opts = opts || {};
    view.init();
    var buttonClass = "navigation-button";
    containers.root.views[name] = view;
    var button = makeEl("button");
    if(opts.tooltip){
        var delegate = function(){
            $(button).attr('data-original-title', L10n.getValue("header-" + name));
        };
        L10n.onL10nChange(delegate);
        $(button).tooltip({
            title : L10n.getValue("header-" + name),
            placement : "bottom"
        });
    } else {
        addEl(button, makeText(L10n.getValue("header-" + name)));
        setAttr(button, "l10n-id", "header-" + name);
    }
    addClass(button, buttonClass);
    addClass(button, "-test-" + name);
    addClass(button, "-toggle-class-" + name);
    if(opts.id){
        button.id = opts.id;
    }
    containers.navigation.appendChild(button);
    

    var elems, i;
    var onClickDelegate = function (view) {
        return function (evt) {
            //Tests.run();
            elems = containers.navigation.getElementsByClassName(buttonClass);
            if(opts.toggle){
                var els = getEls("-toggle-class-" + name);
                for (var i = 0; i < els.length; i++) {
                    if(evt.target.isEqualNode(els[i])){
                        continue;
                    }
                    if(hasClass(els[i], "active")){
                        els[i].click();
                    }
                }
            }
            
            var isActive = hasClass(evt.target, "active");
            for (i = 0; i < elems.length; i++) {
                removeClass(elems[i], "active");
            }
            if(!opts.toggle || (opts.toggle && !isActive)){
                addClass(evt.target, "active");
                
                passEls(containers.content, getEl('warehouse'));
                containers.content.appendChild(view.content);
                removeClass(containers.content, "hidden");
                containers.root.currentView = view;
                view.refresh();
            } else {
                removeClass(evt.target, "active");
                passEls(containers.content, getEl('warehouse'));
                containers.root.currentView = null;
                addClass(containers.content, "hidden");
            }
        };
    };

    button.addEventListener("click", onClickDelegate(view));
    if (opts.mainPage) {
        addClass(button, "active");
        containers.content.appendChild(view.content);
        containers.root.currentView = view;
    }
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

Utils.processError = function(callback){
    return function(err){
        if(err) {
            Utils.handleError(err);
            return;
        }
        
        if(callback){
            var arr = [];
            for (var i = 1; i < arguments.length; i++) {
                arr.push(arguments[i]);
            }
            callback.apply(null, arr);
        }
    }
};

Utils.handleError = function(err){
    var checkErrorType = R.curry(function(err, name){
        return err instanceof Errors[name] || (err.name && err.name === name)
    });
    if (R.keys(Errors).some(checkErrorType(err))) {
        Utils.alert(strFormat(getL10n(err.messageId), err.parameters));
    } else if( typeof err === 'object'){
        Utils.alert(err.message);
    } else {
        Utils.alert(err);
    }
};

Utils.enable = function(root, className, condition){
    "use strict";
    var arr = root.getElementsByClassName(className);
    var i, elem, key;
    for (i = 0; i < arr.length; i++) {
        elem = arr[i];
        key = elem.tagName.toLowerCase() === "textarea" ? "readonly" : "disabled";
        if(condition){
            elem.removeAttribute(key);
        } else {
            elem.setAttribute(key,key);
        }
    }
};

Utils.charOrdAObject = CommonUtils.charOrdAFactory(function(a){
    return a.displayName.toLowerCase();
});

Utils.rebuildSelector = function(selector, names){
    "use strict";
    clearEl(selector);
    names.forEach(function (nameInfo) {
        var option = makeEl("option");
        option.appendChild(makeText(nameInfo.displayName));
        option.value = nameInfo.value;
        selector.appendChild(option);
    });
};

Utils.rebuildSelectorArr = function(selector, names){
    "use strict";
    clearEl(selector);
    names.forEach(function (name) {
        var option = makeEl("option");
        option.appendChild(makeText(name));
        selector.appendChild(option);
    });
};

String.prototype.endsWith = function (suffix) {
    "use strict";
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var strFormat = R.curry(CommonUtils.strFormat);

function getL10n(key){
    "use strict";
    return L10n.getValue(key);
};

function constL10n(key){
    "use strict";
    return L10n.getValue('constant-' + key);
}

function isEmpty (obj) {
    "use strict";
    return (Object.getOwnPropertyNames(obj).length === 0);
};

var addClass = R.curry(function(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    if (re.test(o.className)) return;
    o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
    return o;
});

var addClasses = R.curry(function(o, c){
    R.ap([addClass(o)], c);
    return o;
});

var rAddClass = R.curry(function(c, o){
  var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
  if (re.test(o.className)) return;
  o.className = (o.className + " " + c).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
  return o;
});

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
 
var removeClass = R.curry(function(o, c){
    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", "g")
    o.className = o.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "")
});

function setClassByCondition(o,c,condition){
    if(condition){
        addClass(o,c);
    } else {
        removeClass(o,c);
    }
    return o;
};

function getEl(id){
  return document.getElementById(id);
};

function queryEl(sel){
    return document.querySelector(sel);
};

function queryElEls(el, sel){
    return el.querySelectorAll(sel);
};

function getEls(clazz){
  return document.getElementsByClassName(clazz);
};

function makeEl(elTag){
  return document.createElement(elTag);
};

function makeText(text){
  return document.createTextNode(text);
};

//function addEl(parent, child){
//  parent.appendChild(child);
//  return parent;
//};
var addEl = R.curry(function(parent, child){
    parent.appendChild(child);
    return parent;
});
var addEls = R.curry(function(parent, children){
    R.ap([addEl(parent)], children);
    return parent;
});

var makeOpt = function(label){
    var option = makeEl("option");
    addEl(option, (makeText(label)));
    return option;
};

var rAddEl = R.curry(function(child, parent){
  parent.appendChild(child);
  return parent;
});

var setAttr = R.curry(function(el, name, value){
  el.setAttribute(name, value);
  return el;
});

var setStyle = R.curry(function(el, name, value){
    el.style[name] = value;
    return el;
});

function delAttr(el, name){
    el.removeAttribute(name);
    return el;
};

function getAttr(el, name){
    return el.getAttribute(name);
};

function setProp(el, key, value){
  el[key] = value;
  return el;
};

function setProps(el, map){
  for(var key in map){
    setProp(el, key, map[key]);
  }
  return el;
}

function clearEl(el){
  Utils.removeChildren(el);
  return el;
};

function passEls(src, dst){
    for (var i = 0; i < src.children.length; i++) {
        addEl(dst, src.children[i]);
    }
};

function listen(el, event, listener){
  el.addEventListener(event, listener);
};

function arr2Chunks(array, chunkSize) {
  var i, j, chunks = [];
  for (i = 0, j = array.length; i < j; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

function fillSelector(sel, data){
    data.forEach(function (item) {
        var opt = makeEl("option");
        addEl(opt, makeText(item.name));
        if(item.value){opt.value = item.value;}
        if(item.selected){opt.selected = true;}
        addEl(sel, opt);
    });
}

function nl2array(nodeList){
    return Array.prototype.slice.call(nodeList);
};

var remapProps = R.curry(function(outKeys, pickKeys, obj){
    return R.compose(R.zipObj(outKeys), R.values, R.pick(pickKeys))(obj);
});

var remapProps4Select2 = remapProps(['id','text'], ['value', 'displayName']);
var remapProps4Select = remapProps(['value','name'], ['value', 'displayName']);

var getSelect2DataCommon = R.curry(function(preparator, obj){ 
    return R.compose(R.zipObj(['data']), R.append(R.__, []), R.map(preparator))(obj);
});

var getSelect2Data = getSelect2DataCommon(remapProps4Select2);

var makeSelect2Opt = R.compose(R.zipObj(['id', 'text']), R.repeat(R.__, 2));
var arr2Select2 = R.compose(R.assoc('data', R.__, {}), R.map(makeSelect2Opt));
var arr2Select = R.map(R.compose(R.zipObj(['value','name']), R.repeat(R.__, 2)));

var getSelectedRadio = function(query){
    "use strict";
    var els = document.querySelectorAll(query);
    for (var i = 0; i < els.length; i++) {
        if(els[i].checked === true){
            return els[i];
        }
    }
    return null;
};

var debugInterceptor = function(callback){
    return function(){
        console.log(JSON.stringify(arguments[0]));
        callback.apply(null, arguments);
    }
};

// from date format utils
//For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

