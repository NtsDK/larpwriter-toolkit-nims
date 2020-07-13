const $ = require('jquery');
require('jquery-datetimepicker');
require('jquery-datetimepicker/build/jquery.datetimepicker.min.css');
require('bootstrap-sass');

const vex = require('vex-js');
vex.registerPlugin(require('vex-dialog'));
// vex.defaultOptions.className = 'vex-theme-os';
vex.defaultOptions.className = 'vex-theme-default';

require('vex-js/dist/css/vex.css');
require('vex-js/dist/css/vex-theme-default.css');

//const R = require('ramda');
const U = require('./utils');
// const UI = require('./uiUtils');
const L10n = require('./l10n');
// const Errors = require('./common/errors');
const Timing = require('./Timing');
// const CU = require('./common/commonUtils');

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

/* eslint-disable no-var,vars-on-top */

exports.updateDialogL10n = function () {
    vex.dialog.buttons.YES.text = L10n.getValue('common-ok');
    vex.dialog.buttons.NO.text = L10n.getValue('common-cancel');
};

/** opts
    tooltip - add tooltip to button, used for iconic buttons
    id - set button id
    mainPage - enable view as first page - deprecated. Use Utils.setFirstTab instead
    toggle - toggle content, associated with button
*/
exports.addView = function (containers, name, view, opts2) {
    const opts = opts2 || {};
    view.init();
    const buttonClass = 'navigation-button';
    containers.root.views[name] = view;
    const button = U.makeEl('button');
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
        U.addEl(button, U.makeText(L10n.getValue(`header-${name}`)));
        U.setAttr(button, 'l10n-id', `header-${name}`);
    }
    U.addClass(button, buttonClass);
    U.addClass(button, `-test-${name}`);
    U.addClass(button, `-toggle-class-${name}`);
    if (opts.clazz) {
        U.addClass(button, opts.clazz);
    }
    containers.navigation.appendChild(button);

    const onClickDelegate = function (view2) {
        return function (evt) {
            //Tests.run();
            const elems = containers.navigation.getElementsByClassName(buttonClass);
            if (opts.toggle) {
                const els = U.queryEls(`.-toggle-class-${name}`);
                for (let i = 0; i < els.length; i++) {
                    if (!evt.target.isEqualNode(els[i]) && U.hasClass(els[i], 'active')) {
                        els[i].click();
                    }
                }
            }

            const isActive = U.hasClass(evt.target, 'active');
            for (let i = 0; i < elems.length; i++) {
                U.removeClass(elems[i], 'active');
            }
            if (!opts.toggle || (opts.toggle && !isActive)) {
                U.addClass(evt.target, 'active');

                U.passEls(containers.content, U.queryEl('#warehouse'));
                containers.content.appendChild(view2.content || view2.getContent());
                U.removeClass(containers.content, 'hidden');
                containers.root.currentView = view2;
                view2.refresh();
            } else {
                U.removeClass(evt.target, 'active');
                U.passEls(containers.content, U.queryEl('#warehouse'));
                containers.root.currentView = null;
                U.addClass(containers.content, 'hidden');
            }
        };
    };

    button.addEventListener('click', onClickDelegate(view));

    // deprecated. Use Utils.setFirstTab instead
    if (opts.mainPage) {
        exports.setFirstTab(containers, { button, view });
    }
    return { button, view };
};

// ((exports) => {


exports.initTabPanel = (tabClazz, containerClazz) => {
    const containers = U.queryEls(`.${containerClazz}`);

    let i;
    for (i = 1; i < containers.length; i++) { // don't hide 1st element
        U.addClass(containers[i], 'hidden');
    }

    const tabButtons = U.queryEls(`.${tabClazz}`);

    U.addClass(tabButtons[0], 'active');

    for (i = 0; i < tabButtons.length; i++) {
        U.listen(tabButtons[i], 'click', tabButtonClick(tabButtons, containers));
    }
};

