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

require('./briefing-preview.css');

const Relations = require('./relations');
const RelationsPreview = require('./relationsPreview');
const Adaptations = require('../adaptations/adaptations');
const PermissionInformer = require('permissionInformer');

const Constants = require('common/constants');

'use strict';

// ((exports) => {
    const state = {};
    const root = '#briefingPreviewDiv ';
    const settingsPath = 'BriefingPreview';
    const l10n = L10n.get('briefings');

    exports.init = () => {
        $('#briefingCharacter').select2().on('change', buildContentDelegate);

        let button = U.queryEl('#eventGroupingByStoryRadio');
        U.listen(button, 'change', exports.refresh);
        button.checked = true;

        button = U.queryEl('#adaptationsModeRadio');
        U.listen(button, 'change', exports.refresh);
        button.checked = true;

        U.listen(U.queryEl('#eventGroupingByTimeRadio'), 'change', exports.refresh);
        U.listen(U.queryEl('#proofreadingModeRadio'), 'change', exports.refresh);
        U.listen(U.queryEl('#hideAllPanelsCheckbox'), 'change', exports.refresh);
        U.listen(U.queryEl('#disableHeadersCheckbox'), 'change', exports.refresh);

        U.queryEl('#hideAllPanelsCheckbox').checked = true;

//        U.listen(U.queryEl('#contentArea'), 'scroll', updateGutterScrollPos);
//        U.listen(U.queryEl('#contentArea'), 'resize', rebuildGutter);

        initPanelsArr();

        exports.content = U.queryEl('#briefingPreviewDiv');
    };

