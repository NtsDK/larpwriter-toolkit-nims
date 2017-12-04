/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

(function (exports) {
    const state = {};

    exports.init = function () {
        $('#briefingCharacter').select2().on('change', buildContentDelegate);

        let button = getEl('eventGroupingByStoryRadio');
        listen(button, 'change', exports.refresh);
        button.checked = true;

        button = getEl('adaptationsModeRadio');
        listen(button, 'change', exports.refresh);
        button.checked = true;

        listen(getEl('eventGroupingByTimeRadio'), 'change', exports.refresh);
        listen(getEl('proofreadingModeRadio'), 'change', exports.refresh);
        listen(getEl('hideAllPanelsCheckbox'), 'change', exports.refresh);
        listen(getEl('disableHeadersCheckbox'), 'change', exports.refresh);

        exports.content = getEl('briefingPreviewDiv');
    };

    exports.refresh = function () {
        clearEl(getEl('briefingCharacter'));
        clearEl(getEl('briefingContent'));

        DBMS.getProfileStructure('character', (err, characterProfileStructure) => {
            if (err) { Utils.handleError(err); return; }
            DBMS.getProfileStructure('player', (err, playerProfileStructure) => {
                if (err) { Utils.handleError(err); return; }
                state.characterProfileStructure = characterProfileStructure;
                state.playerProfileStructure = playerProfileStructure;
                PermissionInformer.getEntityNamesArray('character', false, (err, names) => {
                    if (err) { Utils.handleError(err); return; }
                    if (names.length > 0) {
                        const settings = DBMS.getSettings();
                        if (!settings.BriefingPreview) {
                            settings.BriefingPreview = {
                                characterName: names[0].value
                            };
                        }
                        let characterName = settings.BriefingPreview.characterName;
                        const rawNames = names.map(R.prop('value'));
                        if (rawNames.indexOf(characterName) === -1) {
                            settings.BriefingPreview.characterName = names[0].value;
                            characterName = names[0].value;
                        }

                        const data = getSelect2Data(names);
                        // this call trigger BriefingPreview.buildContent
                        $('#briefingCharacter').select2(data).val(characterName).trigger('change');
                    }
                });
            });
        });
    };

    var buildContentDelegate = function (event) {
        buildContent(event.target.value);
    };

    const updateSettings = function (characterName) {
        const settings = DBMS.getSettings();
        settings.BriefingPreview.characterName = characterName;
    };

    var buildContent = function (characterName) {
        updateSettings(characterName);
        const content = clearEl(getEl('briefingContent'));
        let index = 0;
        const data = {
            characterName
        };
        var buildContentInner = function () {
            if (index < panels.length) {
                index++;
                panels[index - 1].load(data, buildContentInner);
            } else {
                panels.map(R.prop('make')).forEach((make) => {
                    make(content, data);
                });
            }
        };
        buildContentInner();
    };

    const getFlags = function () {
        return {
            isAdaptationsMode: getEl('adaptationsModeRadio').checked,
            isGroupingByStory: getEl('eventGroupingByStoryRadio').checked,
            disableHeaders: getEl('disableHeadersCheckbox').checked,
            hideAllPanels: getEl('hideAllPanelsCheckbox').checked
        };
    };

    var panels = [{
        name: 'storyRights',
        load(data, callback) {
            PermissionInformer.getEntityNamesArray('story', true, (err, userStoryNames) => {
                if (err) { Utils.handleError(err); return; }
                data.userStoryNamesMap = R.indexBy(R.prop('value'), userStoryNames);
                callback();
            });
        },
        make(el, data) {}
    }, {
        name: 'characterProfile',
        load(data, callback) {
            DBMS.getProfile('character', data.characterName, (err, profile) => {
                if (err) { Utils.handleError(err); return; }
                data.profile = profile;
                callback();
            });
        },
        make(el, data) {
            const label = strFormat(getL10n('briefings-character-profile'), [data.characterName]);
            addEl(el, makePanel(makeText(label), UI.makeProfileTable(state.characterProfileStructure, data.profile), getFlags().hideAllPanels));
        }
    }, {
        name: 'playerProfile',
        load(data, callback) {
            DBMS.getProfileBinding('character', data.characterName, (err, binding) => {
                if (err) { Utils.handleError(err); return; }
                if (binding[1] === '') {
                    callback();
                } else {
                    DBMS.getProfile('player', binding[1], (err, playerProfile) => {
                        if (err) { Utils.handleError(err); return; }
                        data.playerProfile = playerProfile;
                        data.playerName = binding[1];
                        callback();
                    });
                }
            });
        },
        make(el, data) {
            if (data.playerProfile) {
                const label = strFormat(getL10n('briefings-player-profile'), [data.playerName]);
                addEl(el, makePanel(makeText(label), UI.makeProfileTable(state.playerProfileStructure, data.playerProfile), getFlags().hideAllPanels));
            }
        }
    }, {
        name: 'inventory',
        load(data, callback) {
            DBMS.getAllInventoryLists(data.characterName, (err, allInventoryLists) => {
                if (err) { Utils.handleError(err); return; }
                data.allInventoryLists = allInventoryLists.sort(CommonUtils.charOrdAFactory(R.compose(R.toLower, R.prop('storyName'))));
                callback();
            });
        },
        make(el, data) {
            addEl(el, makePanel(
                makeText(`${getL10n('briefings-inventory')} (${data.allInventoryLists.length})`),
                makeInventoryContent(data.allInventoryLists, data.characterName, data.userStoryNamesMap), getFlags().hideAllPanels
            ));
        }
    }, {
        name: 'groups',
        load(data, callback) {
            DBMS.getCharacterGroupTexts(data.characterName, (err, groupTexts) => {
                if (err) { Utils.handleError(err); return; }
                data.groupTexts = groupTexts;
                callback();
            });
        },
        make(el, data) {
            addEl(el, makePanel(
                makeText(`${getL10n('header-groups')} (${data.groupTexts.length})`),
                makeGroupContent(data.groupTexts), getFlags().hideAllPanels
            ));
        }
    }, {
        name: 'relations',
        load(data, callback) {
            DBMS.getAllProfiles('character', (err, profiles) => {
                if (err) { Utils.handleError(err); return; }
                DBMS.getRelationsSummary(data.characterName, (err, relationsSummary) => {
                    if (err) { Utils.handleError(err); return; }
                    DBMS.getExtendedProfileBindings((err, profileBindings) => {
                        if (err) { Utils.handleError(err); return; }
                        PermissionInformer.getEntityNamesArray('character', false, (err, characterNamesArray) => {
                            if (err) { Utils.handleError(err); return; }
                            data.relationsSummary = relationsSummary;
                            data.characterNamesArray = characterNamesArray;
                            data.profiles = profiles;
                            data.profileBindings = R.fromPairs(profileBindings);
                            callback();
                        });
                    });
                });
            });
        },
        make(el, data) {
            const label = `${getL10n('header-relations')} (${R.keys(data.relationsSummary.directRelations).length})`;
            const content = RelationsPreview.makeRelationsContent(data, getFlags(), state.characterProfileStructure);
            addEl(el, makePanel(makeText(label), content, getFlags().hideAllPanels));
        }
    }, {
        name: 'stories',
        load(data, callback) {
            callback();
        },
        make(el, data) {
            const flags = getFlags();
            if (flags.isGroupingByStory) {
                showEventsByStory(el, data.characterName, data.userStoryNamesMap, flags);
            } else {
                showEventsByTime(el, data.characterName, data.userStoryNamesMap, flags);
            }
        }
    }];

    const onBuildContentFinish = function () {
        refreshTextAreas();
        Utils.enable(exports.content, 'notEditable', false);
    };

    var refreshTextAreas = function () {
        R.ap([UI.resizeTextarea], nl2array(getEl('briefingContent').getElementsByTagName('textarea')).map(el => ({ target: el })));
    };

    var makePanel = function (title, content, hideAllPanels) {
        const panelInfo = UI.makePanelCore(title, content);
        setClassByCondition(panelInfo.contentDiv, 'hidden', hideAllPanels);
        const panelToggler = UI.togglePanel(panelInfo.contentDiv);
        listen(panelInfo.a, 'click', () => {
            panelToggler();
            refreshTextAreas();
        });

        return panelInfo.panel;
    };

    var makeGroupContent = function (groupTexts) {
        return addEls(makeEl('div'), groupTexts.map((groupText) => {
            const div = makeEl('div');
            addEl(div, addEl(makeEl('h4'), makeText(groupText.groupName)));
            const span = addEl(makeEl('textarea'), makeText(groupText.text));
            setAttr(span, 'disabled', 'disabled');
            addClass(span, 'briefingTextSpan');
            return addEl(div, span);
        }));
    };

    var makeInventoryContent = function (allInventoryLists, characterName, userStoryNamesMap) {
        let inventoryDiv;
        inventoryDiv = makeEl('tbody');

        allInventoryLists.forEach((elem) => {
            const input = makeEl('input');
            input.value = elem.inventory;
            input.storyName = elem.storyName;
            input.characterName = characterName;
            addClass(input, 'inventoryInput');
            if (!userStoryNamesMap[elem.storyName]) {
                addClass(input, 'notEditable');
            }
            input.addEventListener('change', updateCharacterInventory);

            addEl(inventoryDiv, UI.makeTableRow(makeText(elem.storyName), input));
        });
        return addEl(addClasses(makeEl('table'), ['table', 'table-striped']), inventoryDiv);
    };

    var showEventsByTime = function (content, characterName, userStoryNamesMap, flags) {
        DBMS.getCharacterEventsByTime(characterName, (err, allEvents) => {
            if (err) { Utils.handleError(err); return; }
            const adaptations = allEvents.map(event => ({
                characterName,
                storyName: event.storyName
            }));

            PermissionInformer.areAdaptationsEditable(adaptations, (err, areAdaptationsEditable) => {
                if (err) { Utils.handleError(err); return; }

                const opts = {
                    userStoryNamesMap,
                    areAdaptationsEditable,
                    showStoryName: true
                };

                const splitConstant = 5;

                addEls(content, R.splitEvery(splitConstant, allEvents).map((subPart, i) => {
                    const eventContent = addEls(makeEl('div'), subPart.map((event, j) => {
                        opts.index = i * splitConstant + 1 + j;
                        return showEvent(event, characterName, opts, flags);
                    }));

                    let name;
                    if (flags.disableHeaders) {
                        name = makeText(strFormat(getL10n('briefings-events-header'), [i * splitConstant + 1, i * splitConstant + subPart.length]));
                    } else {
                        name = addEls(makeEl('div'), subPart.map(event => getEventHeaderDiv(event, true)));
                    }
                    return makePanel(name, eventContent, flags.hideAllPanels);
                }));
                onBuildContentFinish();
            });
        });
    };

    const getStoryHeader = function (elem, i, disableHeaders) {
        let name;
        if (disableHeaders) {
            name = strFormat(getL10n('briefings-story-header'), [i + 1]);
        } else {
            name = elem.storyName;
        }
        return makeText(`${name} (${elem.events.length})`);
    };

    var showEventsByStory = function (content, characterName, userStoryNamesMap, flags) {
        DBMS.getCharacterEventGroupsByStory(characterName, (err, eventGroups) => {
            if (err) { Utils.handleError(err); return; }
            const adaptations = eventGroups.map(elem => ({
                characterName,
                storyName: elem.storyName
            }));
            PermissionInformer.areAdaptationsEditable(adaptations, (err, areAdaptationsEditable) => {
                if (err) { Utils.handleError(err); return; }
                const opts = {
                    userStoryNamesMap,
                    areAdaptationsEditable,
                    showStoryName: false
                };

                addEls(content, eventGroups.map((elem, i) => {
                    const storyContent = addEls(makeEl('div'), elem.events.map((event, j) => {
                        opts.index = j + 1;
                        return showEvent(event, characterName, opts, flags);
                    }));
                    return makePanel(getStoryHeader(elem, i, flags.disableHeaders), storyContent, flags.hideAllPanels);
                }));
                onBuildContentFinish();
            });
        });
    };

    var getEventHeaderDiv = function (event, showStoryName) {
        const eventName = addEl(makeEl('span'), makeText(strFormat('{0} {1}', [showStoryName ? `${event.storyName}:` : '', event.name])));
        const eventTime = addClass(addEl(makeEl('span'), makeText(event.time)), 'previewEventTime');
        return addEls(makeEl('div'), [eventTime, eventName]);
    };

    const getEventLabelText = function (event, showStoryName, index, disableHeaders) {
        if (disableHeaders) {
            return addEl(makeEl('h4'), makeText(strFormat(getL10n('briefings-event-header'), [index])));
        }
        return addEl(makeEl('h4'), getEventHeaderDiv(event, showStoryName));
    };

    var showEvent = function (event, characterName, opts, flags) {
        const eventDiv = makeEl('div');
        const isAdaptationsMode = flags.isAdaptationsMode;
        const originText = event.text;
        const adaptationText = event.characters[characterName].text;
        const isOriginEditable = !!opts.userStoryNamesMap[event.storyName];
        const isAdaptationEditable = opts.areAdaptationsEditable[`${event.storyName}-${characterName}`];
        const isAdaptationEmpty = adaptationText === '';
        const els = [];

        els.push(getEventLabelText(event, opts.showStoryName, opts.index, flags.disableHeaders));
        els.push(makeText(getL10n('briefings-subjective-time')));
        els.push(UI.makeAdaptationTimeInput(event.storyName, event, characterName, isAdaptationEditable));

        let input;
        if (isAdaptationsMode || isAdaptationEmpty) {
            // origin input
            input = makeEl('textarea');
            addClass(input, 'briefingPersonalStory');
            setClassByCondition(input, 'notEditable', !isOriginEditable);
            input.value = event.text;
            input.eventIndex = event.index;
            input.storyName = event.storyName;
            listen(input, 'change', onChangeOriginText);
            attachTextareaResizer(input);

            const unlockButton = makeUnlockEventSourceButton(input, isOriginEditable);
            const originHolder = makeEl('div');
            addEls(originHolder, [addEl(makeEl('h5'), makeText(getL10n('briefings-origin'))), unlockButton, input]);
            els.push(originHolder);
        }

        if (isAdaptationsMode || !isAdaptationEmpty) {
            // adaptation input
            input = makeEl('textarea');
            addClass(input, 'briefingPersonalStory');
            setClassByCondition(input, 'notEditable', !isAdaptationEditable);
            input.value = event.characters[characterName].text;
            input.characterName = characterName;
            input.eventIndex = event.index;
            input.storyName = event.storyName;
            listen(input, 'change', onChangeAdaptationText);
            attachTextareaResizer(input);

            const adaptationHolder = makeEl('div');
            addEls(adaptationHolder, [addEl(makeEl('h5'), makeText(getL10n('briefings-adaptation'))), input]);
            els.push(adaptationHolder);
        }

        if (isAdaptationsMode) {
            els.push(UI.makeAdaptationReadyInput(event.storyName, event, characterName, isAdaptationEditable));
        }
        els.push(makeEl('br'));

        addEls(eventDiv, els);
        return eventDiv;
    };

    var attachTextareaResizer = function (input) {
        listen(input, 'keydown', UI.resizeTextarea);
        listen(input, 'paste', UI.resizeTextarea);
        listen(input, 'cut', UI.resizeTextarea);
        listen(input, 'change', UI.resizeTextarea);
        listen(input, 'drop', UI.resizeTextarea);
    };

    var makeUnlockEventSourceButton = function (input, isEditable) {
        input.setAttribute('disabled', 'disabled');
        const button = addEl(makeEl('button'), makeText(getL10n('briefings-unlock-event-source')));
        setClassByCondition(button, 'notEditable', !isEditable);
        listen(button, 'click', () => {
            input.removeAttribute('disabled');
        });
        return button;
    };

    var updateCharacterInventory = function (event) {
        const input = event.target;
        DBMS.updateCharacterInventory(input.storyName, input.characterName, input.value, Utils.processError());
    };

    var onChangeOriginText = function (event) {
        const storyName = event.target.storyName;
        const eventIndex = event.target.eventIndex;
        const text = event.target.value;
        DBMS.setEventOriginProperty(storyName, eventIndex, 'text', text, Utils.processError());
    };

    var onChangeAdaptationText = function (event) {
        const storyName = event.target.storyName;
        const eventIndex = event.target.eventIndex;
        const characterName = event.target.characterName;
        const text = event.target.value;
        DBMS.setEventAdaptationProperty(storyName, eventIndex, characterName, 'text', text, Utils.processError());
    };
}(this.BriefingPreview = {}));
