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

var BriefingPreview = {};

BriefingPreview.init = function () {
    "use strict";
    
    $("#briefingCharacter").select2().on("change", BriefingPreview.buildContentDelegate);

    var button = getEl("eventGroupingByStoryRadio");
    listen(button, "change", BriefingPreview.refresh);
    button.checked = true;
    
    button = getEl("adaptationsModeRadio");
    listen(button, "change", BriefingPreview.refresh);
    button.checked = true;

    listen(getEl("eventGroupingByTimeRadio"), "change", BriefingPreview.refresh);
    listen(getEl("proofreadingModeRadio"), "change", BriefingPreview.refresh);
    listen(getEl("hideAllPanelsCheckbox"), "change", BriefingPreview.refresh);
    listen(getEl("disableHeadersCheckbox"), "change", BriefingPreview.refresh);
    
    BriefingPreview.content = getEl("briefingPreviewDiv");
};

BriefingPreview.refresh = function () {
    "use strict";
    clearEl(getEl("briefingCharacter"));
    clearEl(getEl("briefingContent"));
    
    DBMS.getAllProfileSettings(function(err, profileSettings){
        if(err) {Utils.handleError(err); return;}
        BriefingPreview.profileSettings = profileSettings;
        PermissionInformer.getCharacterNamesArray(false, function(err, names){
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
    
};

BriefingPreview.buildContentDelegate = function (event) {
    "use strict";
    BriefingPreview.buildContent(event.target.value);
};

BriefingPreview.updateSettings = function (characterName) {
    "use strict";
    var settings = DBMS.getSettings();
    settings["BriefingPreview"].characterName = characterName;
};

BriefingPreview.buildContent = function (characterName) {
    "use strict";
    BriefingPreview.updateSettings(characterName);
    var content = clearEl(getEl("briefingContent"));

    var addNodes = function(arr){
        arr.forEach(addEl(content));
    };

    DBMS.getProfile(characterName, function(err, profile){
        if(err) {Utils.handleError(err); return;}
        
        DBMS.getAllInventoryLists(characterName, function(err, allInventoryLists){
            if(err) {Utils.handleError(err); return;}
            
            DBMS.getCharacterGroupTexts(characterName, function(err, groupTexts){
                if(err) {Utils.handleError(err); return;}
                
                PermissionInformer.getStoryNamesArray(true, function(err, userStoryNames){
                    if(err) {Utils.handleError(err); return;}
                    
                    addEl(content, BriefingPreview.makePanel(makeText(getL10n('briefings-profile')), 
                            BriefingPreview.makeProfileContent(profile)));
                    
                    var userStoryNamesMap = {};
                    userStoryNames.forEach(function(story){
                        userStoryNamesMap[story.value] = story;
                    });
    
                    addEl(content, BriefingPreview.makePanel(makeText(getL10n("briefings-inventory") + ' (' + allInventoryLists.length + ')'), 
                            BriefingPreview.makeInventoryContent(allInventoryLists, characterName, userStoryNamesMap)));

                    addEl(content, BriefingPreview.makePanel(makeText(getL10n("header-groups") + ' (' + groupTexts.length + ')'), 
                            BriefingPreview.makeGroupContent(groupTexts)));
                    
                    var groupingByStory = getEl("eventGroupingByStoryRadio").checked;
                    if (groupingByStory) {
                        BriefingPreview.showEventsByStory(content, characterName, userStoryNamesMap);
                    } else {
                        BriefingPreview.showEventsByTime(content, characterName, userStoryNamesMap);
                    }
                });
            });
        });
    });
};

BriefingPreview.onBuildContentFinish = function(){
    "use strict";
    BriefingPreview.refreshTextAreas();
    Utils.enable(BriefingPreview.content, "notEditable", false);
};
    
BriefingPreview.refreshTextAreas = function(){
    "use strict";
    R.ap([UI.resizeTextarea], nl2array(getEl("briefingContent").getElementsByTagName('textarea')).map(function(el){
        return {target:el};
    }));
};

BriefingPreview.makePanel = function(title, content){
    "use strict";
    var panel = addClasses(makeEl('div'), ["panel", "panel-default"]);
    var h3 = addClass(addEl(makeEl('h3'), title), "panel-title");
    var a = setAttr(makeEl('a'),'href','#/');
    var headDiv = addClass(makeEl('div'), "panel-heading");
    addEl(panel, addEl(headDiv, addEl(a, h3)));
    var contentDiv = addClass(makeEl('div'), "panel-body");
    setClassByCondition(contentDiv, 'hidden', getEl('hideAllPanelsCheckbox').checked);
    addEl(panel, addEl(contentDiv, content));
    var panelToggler = UI.togglePanel(contentDiv);
    listen(a, "click", function(){
        panelToggler();
        BriefingPreview.refreshTextAreas()
    });
    
    return panel;
};

BriefingPreview.makeGroupContent = function(groupTexts){
    return addEls(makeEl('div'), groupTexts.map(function(groupText){
        var div = makeEl('div');
        addEl(div,addEl(makeEl('h4'), makeText(groupText.groupName)));
        var span = addEl(makeEl('span'), makeText(groupText.text));
        addClass(span, 'briefingTextSpan');
        return addEl(div, span);
    }));
};

BriefingPreview.makeInventoryContent = function(allInventoryLists, characterName, userStoryNamesMap){
    "use strict";
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
        input.addEventListener("change", BriefingPreview.updateCharacterInventory);
        
        addEl(inventoryDiv,BriefingPreview.makeTableRow(makeText(elem.storyName), input));
    });
    return addEl(addClasses(makeEl('table'), ['table','table-striped']), inventoryDiv);
};

BriefingPreview.makeTableRow = function(col1, col2){
    return addEls(makeEl('tr'), [addEl(makeEl('td'), col1), addEl(makeEl('td'),col2)]);
};

BriefingPreview.makeProfileContent = function(profile){
    "use strict";
    var profileDiv, name, value;
    profileDiv = makeEl('tbody');
    
    BriefingPreview.profileSettings.forEach(function (element) {
        if(!element.doExport){
            return;
        }
        name = makeText(element.name);
        switch (element.type) {
        case "text":
            value = addClass(makeEl("span"), "briefingTextSpan");
            addEl(value, makeText(profile[element.name]));
            break;
        case "enum":
        case "number":
        case "string":
            value = makeText(profile[element.name]);
            break;
        case "checkbox":
            value = makeText(constL10n(Constants[profile[element.name]]));
            break;
        }
        
        addEl(profileDiv,BriefingPreview.makeTableRow(name, value));
    });
    return addEl(addClasses(makeEl('table'), ['table','table-striped']), profileDiv);
};

BriefingPreview.showEventsByTime = function (content, characterName, userStoryNamesMap) {
    "use strict";
    
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
                    return BriefingPreview.showEvent(event, characterName, opts);
                }));
                
                var name;
                if(getEl('disableHeadersCheckbox').checked){
                    name = makeText(strFormat(getL10n('briefings-events-header'), [i*splitConstant+1, i*splitConstant+subPart.length]));
                } else {
                    name = addEls(makeEl('div'), subPart.map(function(event){
                        return BriefingPreview.getEventHeaderDiv(event, true);
                    }));
                }
                return BriefingPreview.makePanel(name, eventContent)
            }));
            BriefingPreview.onBuildContentFinish();
        });
    });
};