//    function updateGutterScrollPos (){
//        let doc = U.queryEl('#contentArea');
//        let position = U.qe(`${root} .gutter-scroll-position`);
//        position.style.top = (doc.scrollTop)/doc.scrollHeight*100 + '%';
//        position.style.height = (doc.clientHeight)/doc.scrollHeight*100 + '%';
//    }
//
//    function rebuildGutter() {
//        let doc = U.queryEl('#contentArea');
//        const gutter = U.clearEl(U.qe(`${root} .gutter`));
//        const scrollPos = U.addClass(U.makeEl('div'), 'gutter-scroll-position');
//        U.addEl(gutter, scrollPos);
//        updateGutterScrollPos();
//
//        const btn = U.makeEl('button');
//        btn.style.top = '0%';
////        const title = U.qee(panel, '.panel-title').innerHTML.trim();
//        U.setAttr(btn, 'title', l10n('to-page-top'));
//        U.listen(btn, 'click', () => {
//            doc.scrollTop = 0;
////            panel.scrollIntoView();
//        });
//        U.addEl(gutter, btn);
//
//        const panels = U.qees(doc, '#briefingContent > .panel');
//        U.addEls(gutter, panels.map(panel => {
//            const btn = U.makeEl('button');
//            btn.style.top = (panel.offsetTop)/doc.scrollHeight*100 + '%';
//
//            const panelTitle = U.qee(panel, '.panel-title');
//            const title = panelTitle.innerText || panelTitle.textContent;
//            U.setAttr(btn, 'title', title);
//            U.listen(btn, 'click', () => {
//                doc.scrollTop = panel.offsetTop - 40;
////                panel.scrollIntoView();
//            });
//            return btn;
//        }));
//
//    }

    exports.refresh = () => {
        U.clearEl(U.queryEl('#briefingCharacter'));
        U.clearEl(U.queryEl('#briefingContent'));

        Promise.all([
            DBMS.getProfileStructure({type: 'character'}),
            DBMS.getProfileStructure({type: 'player'}),
            PermissionInformer.getEntityNamesArray({type: 'character', editableOnly: false})
        ]).then(results => {
            const [characterProfileStructure, playerProfileStructure, names] = results;
            state.characterProfileStructure = characterProfileStructure;
            state.playerProfileStructure = playerProfileStructure;
            U.showEl(U.qe(`${root} .alert`), names.length === 0);
            U.showEl(U.qe(`${root} > div > div > .panel`), names.length !== 0);
            U.showEl(U.qe(`${root} #briefingCharacter`), names.length !== 0);

            if (names.length > 0) {
                const characterName = UI.checkAndGetEntitySetting(settingsPath, names);
                const data = UI.getSelect2Data(names);
                // this call trigger buildContent
                $('#briefingCharacter').select2(data).val(characterName).trigger('change');
            }
        }).catch(UI.handleError);
    };

    function buildContentDelegate(event) {
        buildContent(event.target.value);
    }

    function buildContent(characterName) {
        UI.updateEntitySetting(settingsPath, characterName);
        const content = U.clearEl(U.queryEl('#briefingContent'));
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
            isAdaptationsMode: U.queryEl('#adaptationsModeRadio').checked,
            isGroupingByStory: U.queryEl('#eventGroupingByStoryRadio').checked,
            disableHeaders: U.queryEl('#disableHeadersCheckbox').checked,
            hideAllPanels: U.queryEl('#hideAllPanelsCheckbox').checked
        };
    }

    function initPanelsArr(){
        state.panels = [{
            name: 'storyRights',
            load(data, callback) {
                PermissionInformer.getEntityNamesArray({type: 'story', editableOnly: true}).then((userStoryNames) => {
                    data.userStoryNamesMap = R.indexBy(R.prop('value'), userStoryNames);
                    callback();
                }).catch(UI.handleError)
            },
            make(el, data) {}
        }, {
            name: 'characterProfile',
            load(data, callback) {
                DBMS.getProfile({type: 'character', name: data.characterName}).then((profile) => {
                    data.profile = profile;
                    callback();
                }).catch(UI.handleError)
            },
            make(el, data) {
                const label = CU.strFormat(L10n.getValue('briefings-character-profile'), [data.characterName]);
                U.addEl(el, makePanel(
                    U.makeText(label),
                    UI.makeProfileTable(Constants, state.characterProfileStructure, data.profile), getFlags().hideAllPanels
                ));
            }
        }, {
            name: 'playerProfile',
            load(data, callback) {
                DBMS.getProfileBinding({type: 'character', name: data.characterName}).then((binding) => {
                    if (binding[1] === '') {
                        callback();
                    } else {
                        DBMS.getProfile({type: 'player', name: binding[1]}).then((playerProfile) => {
                            data.playerProfile = playerProfile;
                            // eslint-disable-next-line prefer-destructuring
                            data.playerName = binding[1];
                            callback();
                        }).catch(UI.handleError)
                    }
                }).catch(UI.handleError)
            },
            make(el, data) {
                if (data.playerProfile) {
                    const label = CU.strFormat(L10n.getValue('briefings-player-profile'), [data.playerName]);
                    U.addEl(el, makePanel(
                        U.makeText(label),
                        UI.makeProfileTable(Constants, state.playerProfileStructure, data.playerProfile), getFlags().hideAllPanels
                    ));
                }
            }
        }, {
            name: 'inventory',
            load(data, callback) {
                DBMS.getAllInventoryLists({characterName: data.characterName}).then((allInventoryLists) => {
                    data.allInventoryLists = allInventoryLists.sort(CU.charOrdAFactory(R.compose(R.toLower, R.prop('storyName'))));
                    callback();
                }).catch(UI.handleError)
            },
            make(el, data) {
                U.addEl(el, makePanel(
                        U.makeText(`${L10n.getValue('briefings-inventory')} (${data.allInventoryLists.length})`),
                        makeInventoryContent(
                                data.allInventoryLists,
                                data.characterName, data.userStoryNamesMap
                        ), getFlags().hideAllPanels
                ));
            }
        }, {
            name: 'groups',
            load(data, callback) {
                DBMS.getCharacterGroupTexts({characterName: data.characterName}).then((groupTexts) => {
                    data.groupTexts = groupTexts;
                    callback();
                }).catch(UI.handleError)
            },
            make(el, data) {
                U.addEl(el, makePanel(
                        U.makeText(`${L10n.getValue('header-groups')} (${data.groupTexts.length})`),
                        makeGroupContent(data.groupTexts), getFlags().hideAllPanels
                ));
            }
        }, {
            name: 'relations',
            load: Relations.load,
            make(el, data) {
                const label = `${L10n.getValue('header-relations')} (${data.relationsSummary.relations.length})`;
                const content = RelationsPreview.makeRelationsContent(
                        data, getFlags().isAdaptationsMode,
                        state.characterProfileStructure, exports.refresh
                );
                U.addEl(el, makePanel(U.makeText(label), content, getFlags().hideAllPanels));
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
        UI.enable(exports.content, 'notEditable', false);
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
        return U.addEls(U.makeEl('div'), groupTexts.map((groupText) => {
            const div = U.makeEl('div');
            U.addEl(div, U.addEl(U.makeEl('h4'), U.makeText(groupText.groupName)));
            const span = U.addEl(U.makeEl('textarea'), U.makeText(groupText.text));
            U.setAttr(span, 'disabled', 'disabled');
            U.addClasses(span, ['briefingTextSpan', 'form-control']);
            return U.addEl(div, span);
        }));
    }

    function makeInventoryContent(allInventoryLists, characterName, userStoryNamesMap) {
        const container = U.qmte('.profile-editor-container-tmpl');
        return U.addEls(container, allInventoryLists.map((elem) => {
            const input = U.makeEl('input');
            input.value = elem.inventory;
            input.storyName = elem.storyName;
            input.characterName = characterName;
            U.addClasses(input, ['inventoryInput', 'form-control']);
            if (!userStoryNamesMap[elem.storyName]) {
                U.addClass(input, 'notEditable');
            }
            U.listen(input, 'change', updateCharacterInventory);

            const row = U.qmte('.profile-editor-row-tmpl');
            U.addEl(U.qee(row, '.profile-item-name'), U.makeText(elem.storyName));
            U.addEl(U.qee(row, '.profile-item-input'), input);
            return row;
        }));
    }

    function showEventsByTime(content, characterName, userStoryNamesMap, flags) {
        DBMS.getCharacterEventsByTime({characterName}).then((allEvents) => {

            const adaptations = allEvents.map(event => ({
                characterName,
                storyName: event.storyName
            }));

            Promise.all([
                PermissionInformer.areAdaptationsEditable({adaptations}),
                DBMS.getMetaInfo()
            ]).then(results => {
                const [areAdaptationsEditable, metaInfo] = results;
                const opts = {
                    userStoryNamesMap,
                    areAdaptationsEditable,
                    showStoryName: true,
                    metaInfo
                };

                const splitConstant = 5;

                U.addEls(content, R.splitEvery(splitConstant, allEvents).map((subPart, i) => {
                    const eventContent = U.addEls(U.makeEl('div'), subPart.map((event, j) => {
                        opts.index = (i * splitConstant) + 1 + j;
                        return showEvent(event, characterName, opts, flags);
                    }));

                    let name;
                    if (flags.disableHeaders) {
                        name = U.makeText(CU.strFormat(L10n.getValue('briefings-events-header'), [(i * splitConstant) + 1, (i * splitConstant) + subPart.length]));
                    } else {
                        name = U.addEls(U.makeEl('div'), subPart.map(event => getEventHeaderDiv(event, true)));
                    }
                    return makePanel(name, eventContent, flags.hideAllPanels);
                }));
                onBuildContentFinish();
            }).catch(UI.handleError);
        }).catch(UI.handleError);
    }

    function getStoryHeader(elem, i, disableHeaders) {
        let name;
        if (disableHeaders) {
            name = CU.strFormat(L10n.getValue('briefings-story-header'), [i + 1]);
        } else {
            name = elem.storyName;
        }
        return U.makeText(`${name} (${elem.events.length})`);
    }

    function showEventsByStory(content, characterName, userStoryNamesMap, flags) {
        DBMS.getCharacterEventGroupsByStory({characterName}).then((eventGroups) => {
            const adaptations = eventGroups.map(elem => ({
                characterName,
                storyName: elem.storyName
            }));
            Promise.all([
                PermissionInformer.areAdaptationsEditable({adaptations}),
                DBMS.getMetaInfo()
            ]).then(results => {
                const [areAdaptationsEditable, metaInfo] = results;
                const opts = {
                    userStoryNamesMap,
                    areAdaptationsEditable,
                    showStoryName: false,
                    metaInfo
                };

                U.addEls(content, eventGroups.map((elem, i) => {
                    const storyContent = U.addEls(U.makeEl('div'), elem.events.map((event, j) => {
                        opts.index = j + 1;
                        return showEvent(event, characterName, opts, flags);
                    }));
                    return makePanel(
                        getStoryHeader(elem, i, flags.disableHeaders), storyContent,
                        flags.hideAllPanels
                    );
                }));
                onBuildContentFinish();
            }).catch(UI.handleError);
        }).catch(UI.handleError)
    }

    function getEventHeaderDiv(event, showStoryName) {
        const eventName = U.addEl(U.makeEl('span'), U.makeText(CU.strFormat('{0} {1}', [showStoryName ? `${event.storyName}:` : '', event.name])));
        const eventTime = U.addClass(U.addEl(U.makeEl('span'), U.makeText(event.time)), 'previewEventTime');
        return U.addEls(U.makeEl('div'), [eventTime, eventName]);
    }

    function showEvent(event, characterName, opts, flags) {
        const { isAdaptationsMode } = flags;
        const showAll = isAdaptationsMode;
        const storyName = event.storyName;
        const isStoryEditable = opts.userStoryNamesMap[storyName] !== undefined;
        const showAdaptationText = event.characters[characterName].text !== '';
        const showSubjectiveTime = event.characters[characterName].time !== '';

        const eventDiv = U.qmte('.adaptation-row-tmpl');
        const originCard = Adaptations.makeOriginCard(event, opts.metaInfo, event.storyName, {
            cardTitle: flags.disableHeaders ? L10n.format('briefings', 'event-header', [opts.index]) : event.name,
            showTimeInput: showAll || !showSubjectiveTime,
            showLockButton: true,
            showTextInput: showAll || !showAdaptationText
        });
        if(!isStoryEditable){
            U.qees(originCard, '.isStoryEditable').forEach(U.addClass(R.__, 'notEditable'));
        }
        U.addEl(U.qee(eventDiv, '.eventMainPanelRow-left'), originCard);
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
        U.addEl(U.qee(eventDiv, '.eventMainPanelRow-left'), adaptationsCard);
        return eventDiv;
    }

    function updateCharacterInventory(event) {
        const {
            storyName, characterName, value
        } = event.target;
        DBMS.updateCharacterInventory({storyName, characterName, inventory: value}).catch(UI.handleError);
    }
// })(window.BriefingPreview = {});
