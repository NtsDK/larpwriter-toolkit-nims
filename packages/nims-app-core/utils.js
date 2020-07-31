//const R = require('ramda');
import * as R from 'ramda';

// TODO need to lint utils with NIMS fixes
/* eslint-disable */

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
    return addEl(makeEl('div'), qte(sel)).children[0];
    // return addEl(makeEl('div'), qte(sel)).firstChild;
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

// function getEls(clazz) {
//     return document.getElementsByClassName(clazz);
// }

function makeEl(elTag) {
    return document.createElement(elTag);
}

const wrapEl = R.curry((elTag, el) => {
    return addEl(makeEl(elTag), el);
})

// const wrapEls = R.curry((elTag, els) => {
//     return addEls(makeEl(elTag), els);
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
    if (!el) {
        return;
    }
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
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

// const U = {
export default {
    setAttr, nl2array, qees, addEl, clearEl, makeText, getAttr,
    queryEls, queryEl, addClass, listen,

    qe,qee, wrapEl, qte,listenOnEnter, makeEl, fillSelector,
    addEls, clearEls, qmte, showEl, passEls, setProp, qes,queryElEl,

    setClassByCondition,setClassIf,hideEl,
    queryElEls, arr2Select2, makeOpt,setStyle,setProps,

    arr2Select,getSelectedRadio,removeClasses,

    isEmpty, addClasses, hasClass, removeClass, toggleClass
};

// export default U;
// module.exports = U;
// charOrdAObject,

// getL10n,
// constL10n,

// strFormat,

