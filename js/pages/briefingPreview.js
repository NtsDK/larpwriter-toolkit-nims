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
    button.addEventListener("change", BriefingPreview.refresh);
    button.checked = true;

    listen(getEl("eventGroupingByTimeRadio"), "change", BriefingPreview.refresh);
    
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
                $("#briefingCharacter").select2(data).val(characterName).trigger('change');
	            
	            BriefingPreview.buildContent(characterName);
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

    addEl(content, makeText(strFormat(getL10n("briefings-character-label"), [characterName])));
    var addNodes = function(arr){
        arr.forEach(addEl(content));
    };
    addNodes([makeEl('br'), makeEl('br')]);

    DBMS.getProfile(characterName, function(err, profile){
    	if(err) {Utils.handleError(err); return;}
        BriefingPreview.showProfile(content, profile);
        addNodes([makeEl('br'), makeEl('br'), makeText(getL10n("briefings-inventory")), makeEl('br')]);
        
        DBMS.getAllInventoryLists(characterName, function(err, allInventoryLists){
        	if(err) {Utils.handleError(err); return;}
        	PermissionInformer.getStoryNamesArray(true, function(err, userStoryNames){
        		if(err) {Utils.handleError(err); return;}
        		var userStoryNamesMap = {};
        		userStoryNames.forEach(function(story){
        			userStoryNamesMap[story.value] = story;
        		});
        		
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
        			
        			addNodes([makeText(elem.storyName + ":"), input, makeEl('br')]);
        		});
        		
        		addNodes([makeEl('br'), makeEl('br'), makeText(getL10n("briefings-events")), makeEl('br')]);
        		
        		var groupingByStory = getEl("eventGroupingByStoryRadio").checked;
        		if (groupingByStory) {
        			BriefingPreview.showEventsByStory(content, characterName, userStoryNamesMap);
        		} else {
        			BriefingPreview.showEventsByTime(content, characterName, userStoryNamesMap);
        		}
        		Utils.enable(BriefingPreview.content, "notEditable", false);
        	});
        });
    });
};

BriefingPreview.showProfile = function(content, profile){
    "use strict";
    var span;
    
    BriefingPreview.profileSettings.forEach(function (element) {
        if(!element.doExport){
            return;
        }
        content.appendChild(makeText(element.name + ": "));
        switch (element.type) {
        case "text":
            content.appendChild(makeEl("br"));
            span = makeEl("span");
            addClass(span, "briefingTextSpan");
            span.appendChild(makeText(profile[element.name]));
            content.appendChild(span);
            content.appendChild(makeEl("br"));
            break;
        case "enum":
        case "number":
        case "string":
            content.appendChild(makeText(profile[element.name]));
            content.appendChild(makeEl("br"));
            break;
        case "checkbox":
            content.appendChild(makeText(constL10n(Constants[profile[element.name]])));
            content.appendChild(makeEl("br"));
            break;
        }
    });
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
    		allEvents.forEach(function (event) {
    			BriefingPreview.showEvent(event, content, characterName, userStoryNamesMap, areAdaptationsEditable);
    		});
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
	        eventGroups.forEach(function(elem){
	            content.appendChild(makeText(elem.storyName));
	            content.appendChild(makeEl("br"));
	            
	            elem.events.forEach(function(event){
	                BriefingPreview.showEvent(event, content, characterName, userStoryNamesMap, areAdaptationsEditable);
	            });
	            Utils.enable(BriefingPreview.content, "notEditable", false);
	        });
    	});
    });
};

BriefingPreview.showEvent = function(event, content, characterName, userStoryNamesMap, areAdaptationsEditable){
    var isOriginal = event.characters[characterName].text === "";
    var type = isOriginal ? getL10n("briefings-event-source") : getL10n("briefings-adaptation");
    var isEditable;
    if(isOriginal){
    	isEditable = !!userStoryNamesMap[event.storyName];
    } else {
    	isEditable = areAdaptationsEditable[event.storyName + "-" + characterName];
    }
    
    var time = event.characters[characterName].time === "" ? event.time : event.characters[characterName].time;
    content.appendChild(makeText(time + " " + event.name + ": " + type));
    var input = makeEl("textarea");
    addClass(input, "briefingPersonalStory");
    if(!isEditable){
    	addClass(input, "notEditable");
    }

    if(isOriginal){
        input.setAttribute("disabled","disabled");
        var button = makeEl("button");
        if(!isEditable){
        	addClass(button, "notEditable");
        }
        content.appendChild(makeEl("br"));
        button.appendChild(makeText(getL10n("briefings-unlock-event-source")));
        content.appendChild(button);
        button.addEventListener("click", function(){
            input.removeAttribute("disabled");
        });
    }
    
    content.appendChild(makeEl("br"));
    
    if (isOriginal) {
        input.value = event.text;
    } else {
        input.value = event.characters[characterName].text;
        input.characterName = characterName;
    }
    input.eventIndex = event.index;
    input.storyName = event.storyName;
    
    input.addEventListener("change", BriefingPreview.onChangePersonalStory);
    content.appendChild(input);
    
    content.appendChild(makeEl("br"));
    content.appendChild(makeEl("br"));  
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