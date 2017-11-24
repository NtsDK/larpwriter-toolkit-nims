/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

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

((exports) => {
    const root = '.charsheet-tab ';
    const state = {
        refreshHooks: []
    };
    const onRefresh = callback => state.refreshHooks.push(callback);
    const addRefreshHook = R.curry((getter, itemName, rangeOnLoad2) =>
        onRefresh(onRefreshHook(getter, itemName, rangeOnLoad2)));

    exports.init = () => {
        listen(queryEl(`${root}.background-color-input`), 'change', onBackgroundColorChange);

        const sel = clearEl(queryEl(`${root}.charsheet-back-mode`));
        fillSelector(sel, constArr2Select(Constants.charsheetBackModes));
        listen(sel, 'change', onCharsheetBackModeChange);
        listen(queryEl(`${root}.charsheet-background-color-input`), 'change', onCharsheetBackColorChange);
        listen(queryEl(`${root}.back-image-to-default`), 'click', toDefaultImage);

        listen(queryEl(`${root}.charsheet-background-image-input`), 'change', readImage);
        listen(queryEl(`${root}.charsheet-background-image-input`), 'focus', (e) => {
            e.target.value = '';
        });

        const profileEls = Constants.profileCols.map(R.map(makeProfileEl)).map(els => addEls(makeEl('div'), els));
        addEls(queryEl(`${root}.profile-container`), profileEls);

        const attrRange = makeRangeEl('setAttribute', 0, Constants.maxPoints, makeStaticLabel, addRefreshHook('getAttribute'));
        fillStats('.attributes-container', Constants.attributeCols, attrRange);

        const abilRange = makeRangeEl('setAbility', 0, Constants.maxPoints, makeStaticLabel, addRefreshHook('getAbility'));
        fillStats('.abilities-container', Constants.abilityCols, abilRange);

        const virtueRange = makeRangeEl('setVirtue', 1, Constants.maxPoints, makeStaticLabel, addRefreshHook('getVirtue'));
        fillVirtues('.virtues-container', Constants.virtues, virtueRange);

        const someState = makeRangeEl('setState', 0, Constants.extrasMaxPoints, nuller, addRefreshHook('getState'));
        addEl(queryEl('.humanity-container'), someState('humanity'));
        addEl(queryEl('.willpower-container'), someState('willpower'));
        addEl(queryEl('.willpower2-container'), someState('willpower2'));
        const someState2 = makeRangeEl3('setState', 0, 20, nuller, addRefreshHook('getState'));
        addEls(queryEl('.bloodpool-container'), someState2('bloodpool'));

        const meritInput = makeEntityRenameInput('setBackstory', 'merits', false);
        listen(queryEl('.merits-container .add-button'), 'click', makeInputBuilder('.merits-container', meritInput));
        addRefreshHook('getBackstory', 'merits', backstoryCb('.merits-container', meritInput));

        const flawInput = makeEntityRenameInput('setBackstory', 'flaws', false);
        listen(queryEl('.flaws-container .add-button'), 'click', makeInputBuilder('.flaws-container', flawInput));
        addRefreshHook('getBackstory', 'flaws', backstoryCb('.flaws-container', flawInput));

        const backgroundInput = makeAdvantageInput('renameAdvantage', 'backgrounds', 'setBackground');
        listen(queryEl('.backgrounds-container .add-button'), 'click', makeInputBuilder('.backgrounds-container', backgroundInput));
        addRefreshHook('getAdvantages', 'backgrounds', backstoryCb('.backgrounds-container', backgroundInput));

        const disciplineInput = makeAdvantageInput('renameAdvantage', 'disciplines', 'setDiscipline');
        listen(queryEl('.disciplines-container .add-button'), 'click', makeInputBuilder('.disciplines-container', disciplineInput));
        addRefreshHook('getAdvantages', 'disciplines', backstoryCb('.disciplines-container', disciplineInput));

        fillStats('.health-container', Constants.healthCols, makeHealthRow);

        listen(queryEl('.notes-content'), 'change', event => DBMS.setNotes(event.target.value, Utils.processError()));
        onRefresh(() => {
            DBMS.getNotes((err, value) => {
                if (err) { Utils.handleError(err); return; }
                queryEl('.notes-content').value = value;
            });
        });

        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        DBMS.getSettings((err, settings) => {
            if (err) { Utils.handleError(err); return; }
            setStyle(queryEl('body'), 'background-color', settings.backgroundColor);
            queryEl(`${root}.background-color-input`).value = settings.backgroundColor;
            queryEl(`${root}.charsheet-background-color-input`).value = settings.charsheetBackColor;
            queryEl(`${root}.charsheet-back-mode`).value = settings.charsheetBackMode;
            let img = settings.charsheetBackImage;
            if (CommonUtils.startsWith(img, '..')) {
                img = img.substring(1);
            }
            //            setStyle(queryEl(`${root}.charsheet-background-image`), 'backgroundImage', `url(${img})`);
            let color;
            let image;
            switch (settings.charsheetBackMode) {
            case 'charsheet-image':
                color = 'transparent';
                image = `url(${img})`;
                break;
            case 'charsheet-none':
                color = 'transparent';
                image = 'none';
                break;
            case 'charsheet-color':
                color = settings.charsheetBackColor;
                image = 'none';
                break;
            default:
                throw new Error(`Unexpected mode ${settings.charsheetBackMode}`);
            }
            queryEls(`${root}.charsheet-page`).forEach((el) => {
                setImportantStyle(el, 'background-color', color);
                setImportantStyle(el, 'background-image', image);
            });

            state.refreshHooks.forEach(R.apply(R.__, []));
        });
    };

    function readImage(event) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const imageData = readerEvent.target.result;
            // setStyle(queryEl(`${root}.charsheet-background-image`), 'backgroundImage', `url(${imageData})`);
            DBMS.setCharsheetBackImage(imageData, Utils.processError(exports.refresh));
        };
        reader.readAsDataURL(event.target.files[0]);
    }

    function onBackgroundColorChange(event) {
        DBMS.setBackgroundColor(event.target.value, Utils.processError(exports.refresh));
    }
    function toDefaultImage(event) {
        DBMS.setCharsheetBackImage(Constants.defaultImg, Utils.processError(exports.refresh));
    }
    function onCharsheetBackColorChange(event) {
        DBMS.setCharsheetBackgroundColor(event.target.value, Utils.processError(exports.refresh));
    }
    function onCharsheetBackModeChange(event) {
        DBMS.setCharsheetBackMode(event.target.value, Utils.processError(exports.refresh));
    }

    function makeProfileEl(itemName) {
        const input = makeEl('input');
        addRefreshHook('getProfileItem', itemName, value => (input.value = value));
        listen(input, 'change', event =>
            DBMS.setProfileItem(itemName, event.target.value.trim(), Utils.processError()));
        return addEls(makeEl('div'), [fillText(makeEl('span'), itemName), input]);
    }

    // eslint-disable-next-line no-var,vars-on-top
    var fillVirtues = (selector, data, func) => addEls(queryEl(selector), data.map(func));

    function fillStats(selector, data, func) {
        addEls(queryEl(selector), data.map(obj =>
            // return addEls(makeEl('div'), makeRangeEls(obj, func));
            addEls(makeEl('div'), obj.arr.map(func))));
    }

    function makeHealthRow(val) {
        const icon = makeEl('img');
        icon.str = val.name;
        setAttr(icon, 'src', 'images/injure_deadly.svg');
        function setImg(num) {
            if (num === 0) {
                setAttr(icon, 'src', 'images/injure_no.svg');
            }
            if (num === 1) {
                setAttr(icon, 'src', 'images/injure_wound.svg');
            }
            if (num === 2) {
                setAttr(icon, 'src', 'images/injure_deadly.svg');
            }
            setClassByCondition(icon.parentNode, 'wounded', num !== 0);
        }

        addRefreshHook('getHealth', val.name, (num) => {
            icon.num = num;
            setImg(num);
        });

        listen(icon, 'click', (event) => {
            //            if (!event.ctrlKey && !event.metaKey) { return; }
            event.target.num = (event.target.num + 1) % 3;
            setImg(event.target.num);
            DBMS.setHealth(event.target.str, event.target.num, Utils.processError());
        });
        return addEls(addClass(makeEl('div'), 'health-stat'), [makeStaticLabel(val.name), icon,
            addEl(makeEl('span'), makeText(val.penalty))]);
    }

    function makeStaticLabel(label) {
        return fillText(makeEl('span'), label);
    }
    function nuller() {
        return null;
    }

    function rangeOnClick(setter, icons, min, max, itemNameCb) {
        return (event) => {
            //            if (!event.ctrlKey && !event.metaKey) { return; }
            const { target } = event;
            const isPointOn = getAttr(target, 'src') === 'images/radio-on-button.svg';
            let selected = isPointOn ? target.number - 1 : target.number;
            selected = selected < min ? min - 1 : selected;
            for (let j = 0; j < max; j++) {
                setAttr(icons[j], 'src', selected >= j ? 'images/radio-on-button.svg' : 'images/circumference.svg');
            }
            DBMS[setter](itemNameCb(), Number(selected + 1), Utils.processError());
        };
    }

    function rangeOnLoad(icons, max) {
        return (num) => {
            for (let i = 0; i < max; i++) {
                setAttr(icons[i], 'src', num > i ? 'images/radio-on-button.svg' : 'images/circumference.svg');
            }
        };
    }

    // eslint-disable-next-line no-var,vars-on-top
    var makeRangeEl = R.curry((setter, min, max, labelMaker, initRange, itemName) => {
        const label = labelMaker(itemName);
        return makeRangeEl2(setter, min, max, label, initRange, R.always(itemName));
    });

    // eslint-disable-next-line no-var,vars-on-top
    var makeRangeEl2 = R.curry((setter, min, max, label, initRange, itemNameCb) => {
        const icons = [];
        for (let i = 0; i < max; i++) {
            const icon = makeEl('img');
            icon.number = i;
            listen(icon, 'click', rangeOnClick(setter, icons, min, max, itemNameCb));
            icons.push(icon);
        }

        const div = addEls(addClass(makeEl('div'), 'range-container'), icons.map(icon => addEl(makeEl('div'), icon)));
        initRange(itemNameCb(), rangeOnLoad(icons, max));
        const els = label != null ? [label, div] : [div];
        return addEls(addClass(makeEl('div'), 'stat-container'), els);
    });

    // eslint-disable-next-line no-var,vars-on-top
    var makeRangeEl3 = R.curry((setter, min, max, labelMaker, initRange, itemName) => {
        const label = labelMaker(itemName);
        const itemNameCb = R.always(itemName);
        const icons = [];
        for (let i = 0; i < max; i++) {
            const icon = makeEl('img');
            icon.number = i;
            listen(icon, 'click', rangeOnClick(setter, icons, min, max, itemNameCb));
            icons.push(icon);
        }

        const icons2Container = icons2 =>
            addEls(addClass(makeEl('div'), 'range-container'), icons2.map(icon => addEl(makeEl('div'), icon)));

        const divs = R.splitEvery(10, icons).map(icons2Container);
        initRange(itemNameCb(), rangeOnLoad(icons, max));
        const els = label != null ? R.prepend(label, divs) : divs;
        return els.map(el => addEl(addClass(makeEl('div'), 'stat-container'), el));
    });

    function makeInputBuilder(container, makeInput) {
        return (event) => {
            //            if (!event.ctrlKey && !event.metaKey) { return; }
            addEl(queryEl(`${container} .entity-container`), makeInput(null));
        };
    }

    function onInputChange(renameFunc, type, isPart) {
        return (event) => {
            const { oldName } = event.target;
            const newName = event.target.value;
            if (newName.trim() === '') {
                addClass(isPart ? event.target.parentNode : event.target, 'hidden');
            } else {
                event.target.oldName = newName.trim();
            }
            DBMS[renameFunc](type, oldName, newName, Utils.processError());
        };
    }

    // eslint-disable-next-line no-var,vars-on-top
    var makeEntityRenameInput = R.curry((renameFunc, type, isPart, oldName) => {
        oldName = oldName || '';
        const input = makeEl('input');
        input.oldName = oldName;
        input.value = oldName;
        listen(input, 'change', onInputChange(renameFunc, type, isPart));
        return input;
    });
    // eslint-disable-next-line no-var,vars-on-top
    var makeAdvantageInput = R.curry((renameFunc, type, setter, pair) => {
        pair = pair || ['', 0];

        const labelMaker = makeEntityRenameInput(renameFunc, type, true);
        function initRange(str, rangeOnLoad2) {
            rangeOnLoad2(pair[1]);
        }
        const itemName = pair[0];
        const label = labelMaker(itemName);
        return makeRangeEl2(setter, 0, Constants.maxPoints, label, initRange, () => label.value);
    });

    function onRefreshHook(getter, itemName, callback) {
        return () => {
            DBMS[getter](itemName, (err, value) => {
                if (err) { Utils.handleError(err); return; }
                callback(value);
            });
        };
    }

    function fillText(el, str) {
        const l10nKey = `charsheet-${str}`;
        setAttr(el, 'l10n-id', l10nKey);
        return addEl(el, makeText(getL10n(l10nKey)));
    }
    // eslint-disable-next-line no-var,vars-on-top
    var backstoryCb = (container, inputMaker) =>
        arr => addEls(clearEl(queryEl(`${container} .entity-container`)), arr.map(inputMaker));
})(this.Charsheet = {});
