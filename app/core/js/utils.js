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

function getL10n(key) {
    return L10n.getValue(key);
}

function constL10n(key) {
    return L10n.getValue(`constant-${key}`);
}

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
    R.ap([addClass(o)], c);
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
    if (hasClass(o, c)) {
        removeClass(o, c);
    } else {
        addClass(o, c);
    }
});

const setClassByCondition = R.curry((o, c, condition) => {
    if (condition) {
        addClass(o, c);
    } else {
        removeClass(o, c);
    }
    return o;
});

const setClassIf = setClassByCondition;

const showEl = (el, condition) => setClassByCondition(el, 'hidden', !condition);
const hideEl = (el, condition) => setClassByCondition(el, 'hidden', condition);

function getEl(id) {
    return document.getElementById(id);
}

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
    return addEl(makeEl('div'), qte(sel)).firstChild;
}

function queryEls(sel) {
    return nl2array(document.querySelectorAll(sel));
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

function getEls(clazz) {
    return document.getElementsByClassName(clazz);
}

function makeEl(elTag) {
    return document.createElement(elTag);
}

const wrapEl = R.curry((elTag, el) => {
    return addEl(makeEl(elTag), el);
})

const wrapEls = R.curry((elTag, els) => {
    return addEls(makeEl(elTag), els);
})

function makeText(text) {
    return document.createTextNode(text);
}

const addEl = R.curry((parent, child) => {
    parent.appendChild(child);
    return parent;
});
const addEls = R.curry((parent, children) => {
    R.ap([addEl(parent)], children);
    return parent;
});

const makeOpt = function (label) {
    const option = makeEl('option');
    addEl(option, (makeText(label)));
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

const setImportantStyle = R.curry((el, name, value) => {
    el.style.setProperty(name, value, 'important');
    return el;
});

function delAttr(el, name) {
    el.removeAttribute(name);
    return el;
}

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
        addEl(dst, src.children[i]);
    }
}

const listen = R.curry((el, event, listener) => {
    el.addEventListener(event, listener);
    return el;
});

const listenOnEnter = R.curry((el, callback) => {
    listen(el, 'keydown', (e) => {
        if (e.keyCode === 13) {
            if(e.iAmNotAlone) {
                throw new Error('Oh dear!');
            }
            e.iAmNotAlone = true;
            
            callback();
        }
    });
});

const fillSelector = R.curry((sel, data) => addEls(sel, data.map((item) => {
    const opt = makeEl('option');
    addEl(opt, makeText(item.name));
    if (item.value !== undefined) { opt.value = item.value; }
    if (item.selected !== undefined) { opt.selected = true; }
    if (item.className !== undefined) { addClass(opt, item.className); }
    return opt;
})));

function nl2array(nodeList) {
    return Array.prototype.slice.call(nodeList);
}

const remapProps = R.curry((outKeys, pickKeys, obj) => R.compose(R.zipObj(outKeys), R.values, R.pick(pickKeys))(obj));

const remapProps4Select2 = remapProps(['id', 'text'], ['value', 'displayName']);
const remapProps4Select = remapProps(['value', 'name'], ['value', 'displayName']);

const getSelect2DataCommon = R.curry((preparator, obj) => R.compose(R.zipObj(['data']), R.append(R.__, []), R.map(preparator))(obj));

const getSelect2Data = getSelect2DataCommon(remapProps4Select2);

const makeSelect2Opt = R.compose(R.zipObj(['id', 'text']), R.repeat(R.__, 2));
const arr2Select2 = R.compose(R.assoc('data', R.__, {}), R.map(makeSelect2Opt));
const arr2Select = R.map(R.compose(R.zipObj(['value', 'name']), R.repeat(R.__, 2)));
const constArr2Select = R.map(R.compose(R.zipObj(['value', 'name']), name => [name, constL10n(name)]));

const getSelectedRadio = function (query) {
    const els = document.querySelectorAll(query);
    for (let i = 0; i < els.length; i++) {
        if (els[i].checked === true) {
            return els[i];
        }
    }
    return null;
};

const debugInterceptor = function (callback) {
    return function () {
        console.log(JSON.stringify(arguments[0]));
        callback(...arguments);
    };
};

