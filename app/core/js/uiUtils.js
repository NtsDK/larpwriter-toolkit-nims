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

/* eslint-disable no-var,vars-on-top */

((exports) => {
    exports.createModalDialog = (root, onAction, opts) => {
        const commons = '.dialog-commons ';
        const el2 = wrapEl('div', qte(`${commons} .request-data-dialog-tmpl`));
        const el = qee(el2, '.modal');
        if (opts.dialogClass !== undefined) {
            addClass(el, opts.dialogClass);
        }
        const body = qee(el, '.modal-body');
        addEl(body, qte(`${commons} .${opts.bodySelector}`));
        if (opts.body !== undefined) {
            R.toPairs(opts.body).map(pair => setAttr(qee(body, pair[0]), 'l10n-id', pair[1]));
        }
        if (opts.initBody !== undefined) {
            opts.initBody(body);
        }
        addEl(body, qte(`${commons} .modal-error-block`));
        setAttr(qee(el, '.modal-title'), 'l10n-id', opts.dialogTitle);
        setAttr(qee(el, '.on-action-button'), 'l10n-id', opts.actionButtonTitle);
        L10n.localizeStatic(el);
        listen(qee(el, '.on-action-button'), 'click', onAction(el));
        el.showDlg = () => {
            clearError(el);
            $(el).modal('show');
            const focusable = qee(body, '.focusable');
            if(focusable !== null){
                setTimeout(() => focusable.focus(), 500);
            }
            const onenterable = qees(body, '.onenterable');
            if(onenterable.length !== 0){
                onenterable.forEach(listenOnEnter(R.__, onAction(el)));
            }
        };
        el.hideDlg = () => $(el).modal('hide');
        listen(qee(el, '.on-cancel-button'), 'click', () => {
            el.hideDlg()
            if(opts.onCancel) opts.onCancel();
        });
        listen(qee(el, '.on-close-button'), 'click', () => {
            el.hideDlg()
            if(opts.onCancel) opts.onCancel();
        });
        addEl(qe(root), el);
        return el;
    };

    exports.initTabPanel = (tabClazz, containerClazz) => {
        const containers = getEls(containerClazz);

        let i;
        for (i = 1; i < containers.length; i++) { // don't hide 1st element
            addClass(containers[i], 'hidden');
        }

        const tabButtons = getEls(tabClazz);

        addClass(tabButtons[0], 'active');

        for (i = 0; i < tabButtons.length; i++) {
            listen(tabButtons[i], 'click', tabButtonClick(tabButtons, containers));
        }
    };

    var tabButtonClick = (buttons, containers) => (event) => {
        for (let i = 0; i < buttons.length; i++) {
            setClassByCondition(buttons[i], 'active', event.target.id === buttons[i].id);
        }
        for (let i = 0; i < containers.length; i++) {
            hideEl(containers[i], `${event.target.id}Container` !== containers[i].id);
        }
    };

    exports.fillShowItemSelector = (selector, displayArray) => {
        let el;
        setAttr(selector, 'size', displayArray.length);
        displayArray.forEach((value) => {
            el = setProps(makeEl('option'), {
                selected: true,
            });
            hideEl(el, value.hidden);
            addEl(selector, addEl(el, makeText(value.name)));
        });
    };

    exports.fillShowItemSelector2 = (selector, optionGroups) => {
        let el, groupEl, counter = 0;
        addEls(selector, optionGroups.map((group) => {
            counter++;
            groupEl = setAttr(makeEl('optgroup'), 'label', group.name);
            addEls(groupEl, group.array.map((value) => {
                el = setProps(makeEl('option'), {
                    selected: true,
                });
                hideEl(el, value.hidden);
                counter += (value.hidden ? 0 : 1);
                return addEl(el, makeText(value.name));
            }));
            return groupEl;
        }));
        setAttr(selector, 'size', counter);
    };

//    exports.showSelectedEls = classKey => (event) => {
//        const t1 = performance.now();
//        const el = event.target;
//        let els, i, j;
//        for (i = 0; i < el.options.length; i += 1) {
//            els = getEls(classKey + i);
//            for (j = 0; j < els.length; j++) {
//                hideEl(els[j], !el.options[i].selected);
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
//            els = queryEls(root + ' .' + classKey + i);
//            for (j = 0; j < els.length; j++) {
//                hideEl(els[j], !el.options[i].selected);
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
        const els = queryEls(root + ' .' + classKey);
        els.forEach(el2 => {
            showEl(el2, map[getAttr(el2, attr)]);
        });
        console.log('showSelectedEls3 time ' + (performance.now() - t1) + ' ms');
    };

    exports.initSelectorFilters = () => {
        queryEls('[selector-filter]').forEach((el) => {
            const sel = queryEl(getAttr(el, 'selector-filter'));
            el.value = '';
            setAttr(el, 'l10n-placeholder-id', 'constant-filter');
            addClass(el, 'form-control margin-bottom-8');
            listen(el, 'input', filterOptions(sel));
        });
    };

    var filterOptions = sel => (event) => {
        let val = event.target.value;
        let i, opt;
        val = CommonUtils.globStringToRegex(val.trim().toLowerCase());
        for (i = 0; i < sel.options.length; i += 1) {
            opt = sel.options[i];
            const isVisible = opt.innerHTML.toLowerCase().search(val) !== -1;
            if (!isVisible) {
                opt.selected = false;
            }
            hideEl(opt, !isVisible);
            //                setClassByCondition(opt, "hidden", opt.innerHTML.toLowerCase().search(val) === -1);
        }
        sel.dispatchEvent(new Event('change'));
    };

    exports.initPanelToggler = (el) => {
        const attr = getAttr(el, 'panel-toggler');
        addClass(el, 'expanded');
        const sel = document.querySelector(attr);
        if (sel == null) {
            Utils.alert(`Panel toggler is broken: ${attr}`);
        }
        listen(el, 'click', togglePanel(el, sel));
    };

    exports.initPanelTogglers = el => qees(el || document, '[panel-toggler]').forEach(exports.initPanelToggler);

    exports.attachPanelToggler = (header, content, callback) => {
        addClass(header, 'expanded');
        listen(header, 'click', (event) => {
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
        const isExpanded = hasClass(el, 'expanded');
        removeClasses(el, ['expanded', 'collapsed']);
        addClass(el, isExpanded ? 'collapsed' : 'expanded');
        toggleClass(sel, 'hidden');
    };

    exports.makeEventTimePicker = (opts) => {
        const input = makeEl('input');
        R.ap([addClass(input)], opts.extraClasses);
        addClass(input, 'eventTime');
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
            addClass(input, 'defaultDate');
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
            addClass(input, 'defaultDate');
        }

        jQuery(input).datetimepicker(pickerOpts);
        return input;
    };

    // bug about setting 0900 years in Braavos game is event date. Fixed in production.
    //  exports.makeEventTimePicker = function (opts) {
    //      var input = makeEl("input");
    //      R.ap([addClass(input)], opts.extraClasses);
    //      addClass(input, "eventTime");
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
    //          addClass(input, "defaultDate");
    //      }
    //
    //      picker.value = value;
    //
    //
    //      return input;
    //  };

    exports.initTextAreas = (sel) => {
        R.ap([exports.attachTextareaResizer], queryEls(sel));
    };

    exports.refreshTextAreas = (sel) => {
        R.ap([exports.resizeTextarea], queryEls(sel).map(el => ({ target: el })));
    };

    exports.attachTextareaResizer = (input) => {
        listen(input, 'keydown', exports.resizeTextarea);
        listen(input, 'paste', exports.resizeTextarea);
        listen(input, 'cut', exports.resizeTextarea);
        listen(input, 'change', exports.resizeTextarea);
        listen(input, 'drop', exports.resizeTextarea);
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
        setClassByCondition(input, 'notEditable', !isEditable);
        input.value = event.characters[characterName].time;
        input.dataKey = JSON.stringify([storyName, event.index, characterName]);
        listen(input, 'change', onChangePersonalTimeDelegate);
        return input;
    };

    var onChangePersonalTimeDelegate = (event) => {
        const dataKey = JSON.parse(event.target.dataKey);
        const time = event.target.value;
        DBMS.setEventAdaptationProperty(dataKey[0], dataKey[1], dataKey[2], 'time', time, Utils.processError());
    };

    exports.populateReadyCheckbox = (div, id, checked, isEditable, callback) => {
        const input = qee(div, 'input');
        setClassByCondition(input, 'notEditable', !isEditable);
        input.checked = checked;
        input.id = id;
        listen(input, 'change', callback);
        setAttr(qee(div, 'label'), 'for', input.id);
        return div;
    };

    exports.onChangeAdaptationReadyStatus2 = callback => (event) => {
        const dataKey = JSON.parse(event.target.id);
        const value = !hasClass(event.target, 'btn-primary');
        DBMS.setEventAdaptationProperty(dataKey[0], dataKey[1], dataKey[2], 'ready', value, (err) => {
            if (err) { Utils.handleError(err); return; }
            setClassByCondition(event.target, 'btn-primary', value);
            callback(value);
        });
    };

    exports.makePanelCore = (title, content) => {
        const panel = addClasses(makeEl('div'), ['panel', 'panel-default']);
        const h3 = addClass(addEl(makeEl('h3'), title), 'panel-title');
        const a = setAttr(makeEl('a'), 'href', '#/');
        setAttr(a, 'panel-toggler', '');
        const headDiv = addClass(makeEl('div'), 'panel-heading');
        addEl(panel, addEl(headDiv, addEl(a, h3)));
        const contentDiv = addClass(makeEl('div'), 'panel-body');
        addEl(panel, addEl(contentDiv, content));
        return {
            panel,
            contentDiv,
            a
        };
    };

    exports.makeProfileTable = (profileStructure, profile) => {
        const container = qmte('.profile-editor-container-tmpl');
        addClass(container, 'profile-table');
        let value;
        return addEls(container, profileStructure.filter(element => element.doExport).map((element) => {
            switch (element.type) {
            case 'text':
                value = addClass(makeEl('span'), 'briefingTextSpan');
                addEl(value, makeText(profile[element.name]));
                break;
            case 'enum':
            case 'multiEnum':
            case 'number':
            case 'string':
                value = makeText(profile[element.name]);
                break;
            case 'checkbox':
                value = makeText(constL10n(Constants[profile[element.name]]));
                break;
            default:
                throw new Error(`Unexpected type ${element.type}`);
            }
            const row = qmte('.profile-editor-row-tmpl');
            addEl(qee(row, '.profile-item-name'), makeText(element.name));
            addEl(qee(row, '.profile-item-input'), value);
            return row;
        }));
    };

    exports.makeTableRow = (col1, col2) => addEls(makeEl('tr'), [addEl(makeEl('td'), col1), addEl(makeEl('td'), col2)]);

    exports.checkAndGetEntitySetting = (settingsPath, names) => {
        if (names.length === 0) return null;
        const settings = DBMS.getSettings();
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
        const settings = DBMS.getSettings();
        if(settings[settingsPath] === undefined) {
            settings[settingsPath] = {};
        }
        settings[settingsPath].name = name;
    };
})(this.UI = {});
