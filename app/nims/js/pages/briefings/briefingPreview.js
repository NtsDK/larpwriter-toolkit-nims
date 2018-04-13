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

((exports) => {
    const state = {};
    const root = '#briefingPreviewDiv ';
    const settingsPath = 'BriefingPreview';
    const l10n = L10n.get('briefings');

    exports.init = () => {
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

        getEl('hideAllPanelsCheckbox').checked = true;

        exports.content = getEl('briefingPreviewDiv');
    };

    exports.refresh = () => {
        clearEl(getEl('briefingCharacter'));
        clearEl(getEl('briefingContent'));

        DBMS.getProfileStructure('character', (err, characterProfileStructure) => {
            if (err) { Utils.handleError(err); return; }
            DBMS.getProfileStructure('player', (err2, playerProfileStructure) => {
                if (err2) { Utils.handleError(err2); return; }
                state.characterProfileStructure = characterProfileStructure;
                state.playerProfileStructure = playerProfileStructure;
                PermissionInformer.getEntityNamesArray('character', false, (err3, names) => {
                    if (err3) { Utils.handleError(err3); return; }
                    if (names.length > 0) {
                        const characterName = UI.checkAndGetEntitySetting(settingsPath, names);
                        const data = getSelect2Data(names);
                        // this call trigger buildContent
                        $('#briefingCharacter').select2(data).val(characterName).trigger('change');
                    }
                });
            });
        });
    };

    function buildContentDelegate(event) {
        buildContent(event.target.value);
    }

    function buildContent(characterName) {
        UI.updateEntitySetting(settingsPath, characterName);
        const content = clearEl(getEl('briefingContent'));
        let index = 0;
        const data = {
            characterName
        };
        function buildContentInner() {
            if (index < state.panels.length) {
                index++;
                state.panels[index - 1].load(data, buildContentInner);
            } else {
                state.panels.map(R.prop('make')).forEach((make) => {
                    make(content, data);
                });
            }
        }
        buildContentInner();
    }

    function getFlags() {
        return {
            isAdaptationsMode: getEl('adaptationsModeRadio').checked,
            isGroupingByStory: getEl('eventGroupingByStoryRadio').checked,
            disableHeaders: getEl('disableHeadersCheckbox').checked,
            hideAllPanels: getEl('hideAllPanelsCheckbox').checked
        };
    }

    state.panels = [{
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
            addEl(el, makePanel(
                makeText(label),
                UI.makeProfileTable(state.characterProfileStructure, data.profile), getFlags().hideAllPanels
            ));
        }
    }, {
        name: 'playerProfile',
        load(data, callback) {
            DBMS.getProfileBinding('character', data.characterName, (err, binding) => {
                if (err) { Utils.handleError(err); return; }
                if (binding[1] === '') {
                    callback();
                } else {
                    DBMS.getProfile('player', binding[1], (err2, playerProfile) => {
                        if (err2) { Utils.handleError(err2); return; }
                        data.playerProfile = playerProfile;
                        // eslint-disable-next-line prefer-destructuring
                        data.playerName = binding[1];
                        callback();
                    });
                }
            });
        },
        make(el, data) {
            if (data.playerProfile) {
                const label = strFormat(getL10n('briefings-player-profile'), [data.playerName]);
                addEl(el, makePanel(
                    makeText(label),
                    UI.makeProfileTable(state.playerProfileStructure, data.playerProfile), getFlags().hideAllPanels
                ));
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
                makeInventoryContent(
                    data.allInventoryLists,
                    data.characterName, data.userStoryNamesMap
                ), getFlags().hideAllPanels
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
        load: Relations.load,
        make(el, data) {
            const label = `${getL10n('header-relations')} (${data.relationsSummary.relations.length})`;
            const content = RelationsPreview.makeRelationsContent(
                data, getFlags().isAdaptationsMode,
                state.characterProfileStructure, exports.refresh
            );
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

    function onBuildContentFinish() {
        UI.initTextAreas(`${root} #briefingContent textarea`);
        UI.refreshTextAreas(`${root} #briefingContent textarea`);
        Utils.enable(exports.content, 'notEditable', false);
    }


    function makePanel(title, content, hideAllPanels) {
        const panelInfo = UI.makePanelCore(title, content);
        UI.attachPanelToggler(panelInfo.a, panelInfo.contentDiv, (event, togglePanel) => {
            togglePanel();
            UI.refreshTextAreas(`${root} #briefingContent textarea`);
        });
        if (hideAllPanels) {
            panelInfo.a.click();
        }
        return panelInfo.panel;
    }

    function makeGroupContent(groupTexts) {
        return addEls(makeEl('div'), groupTexts.map((groupText) => {
            const div = makeEl('div');
            addEl(div, addEl(makeEl('h4'), makeText(groupText.groupName)));
            const span = addEl(makeEl('textarea'), makeText(groupText.text));
            setAttr(span, 'disabled', 'disabled');
            addClasses(span, ['briefingTextSpan', 'form-control']);
            return addEl(div, span);
        }));
    }

    function makeInventoryContent(allInventoryLists, characterName, userStoryNamesMap) {
        const container = qmte('.profile-editor-container-tmpl');
        return addEls(container, allInventoryLists.map((elem) => {
            const input = makeEl('input');
            input.value = elem.inventory;
            input.storyName = elem.storyName;
            input.characterName = characterName;
            addClasses(input, ['inventoryInput', 'form-control']);
            if (!userStoryNamesMap[elem.storyName]) {
                addClass(input, 'notEditable');
            }
            listen(input, 'change', updateCharacterInventory);

            const row = qmte('.profile-editor-row-tmpl');
            addEl(qee(row, '.profile-item-name'), makeText(elem.storyName));
            addEl(qee(row, '.profile-item-input'), input);
            return row;
        }));
    }

    function showEventsByTime(content, characterName, userStoryNamesMap, flags) {
        DBMS.getCharacterEventsByTime(characterName, (err, allEvents) => {
            if (err) { Utils.handleError(err); return; }
            const adaptations = allEvents.map(event => ({
                characterName,
                storyName: event.storyName
            }));

            PermissionInformer.areAdaptationsEditable(adaptations, (err2, areAdaptationsEditable) => {
                if (err2) { Utils.handleError(err2); return; }

                DBMS.getMetaInfo((err3, metaInfo) => {
                    if (err3) { Utils.handleError(err3); return; }

                    const opts = {
                        userStoryNamesMap,
                        areAdaptationsEditable,
                        showStoryName: true,
                        metaInfo
                    };

                    const splitConstant = 5;

                    addEls(content, R.splitEvery(splitConstant, allEvents).map((subPart, i) => {
                        const eventContent = addEls(makeEl('div'), subPart.map((event, j) => {
                            opts.index = (i * splitConstant) + 1 + j;
                            return showEvent(event, characterName, opts, flags);
                        }));

                        let name;
                        if (flags.disableHeaders) {
                            name = makeText(strFormat(getL10n('briefings-events-header'), [(i * splitConstant) + 1, (i * splitConstant) + subPart.length]));
                        } else {
                            name = addEls(makeEl('div'), subPart.map(event => getEventHeaderDiv(event, true)));
                        }
                        return makePanel(name, eventContent, flags.hideAllPanels);
                    }));
                    onBuildContentFinish();
                });
            });
        });
    }

    function getStoryHeader(elem, i, disableHeaders) {
        let name;
        if (disableHeaders) {
            name = strFormat(getL10n('briefings-story-header'), [i + 1]);
        } else {
            name = elem.storyName;
        }
        return makeText(`${name} (${elem.events.length})`);
    }

    function showEventsByStory(content, characterName, userStoryNamesMap, flags) {
        DBMS.getCharacterEventGroupsByStory(characterName, (err, eventGroups) => {
            if (err) { Utils.handleError(err); return; }
            const adaptations = eventGroups.map(elem => ({
                characterName,
                storyName: elem.storyName
            }));
            PermissionInformer.areAdaptationsEditable(adaptations, (err2, areAdaptationsEditable) => {
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getMetaInfo((err3, metaInfo) => {
                    if (err3) { Utils.handleError(err3); return; }
                    const opts = {
                        userStoryNamesMap,
                        areAdaptationsEditable,
                        showStoryName: false,
                        metaInfo
                    };

                    addEls(content, eventGroups.map((elem, i) => {
                        const storyContent = addEls(makeEl('div'), elem.events.map((event, j) => {
                            opts.index = j + 1;
                            return showEvent(event, characterName, opts, flags);
                        }));
                        return makePanel(
                            getStoryHeader(elem, i, flags.disableHeaders), storyContent,
                            flags.hideAllPanels
                        );
                    }));
                    onBuildContentFinish();
                });
            });
        });
    }

    function getEventHeaderDiv(event, showStoryName) {
        const eventName = addEl(makeEl('span'), makeText(strFormat('{0} {1}', [showStoryName ? `${event.storyName}:` : '', event.name])));
        const eventTime = addClass(addEl(makeEl('span'), makeText(event.time)), 'previewEventTime');
        return addEls(makeEl('div'), [eventTime, eventName]);
    }

    function showEvent(event, characterName, opts, flags) {
        const { isAdaptationsMode } = flags;
        const showAll = isAdaptationsMode;
        const storyName = event.storyName;
        const isStoryEditable = opts.userStoryNamesMap[storyName] !== undefined;
        const showAdaptationText = event.characters[characterName].text !== '';
        const showSubjectiveTime = event.characters[characterName].time !== '';

        const eventDiv = qmte('.adaptation-row-tmpl');
        const originCard = Adaptations.makeOriginCard(event, opts.metaInfo, event.storyName, {
            cardTitle: flags.disableHeaders ? L10n.format('briefings', 'event-header', [opts.index]) : event.name,
            showTimeInput: showAll || !showSubjectiveTime,
            showLockButton: true,
            showTextInput: showAll || !showAdaptationText
        });
        if(!isStoryEditable){
            qees(originCard, '.isStoryEditable').forEach(addClass(R.__, 'notEditable'));
        }
        addEl(qee(eventDiv, '.eventMainPanelRow-left'), originCard);
        const isEditable = opts.areAdaptationsEditable[`${event.storyName}-${characterName}`];
        const adaptationsCard = Adaptations.makeAdaptationCard(
            isEditable, event,
            event.storyName, characterName, {
                cardTitle: '',
                showTimeInput: showAll || showSubjectiveTime,
                showFinishedButton: true,
                showTextInput: showAll || showAdaptationText
            }
        );
        addEl(qee(eventDiv, '.eventMainPanelRow-left'), adaptationsCard);
        return eventDiv;
    }

    function updateCharacterInventory(event) {
        const {
            storyName, characterName, value
        } = event.target;
        DBMS.updateCharacterInventory(storyName, characterName, value, Utils.processError());
    }
})(this.BriefingPreview = {});