BriefingPreview.getStoryHeader = function(elem, i){
    "use strict";
    var name;
    if(getEl('disableHeadersCheckbox').checked){
        name = strFormat(getL10n('briefings-story-header'), [i+1]);
    } else {
        name = elem.storyName;
    }
    return makeText(name + ' ('+elem.events.length+')');
};

BriefingPreview.showEventsByStory = function (content, characterName, userStoryNamesMap) {
    "use strict";
    
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
                    return BriefingPreview.showEvent(event, characterName, opts);
                }));
                return BriefingPreview.makePanel(BriefingPreview.getStoryHeader(elem, i), storyContent);
            }));
            BriefingPreview.onBuildContentFinish();
        });
    });
};

BriefingPreview.getEventHeaderDiv = function(event, showStoryName){
    "use strict";
    var eventName = addEl(makeEl('span'), makeText(strFormat("{0} {1}", [showStoryName?event.storyName+":":"",event.name])));
    var eventTime = addClass(addEl(makeEl('span'), makeText(event.time)), 'previewEventTime');
    return addEls(makeEl('div'), [eventTime, eventName]);
};

BriefingPreview.getEventLabelText = function(event, showStoryName, index){
    "use strict";
    if(getEl('disableHeadersCheckbox').checked){
        return addEl(makeEl('h4'), makeText(strFormat(getL10n('briefings-event-header'), [index])));
    } else {
        return addEl(makeEl('h4'), BriefingPreview.getEventHeaderDiv(event, showStoryName));
    }
};