const Utils = {};

/** opts
    tooltip - add tooltip to button, used for iconic buttons
    id - set button id
    mainPage - enable view as first page - deprecated. Use Utils.setFirstTab instead
    toggle - toggle content, associated with button
*/
Utils.addView = function (containers, name, view, opts2) {
    const opts = opts2 || {};
    view.init();
    const buttonClass = 'navigation-button';
    containers.root.views[name] = view;
    const button = makeEl('button');
    function delegate() {
        $(button).attr('data-original-title', L10n.getValue(`header-${name}`));
    }
    if (opts.tooltip) {
        L10n.onL10nChange(delegate);
        $(button).tooltip({
            title: L10n.getValue(`header-${name}`),
            placement: 'bottom'
        });
    } else {
        addEl(button, makeText(L10n.getValue(`header-${name}`)));
        setAttr(button, 'l10n-id', `header-${name}`);
    }
    addClass(button, buttonClass);
    addClass(button, `-test-${name}`);
    addClass(button, `-toggle-class-${name}`);
    if (opts.clazz) {
        addClass(button, opts.clazz);
    }
    containers.navigation.appendChild(button);

    const onClickDelegate = function (view2) {
        return function (evt) {
            //Tests.run();
            const elems = containers.navigation.getElementsByClassName(buttonClass);
            if (opts.toggle) {
                const els = getEls(`-toggle-class-${name}`);
                for (let i = 0; i < els.length; i++) {
                    if (evt.target.isEqualNode(els[i])) {
                        continue;
                    }
                    if (hasClass(els[i], 'active')) {
                        els[i].click();
                    }
                }
            }

            const isActive = hasClass(evt.target, 'active');
            for (let i = 0; i < elems.length; i++) {
                removeClass(elems[i], 'active');
            }
            if (!opts.toggle || (opts.toggle && !isActive)) {
                addClass(evt.target, 'active');

                passEls(containers.content, getEl('warehouse'));
                containers.content.appendChild(view2.content);
                removeClass(containers.content, 'hidden');
                containers.root.currentView = view2;
                view2.refresh();
            } else {
                removeClass(evt.target, 'active');
                passEls(containers.content, getEl('warehouse'));
                containers.root.currentView = null;
                addClass(containers.content, 'hidden');
            }
        };
    };

    button.addEventListener('click', onClickDelegate(view));

    // deprecated. Use Utils.setFirstTab instead
    if (opts.mainPage) {
        Utils.setFirstTab(containers, {button, view});
    }
    return {button, view};
};

Utils.setFirstTab = function(containers, opts){
    addClass(opts.button, 'active');
    containers.content.appendChild(opts.view.content);
    containers.root.currentView = opts.view;
}

Utils.alert = function (message) {
    vex.dialog.alert(message);
};

const setError = (el, err) => addEl(clearEl(qee(el, '.error-msg')), makeText(Utils.handleErrorMsg(err)));
const clearError = (el) => clearEl(qee(el, '.error-msg'));

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
        return strFormat(getL10n(err.messageId), params);
    } else if (typeof err === 'object') {
        return err.message;
    }
    return err;
};

Utils.handleError = err => Utils.alert(Utils.handleErrorMsg(err));

Utils.enableEl = R.curry((el, condition) => {
    const key = el.tagName.toLowerCase() === 'textarea' ? 'readonly' : 'disabled';
    if (condition) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, key);
    }
});

Utils.enable = function (root, className, condition) {
    nl2array(root.getElementsByClassName(className)).map(Utils.enableEl(R.__, condition));
};

Utils.charOrdAObject = CommonUtils.charOrdAFactory(a => a.displayName.toLowerCase());

Utils.rebuildSelector = function (selector, names) {
    clearEl(selector);
    names.forEach((nameInfo) => {
        const option = makeEl('option');
        option.appendChild(makeText(nameInfo.displayName));
        option.value = nameInfo.value;
        selector.appendChild(option);
    });
};

Utils.rebuildSelectorArr = function (selector, names) {
    clearEl(selector);
    names.forEach((name) => {
        const option = makeEl('option');
        option.appendChild(makeText(name));
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

// from date format utils
//For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};
