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

"use strict";

(function(exports){
    
    var state = {};

    exports.init = function () {
        $("#briefingCharacter").select2().on("change", buildContentDelegate);
    
        var button = getEl("eventGroupingByStoryRadio");
        listen(button, "change", exports.refresh);
        button.checked = true;
        
        button = getEl("adaptationsModeRadio");
        listen(button, "change", exports.refresh);
        button.checked = true;
    
        listen(getEl("eventGroupingByTimeRadio"), "change", exports.refresh);
        listen(getEl("proofreadingModeRadio"), "change", exports.refresh);
        listen(getEl("hideAllPanelsCheckbox"), "change", exports.refresh);
        listen(getEl("disableHeadersCheckbox"), "change", exports.refresh);
        
        exports.content = getEl("briefingPreviewDiv");
    };
    
    exports.refresh = function () {
        clearEl(getEl("briefingCharacter"));
        clearEl(getEl("briefingContent"));
        
        DBMS.getProfileStructure('character', function(err, characterProfileStructure){
            if(err) {Utils.handleError(err); return;}
            DBMS.getProfileStructure('player',function(err, playerProfileStructure){
                if(err) {Utils.handleError(err); return;}
                state.characterProfileStructure = characterProfileStructure;
                state.playerProfileStructure = playerProfileStructure;
                PermissionInformer.getEntityNamesArray('character', false, function(err, names){
                    if(err) {Utils.handleError(err); return;}
                    if (names.length > 0) {
                        var settings = DBMS.getSettings();
                        if(!settings["BriefingPreview"]){
                            settings["BriefingPreview"] = {
                                    characterName : names[0].value
                            };
                        }
                        var characterName = settings["BriefingPreview"].characterName;
                        var rawNames = names.map(R.prop('value'));
                        if(rawNames.indexOf(characterName) === -1){
                            settings["BriefingPreview"].characterName = names[0].value;
                            characterName = names[0].value;
                        }
                        
                        var data = getSelect2Data(names);
                        // this call trigger BriefingPreview.buildContent
                        $("#briefingCharacter").select2(data).val(characterName).trigger('change');
                    }
                });
            });
        });
        
    };
    
    var buildContentDelegate = function (event) {
        buildContent(event.target.value);
    };
    
    var updateSettings = function (characterName) {
        var settings = DBMS.getSettings();
        settings["BriefingPreview"].characterName = characterName;
    };
    
    var buildContent = function (characterName) {
        updateSettings(characterName);
        var content = clearEl(getEl("briefingContent"));
        var index = 0;
        var data = {
            characterName: characterName
        };
        var buildContentInner = function(){
            if(index < panels.length){
                index++;
                panels[index-1].load(data, buildContentInner);
            } else {
                panels.map(R.prop('make')).forEach(function(make){
                    make(content, data)
                });
            }
        };
        buildContentInner();
    };
    
    var getFlags = function(){
        return {
            isAdaptationsMode : getEl("adaptationsModeRadio").checked,
            isGroupingByStory : getEl("eventGroupingByStoryRadio").checked,
            disableHeaders : getEl('disableHeadersCheckbox').checked,
            hideAllPanels: getEl('hideAllPanelsCheckbox').checked
        }
    };
    
    var panels = [{
        name: 'storyRights',
        load: function(data, callback){
            PermissionInformer.getEntityNamesArray('story', true, function(err, userStoryNames){
                if(err) {Utils.handleError(err); return;}
                data.userStoryNamesMap = R.indexBy(R.prop('value'), userStoryNames); 
                callback();
            });
        }, 
        make: function(el, data){} 
    }, {
        name: 'characterProfile',
        load: function(data, callback){
            DBMS.getProfile('character', data.characterName, function(err, profile){
                if(err) {Utils.handleError(err); return;}
                data.profile = profile;
                callback();
            });
        }, 
        make: function(el, data){
            let label = strFormat(getL10n('briefings-character-profile'), [data.characterName]);
            addEl(el, makePanel(makeText(label), UI.makeProfileTable(state.characterProfileStructure, data.profile), getFlags().hideAllPanels));
        } 
    }, {
        name: 'playerProfile',
        load: function(data, callback){
            DBMS.getProfileBinding('character', data.characterName, function(err, binding){
                if(err) {Utils.handleError(err); return;}
                if(binding[1] === ''){
                    callback();
                } else {
                    DBMS.getProfile('player', binding[1], function(err, playerProfile){
                        if(err) {Utils.handleError(err); return;}
                        data.playerProfile = playerProfile;
                        data.playerName = binding[1];
                        callback();
                    });
                }
            });
        }, 
        make: function(el, data){
            if(data.playerProfile){
                let label = strFormat(getL10n('briefings-player-profile'), [data.playerName]);
                addEl(el, makePanel(makeText(label), UI.makeProfileTable(state.playerProfileStructure, data.playerProfile), getFlags().hideAllPanels));
            }
        } 
    }, {
        name: 'inventory',
        load: function(data, callback){
            DBMS.getAllInventoryLists(data.characterName, function(err, allInventoryLists){
                if(err) {Utils.handleError(err); return;}
                data.allInventoryLists = allInventoryLists.sort(CommonUtils.charOrdAFactory(R.compose(R.toLower, R.prop('storyName'))));
                callback();
            });
        }, 
        make: function(el, data){
            addEl(el, makePanel(makeText(getL10n("briefings-inventory") + ' (' + data.allInventoryLists.length + ')'), 
                    makeInventoryContent(data.allInventoryLists, data.characterName, data.userStoryNamesMap), getFlags().hideAllPanels));
        } 
    }, {
        name: 'groups',
        load: function(data, callback){
            DBMS.getCharacterGroupTexts(data.characterName, function(err, groupTexts){
                if(err) {Utils.handleError(err); return;}
                data.groupTexts = groupTexts;
                callback();
            });
        }, 
        make: function(el, data){
            addEl(el, makePanel(makeText(getL10n("header-groups") + ' (' + data.groupTexts.length + ')'), 
                    makeGroupContent(data.groupTexts), getFlags().hideAllPanels));
        } 
    }, {
        name: 'relations',
        load: function(data, callback){
            DBMS.getAllProfiles('character', function(err, profiles){
                if(err) {Utils.handleError(err); return;}
                DBMS.getRelationsSummary(data.characterName, function(err, relationsSummary){
                    if(err) {Utils.handleError(err); return;}
                    DBMS.getExtendedProfileBindings(function(err, profileBindings){
                        if(err) {Utils.handleError(err); return;}
                        PermissionInformer.getEntityNamesArray('character', false, function(err, characterNamesArray){
                            if(err) {Utils.handleError(err); return;}
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
        make: function(el, data){
            var label = getL10n("header-relations") + ' (' + R.keys(data.relationsSummary.directRelations).length + ')';
            let content = RelationsPreview.makeRelationsContent(data, getFlags(), state.characterProfileStructure);
            addEl(el, makePanel(makeText(label), content, getFlags().hideAllPanels));
        } 
    }, {
        name: 'stories',
        load: function(data, callback){
            callback();
        }, 
        make: function(el, data){
            var flags = getFlags();
            if (flags.isGroupingByStory) {
                showEventsByStory(el, data.characterName, data.userStoryNamesMap, flags);
            } else {
                showEventsByTime(el, data.characterName, data.userStoryNamesMap, flags);
            }
        } 
    }];
    
    var onBuildContentFinish = function(){
        refreshTextAreas();
        Utils.enable(exports.content, "notEditable", false);
    };
        
    var refreshTextAreas = function(){
        R.ap([UI.resizeTextarea], nl2array(getEl("briefingContent").getElementsByTagName('textarea')).map(function(el){
            return {target:el};
        }));
    };
    
    var makePanel = function(title, content, hideAllPanels){
        var panelInfo = UI.makePanelCore(title, content);
        setClassByCondition(panelInfo.contentDiv, 'hidden', hideAllPanels);
        var panelToggler = UI.togglePanel(panelInfo.contentDiv);
        listen(panelInfo.a, "click", function(){
            panelToggler();
            refreshTextAreas()
        });
        
        return panelInfo.panel;
    };
    
    var makeGroupContent = function(groupTexts){
        return addEls(makeEl('div'), groupTexts.map(function(groupText){
            var div = makeEl('div');
            addEl(div,addEl(makeEl('h4'), makeText(groupText.groupName)));
            var span = addEl(makeEl('textarea'), makeText(groupText.text));
            setAttr(span, 'disabled', 'disabled');
            addClass(span, 'briefingTextSpan');
            return addEl(div, span);
        }));
    };
    
    var makeInventoryContent = function(allInventoryLists, characterName, userStoryNamesMap){
        var inventoryDiv;
        inventoryDiv = makeEl('tbody');
        
        allInventoryLists.forEach(function(elem){
            var input = makeEl("input");
            input.value = elem.inventory;
            input.storyName = elem.storyName;
            input.characterName = characterName;
            addClass(input, "inventoryInput");
            if(!userStoryNamesMap[elem.storyName]){
                addClass(input, "notEditable");
            }
            input.addEventListener("change", updateCharacterInventory);
            
            addEl(inventoryDiv,UI.makeTableRow(makeText(elem.storyName), input));
        });
        return addEl(addClasses(makeEl('table'), ['table','table-striped']), inventoryDiv);
    };
    
    var showEventsByTime = function (content, characterName, userStoryNamesMap, flags) {
        DBMS.getCharacterEventsByTime(characterName, function(err, allEvents){
            if(err) {Utils.handleError(err); return;}
            var adaptations = allEvents.map(function (event) {
                return {
                    characterName: characterName,
                    storyName: event.storyName
                };
            });
            
            PermissionInformer.areAdaptationsEditable(adaptations, function(err, areAdaptationsEditable){
                if(err) {Utils.handleError(err); return;}
                
                var opts = {
                    userStoryNamesMap : userStoryNamesMap,
                    areAdaptationsEditable : areAdaptationsEditable,
                    showStoryName : true
                };
                
                var splitConstant = 5;
                
                addEls(content, R.splitEvery(splitConstant, allEvents).map(function(subPart, i){
                    var eventContent = addEls(makeEl('div'), subPart.map(function (event,j) {
                        opts.index = i*splitConstant+1 + j;
                        return showEvent(event, characterName, opts, flags);
                    }));
                    
                    var name;
                    if(flags.disableHeaders){
                        name = makeText(strFormat(getL10n('briefings-events-header'), [i*splitConstant+1, i*splitConstant+subPart.length]));
                    } else {
                        name = addEls(makeEl('div'), subPart.map(function(event){
                            return getEventHeaderDiv(event, true);
                        }));
                    }
                    return makePanel(name, eventContent, flags.hideAllPanels)
                }));
                onBuildContentFinish();
            });
        });
    };
    
    var getStoryHeader = function(elem, i, disableHeaders){
        var name;
        if(disableHeaders){
            name = strFormat(getL10n('briefings-story-header'), [i+1]);
        } else {
            name = elem.storyName;
        }
        return makeText(name + ' ('+elem.events.length+')');
    };
    
    var showEventsByStory = function (content, characterName, userStoryNamesMap, flags) {
        DBMS.getCharacterEventGroupsByStory(characterName, function(err, eventGroups){
            if(err) {Utils.handleError(err); return;}
            var adaptations = eventGroups.map(function (elem) {
                return {
                    characterName: characterName,
                    storyName: elem.storyName
                };
            });
            PermissionInformer.areAdaptationsEditable(adaptations, function(err, areAdaptationsEditable){
                if(err) {Utils.handleError(err); return;}
                var opts = {
                    userStoryNamesMap : userStoryNamesMap,
                    areAdaptationsEditable : areAdaptationsEditable,
                    showStoryName : false
                };
                
                addEls(content, eventGroups.map(function(elem, i){
                    var storyContent = addEls(makeEl('div'), elem.events.map(function(event, j){
                        opts.index = j+1;
                        return showEvent(event, characterName, opts, flags);
                    }));
                    return makePanel(getStoryHeader(elem, i, flags.disableHeaders), storyContent, flags.hideAllPanels);
                }));
                onBuildContentFinish();
            });
        });
    };
    
    var getEventHeaderDiv = function(event, showStoryName){
        var eventName = addEl(makeEl('span'), makeText(strFormat("{0} {1}", [showStoryName?event.storyName+":":"",event.name])));
        var eventTime = addClass(addEl(makeEl('span'), makeText(event.time)), 'previewEventTime');
        return addEls(makeEl('div'), [eventTime, eventName]);
    };
    
    var getEventLabelText = function(event, showStoryName, index, disableHeaders){
        if(disableHeaders){
            return addEl(makeEl('h4'), makeText(strFormat(getL10n('briefings-event-header'), [index])));
        } else {
            return addEl(makeEl('h4'), getEventHeaderDiv(event, showStoryName));
        }
    };
    
    var showEvent = function(event, characterName, opts, flags){
        var eventDiv = makeEl('div');
        var isAdaptationsMode = flags.isAdaptationsMode;
        var originText = event.text;
        var adaptationText = event.characters[characterName].text;
        var isOriginEditable = !!opts.userStoryNamesMap[event.storyName];
        var isAdaptationEditable = opts.areAdaptationsEditable[event.storyName + "-" + characterName];
        var isAdaptationEmpty = adaptationText === "";
        var els = [];
        
        els.push(getEventLabelText(event, opts.showStoryName, opts.index, flags.disableHeaders));
        els.push(makeText(getL10n('briefings-subjective-time')));
        els.push(UI.makeAdaptationTimeInput(event.storyName, event, characterName, isAdaptationEditable));
        
        var input;
        if(isAdaptationsMode || isAdaptationEmpty){
            // origin input
            input = makeEl("textarea");
            addClass(input, "briefingPersonalStory");
            setClassByCondition(input, "notEditable", !isOriginEditable);
            input.value = event.text;
            input.eventIndex = event.index;
            input.storyName = event.storyName;
            listen(input, "change", onChangeOriginText);
            attachTextareaResizer(input);
            
            var unlockButton = makeUnlockEventSourceButton(input, isOriginEditable);
            var originHolder = makeEl('div');
            addEls(originHolder, [addEl(makeEl('h5'), makeText(getL10n('briefings-origin'))), unlockButton, input]);
            els.push(originHolder);
        }
        
        if(isAdaptationsMode || !isAdaptationEmpty){
            // adaptation input
            input = makeEl("textarea");
            addClass(input, "briefingPersonalStory");
            setClassByCondition(input, "notEditable", !isAdaptationEditable);
            input.value = event.characters[characterName].text;
            input.characterName = characterName;
            input.eventIndex = event.index;
            input.storyName = event.storyName;
            listen(input, "change", onChangeAdaptationText);
            attachTextareaResizer(input);
            
            var adaptationHolder = makeEl('div');
            addEls(adaptationHolder, [addEl(makeEl('h5'), makeText(getL10n('briefings-adaptation'))), input]);
            els.push(adaptationHolder);
        }
        
        if(isAdaptationsMode){
            els.push(UI.makeAdaptationReadyInput(event.storyName, event, characterName, isAdaptationEditable));
        }
        els.push(makeEl("br"));
        
        addEls(eventDiv, els);
        return eventDiv;
    };
    
    var attachTextareaResizer = function(input){
        listen(input, 'keydown', UI.resizeTextarea);
        listen(input, 'paste', UI.resizeTextarea);
        listen(input, 'cut', UI.resizeTextarea);
        listen(input, 'change', UI.resizeTextarea);
        listen(input, 'drop', UI.resizeTextarea);
    };
    
    var makeUnlockEventSourceButton = function (input, isEditable) {
        input.setAttribute("disabled","disabled");
        var button = addEl(makeEl("button"), makeText(getL10n("briefings-unlock-event-source")));
        setClassByCondition(button, "notEditable", !isEditable);
        listen(button, "click", function(){
            input.removeAttribute("disabled");
        });
        return button;
    };
    
    var updateCharacterInventory = function (event) {
        var input = event.target;
        DBMS.updateCharacterInventory(input.storyName, input.characterName, input.value, Utils.processError());
    };
    
    var onChangeOriginText = function (event) {
        var storyName = event.target.storyName;
        var eventIndex = event.target.eventIndex;
        var text = event.target.value;
        DBMS.setEventOriginProperty(storyName, eventIndex, 'text', text, Utils.processError());
    };
    
    var onChangeAdaptationText = function (event) {
        var storyName = event.target.storyName;
        var eventIndex = event.target.eventIndex;
        var characterName = event.target.characterName;
        var text = event.target.value;
        DBMS.setEventAdaptationProperty(storyName, eventIndex, characterName, 'text', text, Utils.processError());
    };

})(this['BriefingPreview']={});