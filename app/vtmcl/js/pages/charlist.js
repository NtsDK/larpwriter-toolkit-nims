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
    var state = {};

//    exports.init = function() {
//        exports.content = queryEl(root);
//    };
//
//    exports.refresh = function() {
//
//    };

    // var profileCols = [ [ 'name', 'player', 'chronicle', 'age', 'sex' ],
    // [ 'nature', 'demeanor', 'concept', 'clan', 'generation', 'sire' ] ];
    var profileCols = [ [ 'name', 'age', 'sex' ], [ 'nature', 'demeanor', 'concept' ] ];

    var attributeCols = [ {
        name : 'physical',
        arr : [ 'strength', 'dexterity', 'stamina' ]
    }, {
        name : 'social',
        arr : [ 'charisma', 'manipulation', 'appearance' ]
    }, {
        name : 'mental',
        arr : [ 'perception', 'intelligence', 'wits' ]
    } ];

    var abilityCols = [
            {
                name : 'talents',
                arr : [ 'athletics', 'alertness', 'brawl', 'dodge', 'empathy', 'intimidation', 'leadership',
                        'streetwise', 'expression', 'subterfuge' ]
            },
            {
                name : 'skills',
                arr : [ 'animalken', 'drive', 'etiquette', 'firearms', 'melee', 'survival', 'crafts', 'stealth',
                        'security', 'performance', ]
            },
            {
                name : 'knowledges',
                arr : [ 'science', 'politics', 'occult', 'medicine', 'linguistics', 'law', 'investigation', 'finance',
                        'computer', 'academics', ]
            } ];

    var healthCols = [ {
        name : 'health',
        arr : [ {
            name : 'bruised',
            penalty : ''
        }, {
            name : 'hurt',
            penalty : '-1'
        }, {
            name : 'injured',
            penalty : '-1'
        }, {
            name : 'wounded',
            penalty : '-2'
        }, {
            name : 'mauled',
            penalty : '-2'
        }, {
            name : 'crippled',
            penalty : '-5'
        }, {
            name : 'incapacitated',
            penalty : ''
        }, ]
    } ];

    var virtues = [ "conscience", "self_control", "courage" ];

    var disciplines = [ 'animalism', 'bardo', 'valeren', 'visceratika', 'obtenebration', 'daimoinon', 'dominate',
            'obfuscate', 'vicissitude', 'kineticism', 'melpominee', 'mytherceria', 'potence', 'nihilistics', 'obeah',
            'gargoyle flight', 'dementation', 'protean', 'presence', 'auspex', 'sanguinus', 'serpentis', 'quietus',
            'mortis', 'fortitude', 'celerity', 'thanatosis', 'temporis', 'chimerstry', 'spiritus' ];

    var refreshHooks = [];

    exports.init = function() {

        fillProfile();
        fillStats('.attributes-container', attributeCols, makeRangeEl2('setAttribute', 0, 5, makeStaticLabel,
                makeRangeLoadHook(refreshHooks, 'getAttribute')));
        fillStats('.abilities-container', abilityCols, makeRangeEl2('setAbility', 0, 5, makeStaticLabel,
                makeRangeLoadHook(refreshHooks, 'getAbility')));
        fillVirtues('.virtues-container', virtues, makeRangeEl2('setVirtue', 1, 5, makeStaticLabel, makeRangeLoadHook(
                refreshHooks, 'getVirtue')));

        addEl(queryEl('.humanity-container'), makeRangeEl2('setState', 0, 10, nuller, makeRangeLoadHook(refreshHooks,
                'getState'), 'humanity'));
        addEl(queryEl('.willpower-container'), makeRangeEl2('setState', 0, 10, nuller, makeRangeLoadHook(refreshHooks,
                'getState'), 'willpower'));

        listen(queryEl('.merits-container .add-button'), "click", makeInputBuilder('.merits-container',
                makeEntityRenameInput('setBackstory', 'merits', false)));
        refreshHooks.push(makeBackstoryHook('.merits-container', 'getBackstory', 'merits', makeEntityRenameInput(
                'setBackstory', 'merits', false)));
        listen(queryEl('.flaws-container .add-button'), "click", makeInputBuilder('.flaws-container',
                makeEntityRenameInput('setBackstory', 'flaws', false)));
        refreshHooks.push(makeBackstoryHook('.flaws-container', 'getBackstory', 'flaws', makeEntityRenameInput(
                'setBackstory', 'flaws', false)));

        listen(queryEl('.backgrounds-container .add-button'), "click", makeInputBuilder('.backgrounds-container',
                makeAdvantageInput('renameAdvantage', 'backgrounds', 'setBackground')));
        refreshHooks.push(makeBackstoryHook('.backgrounds-container', 'getAdvantages', 'backgrounds',
                makeAdvantageInput('renameAdvantage', 'backgrounds', 'setBackground')));
        listen(queryEl('.disciplines-container .add-button'), "click", makeInputBuilder('.disciplines-container',
                makeAdvantageInput('renameAdvantage', 'disciplines', 'setDiscipline')));
        refreshHooks.push(makeBackstoryHook('.disciplines-container', 'getAdvantages', 'disciplines',
                makeAdvantageInput('renameAdvantage', 'disciplines', 'setDiscipline')));
        // listen(queryEl('.traits-container .add-button'), "click",
        // makeInputBuilder('.traits-container',
        // makeAdvantageInput('renameAdvantage', 'traits', 'setTrait')));
        // refreshHooks.push(makeBackstoryHook('.traits-container',
        // 'getAdvantages', 'traits',makeAdvantageInput('renameAdvantage',
        // 'traits', 'setTrait')));

        fillStats('.health-container', healthCols, makeHealthRow);
        // initDynamics('.disciplines-container', 'addDiscipline',
        // 'removeDiscipline', 'getDisciplineList', disciplines,
        // makeRangeEl('setDiscipline', 'getDiscipline', 1, 5));
        // DBMS.getDisciplineList(function(err, disciplineList){
        // if(err) {Utils.handleError(err); return;}
        // fillDynamics('.disciplines-container', disciplineList, disciplines,
        // makeRangeEl('setDiscipline', 'getDiscipline', 1, 5));
        // });
        // MainPage.container = container;
        exports.content = queryEl(root);
    };

    // var fillDynamics = function(selector, usedList, fullList, func){
    // //addEls(queryEl(selector), data.map(function(obj){
    // //return addEls(makeEl('div'), makeRangeEls(obj, func));
    // //}));
    // };

    var initDynamics = function(selector, adder, remover, listGetter, fullList, func) {
        var localHooks = [];
        var addEntitySel = queryEl(selector + ' .add-entity-select');
        listen(queryEl(selector + ' .add-entity-button'), 'click', function() {
            if (addEntitySel.value !== '') {
                DBMS[adder](addEntitySel.value, Utils.processError(exports.refresh));
            }
        });
        var removeEntitySel = queryEl(selector + ' .remove-entity-select');
        listen(queryEl(selector + ' .remove-entity-button'), 'click', function() {
            if (removeEntitySel.value !== '') {
                DBMS[remover](removeEntitySel.value, Utils.processError(exports.refresh));
            }
        });
        refreshHooks.push(function() {
            DBMS[listGetter](function(err, usedList) {
                if (err) {
                    Utils.handleError(err);
                    return;
                }

                localHooks = [];

                var addList = R.difference(fullList, usedList);

                clearEl(queryEl(selector + " .add-entity-select"));
                $(selector + " .add-entity-select").select2(arr2Select2(addList));

                clearEl(queryEl(selector + " .remove-entity-select"));
                $(selector + " .remove-entity-select").select2(arr2Select2(usedList));

                addEls(clearEl(queryEl(selector + ' .entity-container')), usedList.map(func(localHooks)));

                localHooks.forEach(R.apply(R.__, []));

                // clearEl(queryEl(".investigation-board-tab
                // .group-switch-select"));
                // $(".investigation-board-tab
                // .group-switch-select").select2(arr2Select2(freeGroupNames));
            });
        });
    };

    // fill profile
    var fillProfile = function() {
        addEls(queryEl('.profile-container'), profileCols.map(function(arr) {
            return addEls(makeEl('div'), arr.map(makeProfileEl));
        }));
    };

    var makeProfileEl = function(str) {
        var input = makeEl('input');
        refreshHooks.push(makeCommonHook('getProfileItem', input, str));
        listen(input, 'change', function(event) {
            DBMS.setProfileItem(str, event.target.value.trim(), Utils.processError());
        });
        return addEls(makeEl('div'), [ fillText(makeEl('span'), str), input ]);
    };

    var fillVirtues = function(selector, data, func) {
        addEls(queryEl(selector), data.map(func));
    };

    var fillStats = function(selector, data, func) {
        addEls(queryEl(selector), data.map(function(obj) {
            // return addEls(makeEl('div'), makeRangeEls(obj, func));
            return addEls(makeEl('div'), obj.arr.map(func));
        }));
    };

    // var makeRangeEls = function(obj, func){
    // //return R.flatten([fillText(makeEl('div'), obj.name),
    // obj.arr.map(func)]);
    // return R.flatten( [obj.arr.map(func)]);
    // };

    // utils
    // var makeRangeEl = R.curry(function(setter, getter, min, max, hooks, str){
    // var input = makeEl('input');
    // setAttr(input, 'type', 'range');
    // setAttr(input, 'min', min);
    // setAttr(input, 'value', min);
    // setAttr(input, 'max', max);
    // hooks.push(makeCommonHook(getter,input, str));
    // listen(input, 'change', function(event){
    // DBMS[setter](str, Number(event.target.value), Utils.processError());
    // });
    // return addEls(makeEl('div'), [fillText(makeEl('span'), str), input]);
    // });
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

        refreshHooks.push(function() {
            DBMS['getHealth'](val.name, function(err, num) {
                if (err) {
                    Utils.handleError(err);
                    return;
                }
                icon.num = num;
                setImg(num);
            });
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

    var rangeOnClick = function(setter, icons, min, max, str) {
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
            DBMS[setter](str, Number(selected + 1), Utils.processError());
        };
    };

    var rangeOnLoad = function(icons, max) {
        return function(num) {
            for (var i = 0; i < max; i++) {
                setAttr(icons[i], 'src', num > i ? 'images/radio-on-button.svg' : 'images/circumference.svg');
            }
        };
    };

    var makeRangeLoadHook = R.curry(function(hooks, getter, str, rangeOnLoad) {
        hooks.push(makeCommonHook2(getter, str, rangeOnLoad));
    });

    var makeRangeEl2 = R.curry(function(setter, min, max, labelMaker, initRange, str) {
        var icons = [];
        for (var i = 0; i < max; i++) {
            var icon = makeEl('img');
            icon.number = i;
            listen(icon, 'click', rangeOnClick(setter, icons, min, max, str));
            icons.push(icon);
        }
        var div = addEls(addClass(makeEl('div'), 'range-container'), icons.map(function(icon) {
            return addEl(makeEl('div'), icon);
        }));
        initRange(str, rangeOnLoad(icons, max));
        // hooks.push(makeCommonHook2(getter, str, rangeOnLoad(icons, max)));
        var label = labelMaker(str);
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

        return makeRangeEl2(setter, 0, 5, makeEntityRenameInput(renameFunc, type, true), function(str, rangeOnLoad) {
            rangeOnLoad(pair[1]);
        }, pair[0]);
    });

    var makeCommonHook = function(funcName, input, str) {
        return function() {
            DBMS[funcName](str, function(err, value) {
                if (err) {
                    Utils.handleError(err);
                    return;
                }
                input.value = value;
            });
        };
    };

    var makeCommonHook2 = function(funcName, str, rangeOnLoad) {
        return function() {
            DBMS[funcName](str, function(err, num) {
                if (err) {
                    Utils.handleError(err);
                    return;
                }
                rangeOnLoad(num);
            });
        };
    };

    var makeBackstoryHook = function(container, getter, type, inputMaker) {
        return function() {
            DBMS[getter](type, function(err, arr) {
                if (err) {
                    Utils.handleError(err);
                    return;
                }
                var el = clearEl(queryEl(container + ' .entity-container'))
                addEls(el, arr.map(inputMaker));
            });
        }
    };

    var fillText = function(el, str) {
        var l10nKey = 'main-' + str;
        setAttr(el, 'l10n-id', l10nKey);
        return addEl(el, makeText(getL10n(l10nKey)));
    };

    exports.refresh = function() {
        refreshHooks.forEach(R.apply(R.__, []));
        // Utils.alert('Refresh');
    };

})(this.Charlist = {});