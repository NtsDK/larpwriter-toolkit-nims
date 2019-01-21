// const R = require("ramda");
const CommonUtils = require("./common/commonUtils.js");
const Errors = require("./common/errors.js");

var vex = require('vex-js');
// vex.registerPlugin(require('vex-dialog'));
// vex.defaultOptions.className = 'vex-theme-os';
/*Copyright 2015-2017 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

'use strict';

// TODO need to lint utils with NIMS fixes
/* eslint-disable */

const strFormat = R.curry(CommonUtils.strFormat);

function isEmpty(obj) {
    return (Object.getOwnPropertyNames(obj).length === 0);
}

const addClass = R.curry((o, c) => {
    const re = new RegExp(`(^|\\s)${c}(\\s|$)`, 'g');
    if (re.test(o.className)) return o;
    o.className = (`${o.className} ${c}`).replace(/\s+/g, ' ').replace(/(^ | $)/g, '');
    return o;
});

const addClasses = R.curry((o, c) => {
    R.ap([U.addClass(o)], c);
    return o;
});

const hasClass = R.curry((o, c) => {
    const re = new RegExp(`(^|\\s)${c}(\\s|$)`, 'g');
    return (re.test(o.className));
});

const removeClass = R.curry((o, c) => {
    const re = new RegExp(`(^|\\s)${c}(\\s|$)`, 'g');
    o.className = o.className.replace(re, '$1').replace(/\s+/g, ' ').replace(/(^ | $)/g, '');
    return o;
});

const removeClasses = R.curry((o, c) => {
    R.ap([removeClass(o)], c);
    return o;
});

const toggleClass = R.curry((o, c) => {
    if (U.hasClass(o, c)) {
        U.removeClass(o, c);
    } else {
        U.addClass(o, c);
    }
});

const setClassByCondition = R.curry((o, c, condition) => {
    if (condition) {
        U.addClass(o, c);
    } else {
        U.removeClass(o, c);
    }
    return o;
});

const setClassIf = setClassByCondition;

const showEl = (el, condition) => setClassByCondition(el, 'hidden', !condition);
const hideEl = (el, condition) => setClassByCondition(el, 'hidden', condition);

function queryEl(sel) {
    return document.querySelector(sel);
}

const qe = queryEl;

// query template element
function qte(sel){
    return document.querySelector(sel).content.cloneNode(true);
}

// query materialize template element
function qmte(sel){
    return U.addEl(U.makeEl('div'), U.qte(sel)).children[0];
    // return U.addEl(U.makeEl('div'), U.qte(sel)).firstChild;
}

function queryEls(sel) {
    return U.nl2array(document.querySelectorAll(sel));
}

const qes = queryEls;

function queryElEl(el, sel) {
    return el.querySelector(sel);
}

const qee = R.curry(queryElEl);

function queryElEls(el, sel) {
    return nl2array(el.querySelectorAll(sel));
}

const qees = R.curry(queryElEls);

// function getEls(clazz) {
//     return document.getElementsByClassName(clazz);
// }

function makeEl(elTag) {
    return document.createElement(elTag);
}

const wrapEl = R.curry((elTag, el) => {
    return U.addEl(U.makeEl(elTag), el);
})

// const wrapEls = R.curry((elTag, els) => {
//     return U.addEls(U.makeEl(elTag), els);
// })

function makeText(text) {
    return document.createTextNode(text);
}

// exports.makeText = makeText;

const addEl = R.curry((parent, child) => {
    parent.appendChild(child);
    return parent;
});
const addEls = R.curry((parent, children) => {
    R.ap([U.addEl(parent)], children);
    return parent;
});

const makeOpt = function (label) {
    const option = U.makeEl('option');
    U.addEl(option, (U.makeText(label)));
    return option;
};

const setAttr = R.curry((el, name, value) => {
    el.setAttribute(name, value);
    return el;
});

const setStyle = R.curry((el, name, value) => {
    el.style.setProperty(name, value);
    return el;
});

