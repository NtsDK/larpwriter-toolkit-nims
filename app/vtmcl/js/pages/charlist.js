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

/*global
 Utils, DBMS
 */

"use strict";

(function(exports) {

    var root = '.charlist-tab ';
    var state = {
        refreshHooks: []
    };
    
    const maxPoints = 5;
    const extrasMaxPoints = 10;

    exports.init = function() {
        
        const profileEls = Constants.profileCols.map(R.map(makeProfileEl)).map(els => addEls(makeEl('div'), els));
        addEls(queryEl(root + '.profile-container'), profileEls);

        const attrRange = makeRangeEl('setAttribute', 0, maxPoints, makeStaticLabel, addRefreshHook('getAttribute'));
        fillStats('.attributes-container', Constants.attributeCols, attrRange);
        
        const abilRange = makeRangeEl('setAbility', 0, maxPoints, makeStaticLabel, addRefreshHook('getAbility'));
        fillStats('.abilities-container', Constants.abilityCols, abilRange);
        
        const virtueRange = makeRangeEl('setVirtue', 1, maxPoints, makeStaticLabel, addRefreshHook('getVirtue'));
        fillVirtues('.virtues-container', Constants.virtues, virtueRange);

        const someState = makeRangeEl('setState', 0, extrasMaxPoints, nuller, addRefreshHook('getState'));
        addEl(queryEl('.humanity-container'), someState('humanity'));
        addEl(queryEl('.willpower-container'), someState('willpower'));

        const meritInput = makeEntityRenameInput('setBackstory', 'merits', false);
        listen(queryEl('.merits-container .add-button'), "click", makeInputBuilder('.merits-container', meritInput));
        addRefreshHook('getBackstory', 'merits', backstoryCb('.merits-container', meritInput));
        
        const flawInput = makeEntityRenameInput('setBackstory', 'flaws', false);
        listen(queryEl('.flaws-container .add-button'), "click", makeInputBuilder('.flaws-container', flawInput));
        addRefreshHook('getBackstory', 'flaws', backstoryCb('.flaws-container', flawInput));

        const backgroundInput = makeAdvantageInput('renameAdvantage', 'backgrounds', 'setBackground');
        listen(queryEl('.backgrounds-container .add-button'), "click", makeInputBuilder('.backgrounds-container', backgroundInput));
        addRefreshHook('getAdvantages', 'backgrounds', backstoryCb('.backgrounds-container', backgroundInput));
        
        const disciplineInput = makeAdvantageInput('renameAdvantage', 'disciplines', 'setDiscipline');
        listen(queryEl('.disciplines-container .add-button'), "click", makeInputBuilder('.disciplines-container', disciplineInput));
        addRefreshHook('getAdvantages', 'disciplines', backstoryCb('.disciplines-container', disciplineInput));

        fillStats('.health-container', Constants.healthCols, makeHealthRow);
        exports.content = queryEl(root);
    };
    
    var makeProfileEl = function(itemName) {
        var input = makeEl('input');
        addRefreshHook('getProfileItem', itemName, value => input.value = value);
        listen(input, 'change', event => DBMS.setProfileItem(itemName, event.target.value.trim(), Utils.processError()));
        return addEls(makeEl('div'), [ fillText(makeEl('span'), itemName), input ]);
    };

    var fillVirtues = (selector, data, func) => addEls(queryEl(selector), data.map(func));

    var fillStats = function(selector, data, func) {
        addEls(queryEl(selector), data.map(function(obj) {
            // return addEls(makeEl('div'), makeRangeEls(obj, func));
            return addEls(makeEl('div'), obj.arr.map(func));
        }));
    };

    var makeHealthRow = function(val) {
        var icon = makeEl('img');
        icon.str = val.name;
        setAttr(icon, 'src', 'images/injure_deadly.svg');
        var setImg = function(num) {
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
        };
        
        addRefreshHook('getHealth', val.name, (num) => {
            icon.num = num;
            setImg(num);
        });

        listen(icon, 'click', function(event) {
            if (!event.ctrlKey && !event.metaKey)
                return;
            event.target.num = (event.target.num + 1) % 3;
            setImg(event.target.num);
            DBMS['setHealth'](event.target.str, event.target.num, Utils.processError());
        });
        return addEls(addClass(makeEl('div'), 'health-stat'), [ makeStaticLabel(val.name), icon,
                addEl(makeEl('span'), makeText(val.penalty)) ]);
    };

    var makeStaticLabel = function(label) {
        return fillText(makeEl('span'), label);
    };
    var nuller = function() {
        return null;
    }

    var rangeOnClick = function(setter, icons, min, max, itemNameCb) {
        return function(event) {
            if (!event.ctrlKey && !event.metaKey)
                return;
            var target = event.target;
            var isPointOn = getAttr(target, 'src') === 'images/radio-on-button.svg';
            var selected = isPointOn ? target.number - 1 : target.number;
            selected = selected < min ? min - 1 : selected;
            for (var j = 0; j < max; j++) {
                setAttr(icons[j], 'src', selected >= j ? 'images/radio-on-button.svg' : 'images/circumference.svg');
            }
            DBMS[setter](itemNameCb(), Number(selected + 1), Utils.processError());
        };
    };

    var rangeOnLoad = function(icons, max) {
        return function(num) {
            for (var i = 0; i < max; i++) {
                setAttr(icons[i], 'src', num > i ? 'images/radio-on-button.svg' : 'images/circumference.svg');
            }
        };
    };

    var makeRangeEl = R.curry(function(setter, min, max, labelMaker, initRange, itemName) {
        var label = labelMaker(itemName);
        return makeRangeEl2(setter, min, max, label, initRange, R.always(itemName));
    });
    
    var makeRangeEl2 = R.curry(function(setter, min, max, label, initRange, itemNameCb) {
        var icons = [];
        for (var i = 0; i < max; i++) {
            var icon = makeEl('img');
            icon.number = i;
            listen(icon, 'click', rangeOnClick(setter, icons, min, max, itemNameCb));
            icons.push(icon);
        }
        var div = addEls(addClass(makeEl('div'), 'range-container'), icons.map(function(icon) {
            return addEl(makeEl('div'), icon);
        }));
        initRange(itemNameCb(), rangeOnLoad(icons, max));
        var els = label != null ? [ label, div ] : [ div ];
        return addEls(addClass(makeEl('div'), 'stat-container'), els);
    });

    var makeInputBuilder = function(container, makeInput) {
        return function(event) {
            if (!event.ctrlKey && !event.metaKey)
                return;
            addEl(queryEl(container + ' .entity-container'), makeInput(null));
        }
    };

    var onInputChange = function(renameFunc, type, isPart) {
        return function(event) {
            var oldName = event.target.oldName;
            var newName = event.target.value;
            if (newName.trim() === '') {
                addClass(isPart ? event.target.parentNode : event.target, 'hidden');
            } else {
                event.target.oldName = newName.trim();
            }
            DBMS[renameFunc](type, oldName, newName, Utils.processError());
        };
    }

    var makeEntityRenameInput = R.curry(function(renameFunc, type, isPart, oldName) {
        oldName = oldName || '';
        var input = makeEl('input');
        input.oldName = oldName;
        input.value = oldName;
        listen(input, 'change', onInputChange(renameFunc, type, isPart));
        return input;
    });
    var makeAdvantageInput = R.curry(function(renameFunc, type, setter, pair) {
        pair = pair || [ '', 0 ];
        
        const labelMaker = makeEntityRenameInput(renameFunc, type, true);
        const initRange = function(str, rangeOnLoad) {
            rangeOnLoad(pair[1]);
        };
        const itemName = pair[0];
        var label = labelMaker(itemName);
        return makeRangeEl2(setter, 0, maxPoints, label, initRange, () => label.value);
    });

    var onRefreshHook = function(getter, itemName, callback) {
        return function() {
            DBMS[getter](itemName, function(err, value) {
                if (err) { Utils.handleError(err); return; }
                callback(value);
            });
        };
    };
    
    var addRefreshHook = R.curry((getter, itemName, rangeOnLoad) => onRefresh(onRefreshHook(getter, itemName, rangeOnLoad)));
    
    var backstoryCb = (container, inputMaker) => (arr) => addEls(clearEl(queryEl(container + ' .entity-container')), arr.map(inputMaker));

    var fillText = function(el, str) {
        var l10nKey = 'main-' + str;
        setAttr(el, 'l10n-id', l10nKey);
        return addEl(el, makeText(getL10n(l10nKey)));
    };
    
    var onRefresh = callback => state.refreshHooks.push(callback);

    exports.refresh = function() {
        state.refreshHooks.forEach(R.apply(R.__, []));
        // Utils.alert('Refresh');
    };

})(this.Charlist = {});