var tabButtonClick = (buttons, containers) => (event) => {
    for (let i = 0; i < buttons.length; i++) {
        U.setClassByCondition(buttons[i], 'active', event.target.id === buttons[i].id);
    }
    for (let i = 0; i < containers.length; i++) {
        U.hideEl(containers[i], `${event.target.id}Container` !== containers[i].id);
    }
};

exports.fillShowItemSelector = (selector, displayArray) => {
    let el;
    U.setAttr(selector, 'size', displayArray.length);
    displayArray.forEach((value) => {
        el = U.setProps(U.makeEl('option'), {
            selected: true,
        });
        U.hideEl(el, value.hidden);
        U.addEl(selector, U.addEl(el, U.makeText(value.name)));
    });
};

exports.fillShowItemSelector2 = (selector, optionGroups, setSize) => {
    let el, groupEl, counter = 0;
    U.addEls(selector, optionGroups.map((group) => {
        counter++;
        groupEl = U.setAttr(U.makeEl('optgroup'), 'label', group.displayName);
        U.addEls(groupEl, group.array.map((option) => {
            el = U.setProps(U.makeEl('option'), {
                selected: true,
            });
            U.setAttr(el, 'value', option.name);
            counter++;
            return U.addEl(el, U.makeText(option.displayName));
        }));
        return groupEl;
    }));
    if (setSize) {
        U.setAttr(selector, 'size', counter);
    }
};

//    exports.showSelectedEls = classKey => (event) => {
//        const t1 = performance.now();
//        const el = event.target;
//        let els, i, j;
//        for (i = 0; i < el.options.length; i += 1) {
//            els = getEls(classKey + i);
//            for (j = 0; j < els.length; j++) {
//                U.hideEl(els[j], !el.options[i].selected);
//            }
//        }
//        console.log('showSelectedEls time ' + (performance.now() - t1) + ' ms');
//    };
//
//    exports.showSelectedEls2 = (root, classKey) => (event) => {
//        const t1 = performance.now();
//        const el = event.target;
//        let els, i, j;
//        for (i = 0; i < el.options.length; i += 1) {
//            els = U.queryEls(root + ' .' + classKey + i);
//            for (j = 0; j < els.length; j++) {
//                U.hideEl(els[j], !el.options[i].selected);
//            }
//        }
//        console.log('showSelectedEls2 time ' + (performance.now() - t1) + ' ms');
//    };

exports.showSelectedEls3 = (root, classKey, attr) => (event) => {
    const t1 = performance.now();
    const el = event.target;
    let i, j;
    const map = {};
    for (i = 0; i < el.options.length; i += 1) {
        map[i] = el.options[i].selected;
    }
    const els = U.queryEls(`${root} .${classKey}`);
    els.forEach((el2) => {
        U.showEl(el2, map[U.getAttr(el2, attr)]);
    });
    console.log(`showSelectedEls3 time ${performance.now() - t1} ms`);
};

exports.initSelectorFilters = () => {
    U.queryEls('[selector-filter]').forEach((el) => {
        const sel = U.queryEl(U.getAttr(el, 'selector-filter'));
        el.value = '';
        U.setAttr(el, 'l10n-placeholder-id', 'constant-filter');
        U.addClass(el, 'form-control margin-bottom-8');
        U.listen(el, 'input', filterOptions(sel));
    });
};

var filterOptions = (sel) => (event) => {
    let val = event.target.value;
    let i, opt;
    val = val.toLowerCase();
    for (i = 0; i < sel.options.length; i += 1) {
        opt = sel.options[i];
        //            const isVisible = opt.innerHTML.toLowerCase().search(val) !== -1;
        const isVisible = opt.innerHTML.toLowerCase().indexOf(val) !== -1;
        if (!isVisible) {
            opt.selected = false;
        }
        U.hideEl(opt, !isVisible);
        //                U.setClassByCondition(opt, "hidden", opt.innerHTML.toLowerCase().search(val) === -1);
    }
    sel.dispatchEvent(new Event('change'));
};

