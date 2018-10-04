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

//        listen(getEl('contentArea'), 'scroll', updateGutterScrollPos);
//        listen(getEl('contentArea'), 'resize', rebuildGutter);

        initPanelsArr();

        exports.content = getEl('briefingPreviewDiv');
    };

//    function updateGutterScrollPos (){
//        let doc = getEl('contentArea');
//        let position = qe(`${root} .gutter-scroll-position`);
//        position.style.top = (doc.scrollTop)/doc.scrollHeight*100 + '%';
//        position.style.height = (doc.clientHeight)/doc.scrollHeight*100 + '%';
//    }
//
//    function rebuildGutter() {
//        let doc = getEl('contentArea');
//        const gutter = clearEl(qe(`${root} .gutter`));
//        const scrollPos = addClass(makeEl('div'), 'gutter-scroll-position');
//        addEl(gutter, scrollPos);
//        updateGutterScrollPos();
//
//        const btn = makeEl('button');
//        btn.style.top = '0%';
////        const title = qee(panel, '.panel-title').innerHTML.trim();
//        setAttr(btn, 'title', l10n('to-page-top'));
//        listen(btn, 'click', () => {
//            doc.scrollTop = 0;
////            panel.scrollIntoView();
//        });
//        addEl(gutter, btn);
//
//        const panels = qees(doc, '#briefingContent > .panel');
//        addEls(gutter, panels.map(panel => {
//            const btn = makeEl('button');
//            btn.style.top = (panel.offsetTop)/doc.scrollHeight*100 + '%';
//
//            const panelTitle = qee(panel, '.panel-title');
//            const title = panelTitle.innerText || panelTitle.textContent;
//            setAttr(btn, 'title', title);
//            listen(btn, 'click', () => {
//                doc.scrollTop = panel.offsetTop - 40;
////                panel.scrollIntoView();
//            });
//            return btn;
//        }));
//
//    }

    exports.refresh = () => {
        clearEl(getEl('briefingCharacter'));
        clearEl(getEl('briefingContent'));

        Promise.all([
            DBMS.getProfileStructureNew({type: 'character'}),
            DBMS.getProfileStructureNew({type: 'player'}),
            PermissionInformer.getEntityNamesArrayNew({type: 'character', editableOnly: false})
        ]).then(results => {
            const [characterProfileStructure, playerProfileStructure, names] = results;
            state.characterProfileStructure = characterProfileStructure;
            state.playerProfileStructure = playerProfileStructure;
            showEl(qe(`${root} .alert`), names.length === 0);
            showEl(qe(`${root} > div > div > .panel`), names.length !== 0);
            showEl(qe(`${root} #briefingCharacter`), names.length !== 0);

            if (names.length > 0) {
                const characterName = UI.checkAndGetEntitySetting(settingsPath, names);
                const data = getSelect2Data(names);
                // this call trigger buildContent
                $('#briefingCharacter').select2(data).val(characterName).trigger('change');
            }
        }).catch(Utils.handleError);
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
//                rebuildGutter();
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

    function initPanelsArr(){
        state.panels = [{
            name: 'storyRights',
            load(data, callback) {
                PermissionInformer.getEntityNamesArrayNew({type: 'story', editableOnly: true}).then((userStoryNames) => {
                    data.userStoryNamesMap = R.indexBy(R.prop('value'), userStoryNames);
                    callback();
                }).catch(Utils.handleError)
            },
            make(el, data) {}
        }, {
            name: 'characterProfile',
            load(data, callback) {
                DBMS.getProfileNew({type: 'character', name: data.characterName}).then((profile) => {
                    data.profile = profile;
                    callback();
                }).catch(Utils.handleError)
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
                DBMS.getProfileBindingNew({type: 'character', name: data.characterName}).then((binding) => {
                    if (binding[1] === '') {
                        callback();
                    } else {
                        DBMS.getProfileNew({type: 'player', name: binding[1]}).then((playerProfile) => {
                            data.playerProfile = playerProfile;
                            // eslint-disable-next-line prefer-destructuring
                            data.playerName = binding[1];
                            callback();
                        }).catch(Utils.handleError)
                    }
                }).catch(Utils.handleError)
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
                DBMS.getAllInventoryListsNew({characterName: data.characterName}).then((allInventoryLists) => {
                    data.allInventoryLists = allInventoryLists.sort(CommonUtils.charOrdAFactory(R.compose(R.toLower, R.prop('storyName'))));
                    callback();
                }).catch(Utils.handleError)
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
                DBMS.getCharacterGroupTextsNew({characterName: data.characterName}).then((groupTexts) => {
                    data.groupTexts = groupTexts;
                    callback();
                }).catch(Utils.handleError)
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
    }

    function onBuildContentFinish() {
        UI.initTextAreas(`${root} #briefingContent textarea`);
        UI.refreshTextAreas(`${root} #briefingContent textarea`);
        Utils.enable(exports.content, 'notEditable', false);
    }


    function makePanel(title, content, hideAllPanels) {
        const panelInfo = UI.makePanelCore(title, content);
        UI.attachPanelToggler(panelInfo.a, panelInfo.contentDiv, (event, togglePanel) => {
            togglePanel();
//            rebuildGutter();
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
        DBMS.getCharacterEventsByTimeNew({characterName}).then((allEvents) => {

            const adaptations = allEvents.map(event => ({
                characterName,
                storyName: event.storyName
            }));

            Promise.all([
                PermissionInformer.areAdaptationsEditableNew({adaptations}),
                DBMS.getMetaInfoNew()
            ]).then(results => {
                const [areAdaptationsEditable, metaInfo] = results;
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
            }).catch(Utils.handleError);
        }).catch(Utils.handleError);
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
        DBMS.getCharacterEventGroupsByStoryNew({characterName}).then((eventGroups) => {
            const adaptations = eventGroups.map(elem => ({
                characterName,
                storyName: elem.storyName
            }));
            Promise.all([
                PermissionInformer.areAdaptationsEditableNew({adaptations}),
                DBMS.getMetaInfoNew()
            ]).then(results => {
                const [areAdaptationsEditable, metaInfo] = results;
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
            }).catch(Utils.handleError);
        }).catch(Utils.handleError)
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
        DBMS.updateCharacterInventoryNew({storyName, characterName, inventory: value}).catch(Utils.handleError);
    }
})(this.BriefingPreview = {});