// const setImportantStyle = R.curry((el, name, value) => {
//     el.style.setProperty(name, value, 'important');
//     return el;
// });

// function delAttr(el, name) {
//     el.removeAttribute(name);
//     return el;
// }

const getAttr = R.curry((el, name) => {
    return el.getAttribute(name);
});

const setProp = R.curry((el, key, value) => {
    el[key] = value;
    return el;
});

const setProps = R.curry((el, map) => {
    for (const key in map) {
        setProp(el, key, map[key]);
    }
    return el;
});

function clearEl(el) {
    Utils.removeChildren(el);
    return el;
}

function clearEls(els){
    return els.map(clearEl)
}

function passEls(src, dst) {
    for (let i = 0; i < src.children.length; i++) {
        U.addEl(dst, src.children[i]);
    }
}

const listen = R.curry((el, event, listener) => {
    el.addEventListener(event, listener);
    return el;
});

const listenOnEnter = R.curry((el, callback) => {
    U.listen(el, 'keydown', (e) => {
        if (e.keyCode === 13) {
            if(e.iAmNotAlone) {
                throw new Error('Oh dear!');
            }
            e.iAmNotAlone = true;
            
            callback();
        }
    });
});

const fillSelector = R.curry((sel, data) => U.addEls(sel, data.map((item) => {
    const opt = U.makeEl('option');
    U.addEl(opt, U.makeText(item.name));
    if (item.value !== undefined) { opt.value = item.value; }
    if (item.selected !== undefined) { opt.selected = true; }
    if (item.className !== undefined) { U.addClass(opt, item.className); }
    return opt;
})));

function nl2array(nodeList) {
    return Array.prototype.slice.call(nodeList);
}

// exports.nl2array = nl2array;

const makeSelect2Opt = R.compose(R.zipObj(['id', 'text']), R.repeat(R.__, 2));
const arr2Select2 = R.compose(R.assoc('data', R.__, {}), R.map(makeSelect2Opt));
const arr2Select = R.map(R.compose(R.zipObj(['value', 'name']), R.repeat(R.__, 2)));


const getSelectedRadio = function (el, query) {
    return queryElEls(el, query).find(R.prop('checked'));
};

// const debugInterceptor = function (callback) {
//     return function () {
//         console.log(JSON.stringify(arguments[0]));
//         callback(...arguments);
//     };
// };







const U = {
    setAttr, nl2array, qees, addEl, clearEl, makeText, getAttr,
    queryEls, queryEl, addClass, listen,

    qe,qee, wrapEl, qte,listenOnEnter, makeEl, fillSelector, 
    addEls, clearEls, qmte, showEl, passEls, setProp, qes,queryElEl,

    setClassByCondition,setClassIf,hideEl,
    queryElEls, arr2Select2, makeOpt,setStyle,setProps,

    arr2Select,getSelectedRadio,removeClasses,

    // getL10n, 
    // constL10n, 
    
    strFormat, isEmpty, addClasses, hasClass, removeClass, toggleClass
};

exports.U = U;







const Utils = {};
exports.Utils = Utils;

Utils.setFirstTab = function(containers, opts){
    U.addClass(opts.button, 'active');
    containers.content.appendChild(opts.view.content);
    containers.root.currentView = opts.view;
}

Utils.alert = function (message) {
    vex.dialog.alert(message);
};

const setError = (el, err) => U.addEl(U.clearEl(U.qee(el, '.error-msg')), U.makeText(Utils.handleErrorMsg(err)));
const clearError = (el) => U.clearEl(U.qee(el, '.error-msg'));

Utils.setError = setError;
Utils.clearError = clearError;

Utils.confirm = function (message, onOk, onCancel) {
    vex.dialog.confirm({
        message,
        callback: (val) => {
            if (val) {
                if (onOk) onOk();
            } else if (onCancel) onCancel();
        }
    });
};

Utils.removeChildren = function (myNode) {
    if (!myNode) {
        return;
    }
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
};