exports.initPanelToggler = (el) => {
    const attr = U.getAttr(el, 'panel-toggler');
    U.addClass(el, 'expanded');
    const sel = document.querySelector(attr);
    if (sel == null) {
        // UI.alert(`Panel toggler is broken: ${attr}`);
        exports.alert(`Panel toggler is broken: ${attr}`);
    }
    U.listen(el, 'click', togglePanel(el, sel));
};

exports.initPanelTogglers = (el) => U.qees(el || document, '[panel-toggler]').forEach(exports.initPanelToggler);

exports.attachPanelToggler = (header, content, callback) => {
    U.addClass(header, 'expanded');
    U.listen(header, 'click', (event) => {
        if (callback) {
            callback(event, () => {
                togglePanel(header, content)(event);
            });
        } else {
            togglePanel(header, content)(event);
        }
    });
};

var togglePanel = (el, sel) => (event) => {
    const isExpanded = U.hasClass(el, 'expanded');
    U.removeClasses(el, ['expanded', 'collapsed']);
    U.addClass(el, isExpanded ? 'collapsed' : 'expanded');
    U.toggleClass(sel, 'hidden');
};

exports.makeEventTimePicker = (opts) => {
    const input = U.makeEl('input');
    R.ap([U.addClass(input)], opts.extraClasses);
    U.addClass(input, 'eventTime');
    input.value = opts.eventTime;

    input.eventIndex = opts.index;

    const pickerOpts = {
        lang: L10n.getLang(),
        mask: true,
        startDate: new Date(opts.preGameDate),
        endDate: new Date(opts.date),
        onChangeDateTime: opts.onChangeDateTimeCreator(input),
    };

    if (opts.eventTime !== '') {
        pickerOpts.value = opts.eventTime;
    } else {
        pickerOpts.value = opts.date;
        U.addClass(input, 'defaultDate');
    }

    jQuery(input).datetimepicker(pickerOpts);
    return input;
};

exports.makeEventTimePicker2 = (input, opts) => {
    input.value = opts.eventTime;

    input.eventIndex = opts.index;

    const pickerOpts = {
        lang: L10n.getLang(),
        mask: true,
        startDate: new Date(opts.preGameDate),
        endDate: new Date(opts.date),
        onChangeDateTime: opts.onChangeDateTimeCreator(input),
    };

    if (opts.eventTime !== '') {
        pickerOpts.value = opts.eventTime;
    } else {
        pickerOpts.value = opts.date;
        U.addClass(input, 'defaultDate');
    }

    jQuery(input).datetimepicker(pickerOpts);
    return input;
};

// bug about setting 0900 years in Braavos game is event date. Fixed in production.
//  exports.makeEventTimePicker = function (opts) {
//      var input = U.makeEl("input");
//      R.ap([U.addClass(input)], opts.extraClasses);
//      U.addClass(input, "eventTime");
//      input.value = opts.eventTime;
//
//      input.eventIndex = opts.index;
//
//      var pickerOpts = {
//          lang : L10n.getLang(),
//          mask : true,
//          startDate : new Date(opts.preGameDate),
//          endDate : new Date(opts.date),
//          onChangeDateTime : opts.onChangeDateTimeCreator(input),
//      };
//
//      var picker = jQuery(input).datetimepicker(pickerOpts);
//
//      var value;
//      if (opts.eventTime !== "") {
//          value = new Date(opts.eventTime);
//      } else {
//          value = opts.date;
//          U.addClass(input, "defaultDate");
//      }
//
//      picker.value = value;
//
//
//      return input;
//  };

exports.initTextAreas = (sel) => {
    R.ap([exports.attachTextareaResizer], U.queryEls(sel));
};

exports.refreshTextAreas = (sel) => {
    R.ap([exports.resizeTextarea], U.queryEls(sel).map((el) => ({ target: el })));
};

exports.attachTextareaResizer = (input) => {
    U.listen(input, 'keydown', exports.resizeTextarea);
    U.listen(input, 'paste', exports.resizeTextarea);
    U.listen(input, 'cut', exports.resizeTextarea);
    U.listen(input, 'change', exports.resizeTextarea);
    U.listen(input, 'drop', exports.resizeTextarea);
};