BriefingPreview.showEvent = function(event, characterName, opts){
    var eventDiv = makeEl('div');
    var isAdaptationsMode = getEl("adaptationsModeRadio").checked;
    var originText = event.text;
    var adaptationText = event.characters[characterName].text;
    var isOriginEditable = !!opts.userStoryNamesMap[event.storyName];
    var isAdaptationEditable = opts.areAdaptationsEditable[event.storyName + "-" + characterName];
    var isAdaptationEmpty = adaptationText === "";
    var els = [];
    
    els.push(BriefingPreview.getEventLabelText(event, opts.showStoryName, opts.index));
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
        listen(input, "change", BriefingPreview.onChangeOriginText);
        BriefingPreview.attachTextareaResizer(input);
        
        var unlockButton = BriefingPreview.makeUnlockEventSourceButton(input, isOriginEditable);
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
        listen(input, "change", BriefingPreview.onChangeAdaptationText);
        BriefingPreview.attachTextareaResizer(input);
        
        var adaptationHolder = makeEl('div');
        addEls(adaptationHolder, [addEl(makeEl('h5'), makeText(getL10n('briefings-adaptation'))), input, makeEl("br")]);
        els.push(adaptationHolder);
    }
    
    addEls(eventDiv, els);
    return eventDiv;
};

BriefingPreview.attachTextareaResizer = function(input){
    listen(input, 'keydown', UI.resizeTextarea);
    listen(input, 'paste', UI.resizeTextarea);
    listen(input, 'cut', UI.resizeTextarea);
    listen(input, 'change', UI.resizeTextarea);
    listen(input, 'drop', UI.resizeTextarea);
};

BriefingPreview.makeUnlockEventSourceButton = function (input, isEditable) {
    "use strict";
    input.setAttribute("disabled","disabled");
    var button = addEl(makeEl("button"), makeText(getL10n("briefings-unlock-event-source")));
    setClassByCondition(button, "notEditable", !isEditable);
    listen(button, "click", function(){
        input.removeAttribute("disabled");
    });
    return button;
};

BriefingPreview.updateCharacterInventory = function (event) {
    "use strict";
    var input = event.target;
    DBMS.updateCharacterInventory(input.storyName, input.characterName, input.value, Utils.processError());
};

BriefingPreview.onChangeOriginText = function (event) {
    var storyName = event.target.storyName;
    var eventIndex = event.target.eventIndex;
    var text = event.target.value;
    DBMS.setOriginEventText(storyName, eventIndex, text, Utils.processError());
};

BriefingPreview.onChangeAdaptationText = function (event) {
    var storyName = event.target.storyName;
    var eventIndex = event.target.eventIndex;
    var characterName = event.target.characterName;
    var text = event.target.value;
    DBMS.setAdaptationEventText(storyName, eventIndex, characterName, text, Utils.processError());
};