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

    listen(getEl("eventGroupingByTimeRadio"), "change", BriefingPreview.refresh);
    listen(getEl("hideAllPanelsCheckbox"), "change", BriefingPreview.refresh);
    
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

//    addEl(content, makeText(strFormat(getL10n("briefings-character-label"), [characterName])));
//    addEl(content, addEl(makeEl('h2'),makeText(strFormat(getL10n("briefings-character-label"), [characterName]))));
    var addNodes = function(arr){
        arr.forEach(addEl(content));
    };
//    addNodes([makeEl('br'), makeEl('br')]);

    DBMS.getProfile(characterName, function(err, profile){
        if(err) {Utils.handleError(err); return;}
//        addEl(content, BriefingPreview.makeProfile(profile));
        addEl(content, BriefingPreview.makePanel(makeText('Досье'), BriefingPreview.makeProfileContent(profile)));
//        addNodes([makeEl('br'), makeEl('br'), makeText(getL10n("briefings-inventory")), makeEl('br')]);
        
        DBMS.getAllInventoryLists(characterName, function(err, allInventoryLists){
        	if(err) {Utils.handleError(err); return;}
        	PermissionInformer.getStoryNamesArray(true, function(err, userStoryNames){
        		if(err) {Utils.handleError(err); return;}
        		var userStoryNamesMap = {};
        		userStoryNames.forEach(function(story){
        			userStoryNamesMap[story.value] = story;
        		});
        		
        		addEl(content, BriefingPreview.makePanel(makeText(getL10n("briefings-inventory")), 
        		        BriefingPreview.makeInventoryContent(allInventoryLists, characterName, userStoryNamesMap)));
        		
//        		addNodes([makeEl('br'), makeEl('br'), makeText(getL10n("briefings-events")), makeEl('br')]);
        		
        		var groupingByStory = getEl("eventGroupingByStoryRadio").checked;
        		if (groupingByStory) {
        			BriefingPreview.showEventsByStory(content, characterName, userStoryNamesMap);
        		} else {
        			BriefingPreview.showEventsByTime(content, characterName, userStoryNamesMap);
        		}
//        		R.ap([UI.resizeTextarea], nl2array(content.getElementsByTagName('textarea')).map(function(el){
//        		    return {target:el};
//        		}));
        		BriefingPreview.refreshTextAreas();
//        		UI.resizeTextarea({target:input});
        		Utils.enable(BriefingPreview.content, "notEditable", false);
        	});
        });
    });
};

BriefingPreview.refreshTextAreas = function(){
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

BriefingPreview.makeInventoryContent = function(allInventoryLists, characterName, userStoryNamesMap){
    "use strict";
    var inventoryDiv;
//    inventoryDiv = makeEl('div');
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
        
//        addEls(inventoryDiv, [makeText(elem.storyName + ":"), input, makeEl('br')]);
        addEl(inventoryDiv,BriefingPreview.makeTableRow(makeText(elem.storyName), input));
    });
    return addEl(addClasses(makeEl('table'), ['table','table-striped']), inventoryDiv);
//    return inventoryDiv;
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
//BriefingPreview.makeProfileContent = function(profile){
//    "use strict";
//    var span, profileDiv;
//    profileDiv = makeEl('div');
//    
//    BriefingPreview.profileSettings.forEach(function (element) {
//        if(!element.doExport){
//            return;
//        }
//        addEl(profileDiv,makeText(element.name + ": "));
//        switch (element.type) {
//        case "text":
//            addEl(profileDiv,makeEl("br"));
//            span = makeEl("span");
//            addClass(span, "briefingTextSpan");
//            span.appendChild(makeText(profile[element.name]));
//            addEl(profileDiv,span);
//            break;
//        case "enum":
//        case "number":
//        case "string":
//            addEl(profileDiv,makeText(profile[element.name]));
//            break;
//        case "checkbox":
//            addEl(profileDiv,makeText(constL10n(Constants[profile[element.name]])));
//            break;
//        }
//        addEl(profileDiv,makeEl("br"));
//    });
//    return profileDiv;
//};

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
    		
    		addEls(content, R.splitEvery(5, allEvents).map(function(subPart){
    		    var eventContent = addEls(makeEl('div'), subPart.map(function (event) {
                  return BriefingPreview.showEvent(event, characterName, userStoryNamesMap, areAdaptationsEditable,true);
    		    }));
    		    
    		    var name = addEls(makeEl('div'), subPart.map(function(event){
//    		        return addEl(makeEl('div'), makeText(BriefingPreview.getEventLabel(event, true)));
    		        return BriefingPreview.getEventLabelDiv(event, true);
    		    }));
//    		    var eventLabel = BriefingPreview.getEventLabel(event, showStoryName);
    		    return BriefingPreview.makePanel(name, eventContent)
//    		    return BriefingPreview.makePanel(makeText(getL10n("briefings-events")), eventContent)
    		}));
    		