exports.resizeTextarea = (ev) => {
    const that = ev.target;
    that.style.height = '24px';
    that.style.height = `${that.scrollHeight + 12}px`;
};

exports.resizeTextarea2 = (that) => {
    that.style.height = '24px';
    that.style.height = `${that.scrollHeight + 12}px`;
};

exports.populateAdaptationTimeInput = (input, storyName, event, characterName, isEditable) => {
    U.setClassByCondition(input, 'notEditable', !isEditable);
    input.value = event.characters[characterName].time;
    input.dataKey = JSON.stringify([storyName, event.index, characterName]);
    U.listen(input, 'change', onChangePersonalTimeDelegate);
    return input;
};

var onChangePersonalTimeDelegate = (event) => {
    const dataKey = JSON.parse(event.target.dataKey);
    const time = event.target.value;
    DBMS.setEventAdaptationProperty({
        storyName: dataKey[0],
        eventIndex: dataKey[1],
        characterName: dataKey[2],
        type: 'time',
        value: time
    }).catch(exports.handleError);
};

exports.populateReadyCheckbox = (div, id, checked, isEditable, callback) => {
    const input = U.qee(div, 'input');
    U.setClassByCondition(input, 'notEditable', !isEditable);
    input.checked = checked;
    input.id = id;
    U.listen(input, 'change', callback);
    U.setAttr(U.qee(div, 'label'), 'for', input.id);
    return div;
};

exports.onChangeAdaptationReadyStatus2 = (callback) => (event) => {
    const dataKey = JSON.parse(event.target.id);
    const value = !U.hasClass(event.target, 'btn-primary');

    DBMS.setEventAdaptationProperty({
        storyName: dataKey[0],
        eventIndex: dataKey[1],
        characterName: dataKey[2],
        type: 'ready',
        value
    }).then(() => {
        U.setClassByCondition(event.target, 'btn-primary', value);
        callback(value);
    }).catch(exports.handleError);
};

exports.makePanelCore = (title, content) => {
    const panel = U.addClasses(U.makeEl('div'), ['panel', 'panel-default']);
    const h3 = U.addClass(U.addEl(U.makeEl('h3'), title), 'panel-title');
    const a = U.setAttr(U.makeEl('a'), 'href', '#/');
    U.setAttr(a, 'panel-toggler', '');
    const headDiv = U.addClass(U.makeEl('div'), 'panel-heading');
    U.addEl(panel, U.addEl(headDiv, U.addEl(a, h3)));
    const contentDiv = U.addClass(U.makeEl('div'), 'panel-body');
    U.addEl(panel, U.addEl(contentDiv, content));
    return {
        panel,
        contentDiv,
        a
    };
};

exports.makeTableRow = (col1, col2) => U.addEls(U.makeEl('tr'), [U.addEl(U.makeEl('td'), col1), U.addEl(U.makeEl('td'), col2)]);

exports.checkAndGetEntitySetting = (settingsPath, names) => {
    if (names.length === 0) return null;
    const settings = SM.getSettings();
    if (!settings[settingsPath]) {
        settings[settingsPath] = {
            name: names[0].value
        };
    }
    let { name } = settings[settingsPath];
    const rawNames = names.map(R.prop('value'));
    if (rawNames.indexOf(name) === -1) {
        settings[settingsPath].name = names[0].value;
        name = names[0].value;
    }
    return name;
};

exports.updateEntitySetting = (settingsPath, name) => {
    const settings = SM.getSettings();
    if (settings[settingsPath] === undefined) {
        settings[settingsPath] = {};
    }
    settings[settingsPath].name = name;
};

exports.scrollTo = (container, element) => {
    const domRect = element.getBoundingClientRect();
    const { scrollTop } = container;
    const scrollBottom = container.scrollTop + container.clientHeight;
    const condition = (element.offsetTop < scrollTop) || (element.offsetTop + domRect.height) > scrollBottom;

    if (condition) {
        const from = container.scrollTop;
        const to = element.offsetTop - container.clientHeight / 2 + domRect.height / 2;

        exports.animate({
            duration: 500,
            timing: Timing.makeEaseInOut(Timing.poly(4)),
            draw(progress) {
                container.scrollTop = from + (to - from) * progress;
            }
        });
    }
};

