/*Copyright 2015, 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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


'use strict';

((exports) => {
    const root = '.adaptations-tab ';

    exports.init = () => {
        listen(getEl('events-storySelector'), 'change', updateAdaptationSelectorDelegate);
        listen(getEl('events-characterSelector'), 'change', showPersonalStoriesByCharacters);
        listen(getEl('events-eventSelector'), 'change', showPersonalStoriesByEvents);
        listen(getEl('finishedStoryCheckbox'), 'change', exports.refresh);
        queryEls('.adaptations-tab input[name=adaptationFilter]').map(listen(R.__, 'change', updateFilter));
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        const selector = clearEl(getEl('events-storySelector'));
        clearEl(getEl('events-characterSelector'));
        clearEl(getEl('events-eventSelector'));
        clearEl(getEl('personalStories'));

        PermissionInformer.getEntityNamesArray('story', false, (err, allStoryNames) => {
            if (err) { Utils.handleError(err); return; }
            DBMS.getFilteredStoryNames(getEl('finishedStoryCheckbox').checked, (err2, storyNames) => {
                if (err2) { Utils.handleError(err2); return; }
                if (storyNames.length <= 0) { return; }

                const selectedStoryName = getSelectedStoryName(storyNames);

                const map = R.indexBy(R.prop('value'), allStoryNames);

                storyNames.forEach((elem) => {
                    elem.displayName = map[elem.storyName].displayName;
                    elem.value = map[elem.storyName].value;
                });

                storyNames.sort(Utils.charOrdAObject);

                let option;
                storyNames.forEach((storyName) => {
                    option = addEl(makeEl('option'), (makeText(storyName.displayName)));
                    addClass(option, getIconClass(storyName));
                    setProp(option, 'selected', storyName.value === selectedStoryName);
                    setProp(option, 'storyInfo', storyName.value);
                    addEl(selector, option);
                });
                setAttr(selector, 'size', Math.min(storyNames.length, 10));
                showPersonalStories(selectedStoryName);
            });
        });
    };

    function updateAdaptationSelectorDelegate(event) {
        clearEl(getEl('personalStories'));
        const storyName = event.target.selectedOptions[0].storyInfo;
        updateSettings('storyName', storyName);
        updateSettings('characterNames', null);
        updateSettings('eventIndexes', null);
        showPersonalStories(storyName);
    }

    function updateAdaptationSelector(story, allCharacters) {
        const characterSelector = clearEl(getEl('events-characterSelector'));
        const eventSelector = clearEl(getEl('events-eventSelector'));

        let characterArray = getStoryCharacterCompleteness(story);
        let eventArray = getStoryEventCompleteness(story);

        const showOnlyUnfinishedStories = getEl('finishedStoryCheckbox').checked;
        if (showOnlyUnfinishedStories) {
            characterArray = characterArray.filter(elem => !elem.isFinished || elem.isEmpty);
            eventArray = eventArray.filter(elem => !elem.isFinished || elem.isEmpty);
        }

        const characterNames = getCharacterNames(characterArray);
        const eventIndexes = getEventIndexes(eventArray);

        const map = CommonUtils.arr2map(allCharacters, 'value');

        characterArray.forEach((elem) => {
            elem.displayName = map[elem.characterName].displayName;
            elem.value = map[elem.characterName].value;
        });

        characterArray.sort(Utils.charOrdAObject);

        let option;
        characterArray.forEach((elem) => {
            option = addEl(makeEl('option'), (makeText(elem.displayName)));
            addClass(option, getIconClass(elem));
            setProp(option, 'selected', characterNames.indexOf(elem.value) !== -1);
            setProp(option, 'storyInfo', story.name);
            setProp(option, 'characterName', elem.value);
            addEl(characterSelector, option);
        });
        setAttr(characterSelector, 'size', characterArray.length);

        eventArray.forEach((elem) => {
            option = addEl(makeEl('option'), (makeText(elem.name)));
            addClass(option, getIconClass(elem));
            setProp(option, 'selected', eventIndexes.indexOf(elem.index) !== -1);
            setProp(option, 'storyInfo', story.name);
            setProp(option, 'eventIndex222', elem.index);
            addEl(eventSelector, option);
        });
        setAttr(eventSelector, 'size', eventArray.length);

        const { selectedFilter } = DBMS.getSettings().Adaptations;
        getEl(selectedFilter).checked = true;
        updateFilter({
            target: {
                id: selectedFilter
            }
        });
    }

    function updateFilter(event) {
        updateSettings('selectedFilter', event.target.id);
        const byCharacter = event.target.id === 'adaptationFilterByCharacter';
        setClassByCondition(getEl('events-characterSelectorDiv'), 'hidden', !byCharacter);
        setClassByCondition(getEl('events-eventSelectorDiv'), 'hidden', byCharacter);
        if (byCharacter) {
            showPersonalStoriesByCharacters();
        } else {
            showPersonalStoriesByEvents();
        }
    }

    function showPersonalStoriesByCharacters() {
        const eventRows = queryElEls(exports.content, '.eventRow-dependent');
        eventRows.map(removeClass(R.__, 'hidden'));
        nl2array(queryElEls(exports.content, 'div[dependent-on-character]')).map(addClass(R.__, 'hidden'));

        const characterNames = nl2array(getEl('events-characterSelector').selectedOptions).map(opt => opt.characterName);
        characterNames.forEach(name => queryElEls(exports.content, `div[dependent-on-character="${name}"]`).map(removeClass(R.__, 'hidden')));
        eventRows.map(row => setClassByCondition(row, 'hidden', R.intersection(row.dependsOnCharacters, characterNames).length === 0));

        updateSettings('characterNames', characterNames);
    }

    function showPersonalStoriesByEvents() {
        queryElEls(exports.content, 'div[dependent-on-character]').map(removeClass(R.__, 'hidden'));
        queryElEls(exports.content, '.eventRow-dependent').map(addClass(R.__, 'hidden'));

        const eventIndexes = nl2array(getEl('events-eventSelector').selectedOptions).map(opt => opt.eventIndex222);
        eventIndexes.forEach(index => removeClass(getEls(`${index}-dependent`)[0], 'hidden'));
        updateSettings('eventIndexes', eventIndexes);
    }

    function getStoryCharacterCompleteness(story) {
        return R.keys(story.characters).map(elem => ({
            characterName: elem,
            isFinished: _isStoryFinishedForCharacter(story, elem),
            isEmpty: _isStoryEmptyForCharacter(story, elem)
        }));
    }

    function _isStoryEmptyForCharacter(story, characterName) {
        return story.events.every(event => event.characters[characterName] === undefined);
    }

    function _isStoryFinishedForCharacter(story, characterName) {
        return story.events.filter(event => event.characters[characterName] !== undefined)
            .every(event => event.characters[characterName].ready === true);
    }

    function getStoryEventCompleteness(story) {
        return story.events.map((event, i) => ({
            name: event.name,
            index: i,
            isFinished: _isEventReady(event),
            isEmpty: Object.keys(event.characters).length === 0
        }));
    }

    function _isEventReady(event) {
        return R.values(event.characters).every(character => character.ready);
    }

    function showPersonalStories(storyName) {
        DBMS.getMetaInfo((err, metaInfo) => {
            if (err) { Utils.handleError(err); return; }
            DBMS.getStory(storyName, (err2, story) => {
                if (err2) { Utils.handleError(err2); return; }
                PermissionInformer.isEntityEditable('story', storyName, (err3, isStoryEditable) => {
                    if (err3) { Utils.handleError(err3); return; }
                    PermissionInformer.getEntityNamesArray('character', false, (err4, allCharacters) => {
                        if (err4) { Utils.handleError(err4); return; }

                        const characterNames = R.keys(story.characters);
                        const adaptations = characterNames.map(characterName => ({
                            characterName,
                            storyName
                        }));
                        PermissionInformer.areAdaptationsEditable(adaptations, (err5, areAdaptationsEditable) => {
                            if (err5) { Utils.handleError(err5); return; }
                            story.events.forEach((item, i) => (item.index = i));
                            buildAdaptationInterface(
                                storyName, characterNames, story.events, areAdaptationsEditable,
                                metaInfo
                            );
                            updateAdaptationSelector(story, allCharacters);
                            Utils.enable(exports.content, 'isStoryEditable', isStoryEditable);
                            Utils.enable(exports.content, 'notEditable', false);
                        });
                    });
                });
            });
        });
    }

    function buildAdaptationInterface(storyName, characterNames, events, areAdaptationsEditable, metaInfo) {
        addEls(clearEl(getEl('personalStories')), events.map((event) => {
            const row = qmte(`${root} .adaptation-row-tmpl`);
            addClass(row, `${event.index}-dependent`);
            row.dependsOnCharacters = R.keys(event.characters);
            addEl(qee(row, '.eventMainPanelRow-left'), exports.makeOriginCard(event, metaInfo, storyName, {

                showTimeInput: true,
                showTextInput: true,
                cardTitle: event.name
            }));
            addEls(qee(row, '.events-eventsContainer'), characterNames
                .filter(characterName => event.characters[characterName])
                .map((characterName) => {
                    const isEditable = areAdaptationsEditable[`${storyName}-${characterName}`];
                    return exports.makeAdaptationCard(isEditable, event, storyName, characterName, {
                        showFinishedButton: true,
                        showTimeInput: true,
                        showTextInput: true,
                        cardTitle: characterName
                    });
                }));

            return row;
        }));
    }

    exports.makeOriginCard = (event, metaInfo, storyName, opts) => {
        const card = qmte(`${root} .origin-tmpl`);
        addEl(qee(card, '.card-title'), makeText(opts.cardTitle));
        const textInput = qee(card, '.text-input');
        const timeInput = qee(card, '.time-input');
        const lockButton = qee(card, 'button.locked');

        if (opts.showTimeInput === true) {
            UI.makeEventTimePicker2(timeInput, {
                eventTime: event.time,
                index: event.index,
                preGameDate: metaInfo.preGameDate,
                date: metaInfo.date,
                onChangeDateTimeCreator: onChangeDateTimeCreator(storyName)
            });
        } else {
            addClass(timeInput, 'hidden');
        }

        if (opts.showTextInput === true) {
            textInput.value = event.text;
            textInput.dataKey = JSON.stringify([storyName, event.index]);
            listen(textInput, 'change', onChangeOriginText);
        } else {
            addClass(textInput, 'hidden');
        }

        if (opts.showLockButton === true) {
            listen(lockButton, 'click', onOriginLockClick(timeInput, textInput));
            Utils.enableEl(timeInput, false);
            Utils.enableEl(textInput, false);
            L10n.localizeStatic(card);
        } else {
            addClass(lockButton, 'hidden');
        }

        return card;
    };

    function onOriginLockClick(timeInput, textInput) {
        return (event) => {
            const { target } = event;
            const isLocked = hasClass(target, 'btn-primary');
            setClassByCondition(target, 'btn-primary', !isLocked);
            setClassByCondition(target, 'locked', !isLocked);
            setClassByCondition(target, 'unlocked', isLocked);
            Utils.enableEl(timeInput, isLocked);
            Utils.enableEl(textInput, isLocked);
        };
    }

    exports.makeAdaptationCard = R.curry((isEditable, event, storyName, characterName, opts) => {
        const card = qmte(`${root} .adaptation-tmpl`);
        setAttr(card, 'dependent-on-character', characterName);

        addEl(qee(card, '.card-title'), makeText(opts.cardTitle));
        const textInput = qee(card, '.text-input');
        const timeInput = qee(card, '.time-input');
        const finishedButton = qee(card, 'button.finished');
        const id = JSON.stringify([storyName, event.index, characterName]);

        if (opts.showTimeInput === true) {
            UI.populateAdaptationTimeInput(timeInput, storyName, event, characterName, isEditable);
        } else {
            addClass(timeInput, 'hidden');
        }

        if (opts.showTextInput === true) {
            setClassByCondition(textInput, 'notEditable', !isEditable);
            textInput.value = event.characters[characterName].text;
            textInput.dataKey = JSON.stringify([storyName, event.index, characterName]);
            listen(textInput, 'change', onChangeAdaptationText);
        } else {
            addClass(textInput, 'hidden');
        }

        if (opts.showFinishedButton === true) {
            const isFinished = event.characters[characterName].ready;
            setClassIf(finishedButton, 'btn-primary', isFinished);
            finishedButton.id = id;
            const enableInputs = (value) => {
                Utils.enableEl(textInput, !value);
                Utils.enableEl(timeInput, !value);
            };
            enableInputs(isFinished);
            listen(finishedButton, 'click', UI.onChangeAdaptationReadyStatus2(enableInputs));
            L10n.localizeStatic(card);
        } else {
            addClass(finishedButton, 'hidden');
        }

        return card;
    });

    // eslint-disable-next-line no-var,vars-on-top
    var onChangeDateTimeCreator = R.curry((storyName, myInput) => (dp, input) => {
        DBMS.setEventOriginProperty(storyName, myInput.eventIndex, 'time', input.val(), Utils.processError());
        removeClass(myInput, 'defaultDate');
    });

    function onChangeOriginText(event) {
        const dataKey = JSON.parse(event.target.dataKey);
        const text = event.target.value;
        DBMS.setEventOriginProperty(dataKey[0], dataKey[1], 'text', text, Utils.processError());
    }

    function onChangeAdaptationText(event) {
        const dataKey = JSON.parse(event.target.dataKey);
        const text = event.target.value;
        DBMS.setEventAdaptationProperty(dataKey[0], dataKey[1], dataKey[2], 'text', text, Utils.processError());
    }

    function getIconClass(object) {
        if (object.isEmpty) return 'fa-icon empty select-icon-padding';
        if (object.isFinished) return 'fa-icon finished select-icon-padding';
        return 'fa-icon finished transparent-icon select-icon-padding';
    }

    function updateSettings(name, value) {
        const settings = DBMS.getSettings();
        settings.Adaptations[name] = value;
    }

    function getSelectedStoryName(storyNames) {
        const storyNamesOnly = storyNames.map(R.prop('storyName'));

        const settings = DBMS.getSettings();
        if (!settings.Adaptations) {
            settings.Adaptations = {
                storyName: storyNamesOnly[0],
                characterNames: null,
                eventIndexes: null,
                selectedFilter: 'adaptationFilterByCharacter'
            };
        }
        let { storyName } = settings.Adaptations;
        if (storyNamesOnly.indexOf(storyName) === -1) {
            // eslint-disable-next-line prefer-destructuring
            settings.Adaptations.storyName = storyNamesOnly[0];
            // eslint-disable-next-line prefer-destructuring
            storyName = storyNamesOnly[0];
        }
        return storyName;
    }

    function getNames(nameObjectArray, nameObjectProperty, settingsProperty) {
        const namesOnly = nameObjectArray.map(R.prop(nameObjectProperty));
        const names = DBMS.getSettings().Adaptations[settingsProperty];
        let existingNames;
        if (names === null) {
            existingNames = namesOnly;
        } else {
            existingNames = names.filter(name => namesOnly.indexOf(name) !== -1);
        }

        updateSettings(settingsProperty, existingNames);
        return existingNames;
    }

    function getCharacterNames(characterArray) {
        return getNames(characterArray, 'characterName', 'characterNames');
    }

    function getEventIndexes(eventArray) {
        return getNames(eventArray, 'index', 'eventIndexes');
    }
})(this.Adaptations = {});