//    		var eventContent = addEls(makeEl('div'), allEvents.map(function (event) {
//    			return BriefingPreview.showEvent(event, characterName, userStoryNamesMap, areAdaptationsEditable,true);
//    		}));
//    		
//          addEl(content, BriefingPreview.makePanel(makeText(getL10n("briefings-events")), eventContent));
    		Utils.enable(BriefingPreview.content, "notEditable", false);
    	});
    });
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
    		
	        addEls(content, eventGroups.map(function(elem){
	            var storyContent = addEls(makeEl('div'), elem.events.map(function(event){
	                return BriefingPreview.showEvent(event, characterName, userStoryNamesMap, areAdaptationsEditable,false);
	            }));
	            return BriefingPreview.makePanel(makeText(elem.storyName +' ('+elem.events.length+')'), storyContent);
	        }));
	        Utils.enable(BriefingPreview.content, "notEditable", false);
    	});
    });
};

BriefingPreview.getEventLabelDiv = function(event, showStoryName){
    "use strict";
    var eventName = addEl(makeEl('span'), makeText(strFormat("{0} {1}", [showStoryName?event.storyName+":":"",event.name])));
    addClass(eventName, 'previewEventName');
    var eventTime = makeText("'" + event.time + "'");
    return addEls(makeEl('div'), [eventName, eventTime]);
//    return strFormat("{0} {1} '{2}'", [showStoryName?event.storyName+":":"",event.name, event.time]);
};

BriefingPreview.getEventLabelText = function(event, showStoryName){
    "use strict";
    return strFormat("{0} {1} '{2}'", [showStoryName?event.storyName+":":"",event.name, event.time]);
};

BriefingPreview.showEvent = function(event, characterName, userStoryNamesMap, areAdaptationsEditable, showStoryName){
    "use strict";
    var eventDiv = makeEl('div');
    var isOriginal = event.characters[characterName].text === "";
    var type = isOriginal ? getL10n("briefings-event-source") : getL10n("briefings-adaptation");
    var isEditable;
    if(isOriginal){
    	isEditable = !!userStoryNamesMap[event.storyName];
    } else {
    	isEditable = areAdaptationsEditable[event.storyName + "-" + characterName];
    }
    
//    var time = event.isTimeEmpty ? event.time : event.characters[characterName].time;
//    var eventLabel = strFormat("{0} // {1} {2}", [event.time, showStoryName?event.storyName+":":"",event.name]);
//    var eventLabel = strFormat("{0} {1} '{2}'", [showStoryName?event.storyName+":":"",event.name, event.time]);
    var eventLabel = BriefingPreview.getEventLabelText(event, showStoryName);
    addEl(eventDiv,addEl(makeEl('h4'), makeText(eventLabel)));
//    addEl(eventDiv,makeEl("br"));
//    addEl(eventDiv,makeText("Видимое время: " + time));
//    addEl(eventDiv,makeText("Выводимое персонажу время: " + time));
    
//    addEl(eventDiv,makeText("Выводимое персонажу время: " + event.characters[characterName].time));
    addEl(eventDiv,makeText("Выводимое персонажу время: "));
    addEl(eventDiv, UI.makeAdaptationTimeInput(event.storyName, event, characterName, areAdaptationsEditable[event.storyName + "-" + characterName]));
//    addEl(eventDiv,makeEl("br"));
//    addEl(eventDiv,makeText("Текст события: " + type));
    var input = makeEl("textarea");
    
//    var input = makeEl("div");
    addClass(input, "briefingPersonalStory");
//    setAttr(input, 'contentEditable', true);
    if(!isEditable){
    	addClass(input, "notEditable");
    }

    if(isOriginal){
        input.setAttribute("disabled","disabled");
        var button = makeEl("button");
        if(!isEditable){
        	addClass(button, "notEditable");
        }
        addEl(eventDiv,makeEl("br"));
        button.appendChild(makeText(getL10n("briefings-unlock-event-source")));
        addEl(eventDiv,button);
        button.addEventListener("click", function(){
            input.removeAttribute("disabled");
        });
    }
    
    addEl(eventDiv,makeEl("br"));
    
    if (isOriginal) {
        input.value = event.text;
    } else {
        input.value = event.characters[characterName].text;
        input.characterName = characterName;
    }
    input.eventIndex = event.index;
    input.storyName = event.storyName;
    
    input.addEventListener("change", BriefingPreview.onChangePersonalStory);
    listen(input, 'keydown', UI.resizeTextarea);
    listen(input, 'paste', UI.resizeTextarea);
    listen(input, 'cut', UI.resizeTextarea);
    listen(input, 'change', UI.resizeTextarea);
    listen(input, 'drop', UI.resizeTextarea);
    
//    listen(input, 'click', UI.resizeTextarea);
//    input.click();
//    UI.triggerEvent(input, 'keydown');
    addEl(eventDiv,input);
    
    addEl(eventDiv,makeEl("br"));
//    addEl(eventDiv,makeEl("br"));  
    return eventDiv;
};

BriefingPreview.updateCharacterInventory = function (event) {
    "use strict";
    var input = event.target;
    DBMS.updateCharacterInventory(input.storyName, input.characterName, input.value, Utils.processError());
};

BriefingPreview.onChangePersonalStory = function (event) {
    "use strict";
    var storyName = event.target.storyName;
    var eventIndex = event.target.eventIndex;
    var characterName = event.target.characterName;
    var text = event.target.value;
    DBMS.setEventText(storyName, eventIndex, characterName, text, Utils.processError());
};