exports.constArr2Select = R.map(R.compose(R.zipObj(['value', 'name']), (name) => [name, L10n.const(name)]));

exports.remapProps = R.curry((outKeys, pickKeys, obj) => R.compose(R.zipObj(outKeys), R.values, R.pick(pickKeys))(obj));

exports.remapProps4Select2 = exports.remapProps(['id', 'text'], ['value', 'displayName']);
exports.remapProps4Select = exports.remapProps(['value', 'name'], ['value', 'displayName']);

exports.getSelect2DataCommon = R.curry((preparator, obj) => R.compose(R.zipObj(['data']), R.append(R.__, []), R.map(preparator))(obj));
exports.getSelect2Data = exports.getSelect2DataCommon(exports.remapProps4Select2);
// })(window.UI = {});

exports.setFirstTab = function (containers, opts) {
    U.addClass(opts.button, 'active');
    containers.content.appendChild(opts.view.content || opts.view.getContent());
    containers.root.currentView = opts.view;
};

exports.alert = function (message) {
    vex.dialog.alert(message);
};

const setError = (el, err) => U.addEl(U.clearEl(U.qee(el, '.error-msg')), U.makeText(exports.handleErrorMsg(err)));
const clearError = (el) => U.clearEl(U.qee(el, '.error-msg'));

exports.setError = setError;
exports.clearError = clearError;

exports.confirm = function (message, onOk, onCancel) {
    vex.dialog.confirm({
        message,
        callback: (val) => {
            if (val) {
                if (onOk) onOk();
            } else if (onCancel) onCancel();
        }
    });
};

exports.processError = function (callback) {
    return function (err) {
        if (err) {
            exports.handleError(err);
            return;
        }

        if (callback) {
            const arr = [];
            for (let i = 1; i < arguments.length; i++) {
                // eslint-disable-next-line prefer-rest-params
                arr.push(arguments[i]);
            }
            callback(...arr);
        }
    };
};

exports.handleErrorMsg = function (err) {
    const checkErrorType = R.curry((err2, name) => err2 instanceof Errors[name] || (err2.name && err2.name === name));
    if (R.keys(Errors).some(checkErrorType(err))) {
        const params = err.parameters.map((val) => (L10n.hasValue(val) ? L10n.getValue(val) : val));
        return CU.strFormat(L10n.getValue(err.messageId), params);
    } if (typeof err === 'object') {
        return err.message;
    }
    return err;
};

exports.handleError = (err) => {
    console.error(err);
    exports.alert(exports.handleErrorMsg(err));
};

exports.enableEl = R.curry((el, condition) => {
    const key = el.tagName.toLowerCase() === 'textarea' ? 'readonly' : 'disabled';
    if (condition) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, key);
    }
});

exports.enable = function (root, className, condition) {
    U.nl2array(root.getElementsByClassName(className)).map(exports.enableEl(R.__, condition));
};

exports.rebuildSelector = function (selector, names) {
    U.clearEl(selector);
    names.forEach((nameInfo) => {
        const option = U.makeEl('option');
        option.appendChild(U.makeText(nameInfo.displayName));
        option.value = nameInfo.value;
        selector.appendChild(option);
    });
};

exports.rebuildSelectorArr = function (selector, names) {
    U.clearEl(selector);
    names.forEach((name) => {
        const option = U.makeEl('option');
        option.appendChild(U.makeText(name));
        selector.appendChild(option);
    });
};

// from https://learn.javascript.ru/js-animation
exports.animate = (options) => {
    const start = performance.now();

    requestAnimationFrame(function animate(time) {
        // timeFraction from 0 to 1
        let timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;

        // current animation state
        const progress = options.timing(timeFraction);

        options.draw(progress);

        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        }
    });
};