Utils.processError = function (callback) {
    return function (err) {
        if (err) {
            Utils.handleError(err);
            return;
        }

        if (callback) {
            const arr = [];
            for (let i = 1; i < arguments.length; i++) {
                arr.push(arguments[i]);
            }
            callback(...arr);
        }
    };
};

Utils.handleErrorMsg = function (err) {
    const checkErrorType = R.curry((err2, name) => err2 instanceof Errors[name] || (err2.name && err2.name === name));
    if (R.keys(Errors).some(checkErrorType(err))) {
        const params = err.parameters.map(val => {
            return L10n.hasValue(val) ? L10n.getValue(val) : val;
        });
        return U.strFormat(L10n.getValue(err.messageId), params);
    } else if (typeof err === 'object') {
        return err.message;
    }
    return err;
};

Utils.handleError = err => {
    console.error(err);
    Utils.alert(Utils.handleErrorMsg(err));
}

Utils.enableEl = R.curry((el, condition) => {
    const key = el.tagName.toLowerCase() === 'textarea' ? 'readonly' : 'disabled';
    if (condition) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, key);
    }
});

Utils.enable = function (root, className, condition) {
    U.nl2array(root.getElementsByClassName(className)).map(Utils.enableEl(R.__, condition));
};

Utils.charOrdAObject = CommonUtils.charOrdAFactory(a => a.displayName.toLowerCase());

Utils.rebuildSelector = function (selector, names) {
    U.clearEl(selector);
    names.forEach((nameInfo) => {
        const option = U.makeEl('option');
        option.appendChild(U.makeText(nameInfo.displayName));
        option.value = nameInfo.value;
        selector.appendChild(option);
    });
};

Utils.rebuildSelectorArr = function (selector, names) {
    U.clearEl(selector);
    names.forEach((name) => {
        const option = U.makeEl('option');
        option.appendChild(U.makeText(name));
        selector.appendChild(option);
    });
};

// from https://learn.javascript.ru/js-animation
Utils.animate = (options) => {
    const start = performance.now();

    requestAnimationFrame(function animate(time) {
        // timeFraction from 0 to 1
        let timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;
        
        // current animation state
        const progress = options.timing(timeFraction)
        
        options.draw(progress);
        
        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        }
    });
}

const Timing = {};
exports.Timing = Timing;

// call examples
//timing: Timing.linear,
//timing: Timing.quad,
//timing: Timing.circ,
//timing: Timing.bounce,
//timing: Timing.makeEaseOut(Timing.bounce),
//timing: Timing.makeEaseInOut(Timing.bounce),
//timing: Timing.back(3.5),
//timing: Timing.elastic(1.5),
//timing: Timing.makeEaseInOut(Timing.poly(4)),

Timing.linear = (timeFraction) => {
    return timeFraction;
}

Timing.quad = ( progress) => {
    return Math.pow(progress, 2)
}

Timing.poly = R.curry((x, progress) => {
    return Math.pow(progress, x)
})

Timing.circ = (timeFraction) => {
    return 1 - Math.sin(Math.acos(timeFraction))
}

Timing.back = R.curry((x, timeFraction) => {
    return Math.pow(timeFraction, 2) * ((x + 1) * timeFraction - x)
})

Timing.bounce = (timeFraction) => {
    for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
        if (timeFraction >= (7 - 4 * a) / 11) {
            return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
        }
    }
}

Timing.elastic = (x, timeFraction) => {
    return Math.pow(2, 10 * (timeFraction - 1)) * Math.cos(20 * Math.PI * x / 3 * timeFraction)
}

Timing.makeEaseOut = (timing) => {
    return function(timeFraction) {
        return 1 - timing(1 - timeFraction);
    }
}

Timing.makeEaseInOut = (timing) => {
    return function(timeFraction) {
        if (timeFraction < .5) {
            return timing(2 * timeFraction) / 2;
        } else {
            return (2 - timing(2 * (1 - timeFraction))) / 2;
        }
    }
}

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// // from date format utils
// //For convenience...
// Date.prototype.format = function (mask, utc) {
//     return dateFormat(this, mask, utc);
// };
