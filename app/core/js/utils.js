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

const rAddClass = R.curry((c, o) => addClass(o, c));

function hasClass(o, c) {
    const re = new RegExp(`(^|\\s)${c}(\\s|$)`, 'g');
    return (re.test(o.className));
}

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

function setClassByCondition(o, c, condition) {
    if (condition) {
        addClass(o, c);
    } else {
        removeClass(o, c);
    }
    return o;
}

function getEl(id) {
    return document.getElementById(id);
}

function queryEl(sel) {
    return document.querySelector(sel);
}

function queryEls(sel) {
    return nl2array(document.querySelectorAll(sel));
}

function queryElEls(el, sel) {
    return nl2array(el.querySelectorAll(sel));
}

function getEls(clazz) {
    return document.getElementsByClassName(clazz);
}

function makeEl(elTag) {
    return document.createElement(elTag);
}

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

const rAddEl = R.curry((child, parent) => {
    parent.appendChild(child);
    return parent;
});


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

function getAttr(el, name) {
    return el.getAttribute(name);
}

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
            callback();
        }
    });
});

const fillSelector = R.curry((sel, data) => addEls(sel, data.map((item) => {
    const opt = makeEl('option');
    addEl(opt, makeText(item.name));
    if (item.value) { opt.value = item.value; }
    if (item.selected) { opt.selected = true; }
    if (item.className) { addClass(opt, item.className); }
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
    mainPage - enable view as first page
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
    if (opts.mainPage) {
        addClass(button, 'active');
        containers.content.appendChild(view.content);
        containers.root.currentView = view;
    }
};

Utils.alert = function (message) {
    vex.dialog.alert(message);
};

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
        return strFormat(getL10n(err.messageId), err.parameters);
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

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// from date format utils
//For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};
