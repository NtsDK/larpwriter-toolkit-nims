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

var StoryEvents = {};

StoryEvents.init = function () {
    "use strict";
    var button = getEl("createEventButton");
    button.addEventListener("click", StoryEvents.createEvent);

    button = getEl("moveEventButton");
    button.addEventListener("click", StoryEvents.moveEvent);

    button = getEl("cloneEventButton");
    button.addEventListener("click", StoryEvents.cloneEvent);

    button = getEl("mergeEventButton");
    button.addEventListener("click", StoryEvents.mergeEvents);

    button = getEl("removeEventButton");
    button.addEventListener("click", StoryEvents.removeEvent);

    StoryEvents.content = getEl("storyEventsDiv");
};

StoryEvents.refresh = function () {
    "use strict";
    StoryEvents.clearInterface();
    if(Stories.CurrentStoryName === undefined){
        return;
    }
    
    PermissionInformer.isStoryEditable(Stories.CurrentStoryName, function(err, isStoryEditable){
    	if(err) {Utils.handleError(err); return;}
	    DBMS.getMetaInfo(function(err, metaInfo){
	    	if(err) {Utils.handleError(err); return;}
	        DBMS.getStoryEvents(Stories.CurrentStoryName, function(err, events){
	        	if(err) {Utils.handleError(err); return;}
	            StoryEvents.rebuildInterface(events, metaInfo);
	            Utils.enable(StoryEvents.content, "isStoryEditable", isStoryEditable);
	            Stories.chainRefresh();
	        });
	    });
    });
};

StoryEvents.clearInterface = function(){
    clearEl(getEl("eventBlockHead"));
    clearEl(getEl("eventBlock"));
    var positionSelectors = nl2array(document.querySelectorAll(".eventPositionSelector"));
    R.ap([clearEl], positionSelectors);
    var selectorArr = nl2array(document.querySelectorAll(".eventEditSelector"));
    R.ap([clearEl], selectorArr);
};

StoryEvents.rebuildInterface = function(events, metaInfo){
    "use strict";
    	
	// event part
	var tableHead = clearEl(getEl("eventBlockHead"));
	var table = clearEl(getEl("eventBlock"));
	
	addEl(tableHead, StoryEvents.getEventHeader());
	
	// refresh position selector
    var addOpt = R.curry(function(sel, text){
        addEl(sel, addEl(makeEl('option'), makeText(text)));
    });
	
	var option, addOptLoc;
	var positionSelectors = nl2array(document.querySelectorAll(".eventPositionSelector"));
	R.ap([clearEl], positionSelectors);
	positionSelectors.forEach(function (positionSelector) {
	    addOptLoc = addOpt(positionSelector);
        
		events.forEach(function (event) {
		    addOptLoc(strFormat(getL10n("common-set-item-before"), [event.name]));
		});
		
        addOptLoc(getL10n("common-set-item-as-last"));
		
		positionSelector.selectedIndex = events.length;
	});
	
	R.ap([addEl(table)], events.map(function (event, i) {
		return StoryEvents.appendEventInput(event, i, metaInfo.date, metaInfo.preGameDate);
	}));
	
	StoryEvents.eventsLength = events.length;
	
	// refresh swap selector
	var selectorArr = nl2array(document.querySelectorAll(".eventEditSelector"));
	R.ap([clearEl], selectorArr);
	
	events.forEach(function (event, i) {
		selectorArr.forEach(function (selector) {
			option = makeEl("option");
			option.appendChild(makeText(event.name));
			option.eventIndex = i;
			selector.appendChild(option);
		});
	});
};

StoryEvents.createEvent = function () {
    "use strict";
    var eventNameInput = getEl("eventNameInput");
    var eventName = eventNameInput.value.trim();
    var eventTextInput = getEl("eventTextInput");
    var positionSelector = getEl("positionSelector");
    var eventText = eventTextInput.value.trim();

    if (eventName === "") {
        Utils.alert(getL10n("stories-event-name-is-not-specified"));
        return;
    }
    if (eventText === "") {
        Utils.alert(getL10n("stories-event-text-is-empty"));
        return;
    }
    
    DBMS.createEvent(Stories.CurrentStoryName, eventName, eventText, positionSelector.value === getL10n("common-set-item-as-last"), 
		positionSelector.selectedIndex, function(err){
        	if(err) {Utils.handleError(err); return;}
        	eventNameInput.value = "";
        	eventTextInput.value = "";
        	StoryEvents.refresh();
    	});
};

StoryEvents.moveEvent = function () {
	var index = getEl("moveEventSelector").selectedOptions[0].eventIndex;
	var newIndex = getEl("movePositionSelector").selectedIndex;
	
	if (index === newIndex) {
	  Utils.alert(getL10n("stories-event-positions-are-the-same"));
	  return;
	}
	
	DBMS.moveEvent(Stories.CurrentStoryName, index, newIndex, Utils.processError(StoryEvents.refresh));
};

StoryEvents.cloneEvent = function () {
    "use strict";
    var index = getEl("cloneEventSelector").selectedIndex;
    
    DBMS.cloneEvent(Stories.CurrentStoryName, index, Utils.processError(StoryEvents.refresh));
};

StoryEvents.mergeEvents = function () {
    "use strict";
    var index = getEl("mergeEventSelector").selectedIndex;
    if (StoryEvents.eventsLength == index + 1) {
        Utils.alert(getL10n("stories-cant-merge-last-event"));
        return;
    }
    
    DBMS.mergeEvents(Stories.CurrentStoryName, index, Utils.processError(StoryEvents.refresh));
};

StoryEvents.removeEvent = function () {
    "use strict";
    var sel = getEl("removeEventSelector")
    if (Utils.confirm(strFormat(getL10n("stories-remove-event-warning"), [sel.value]))) {
        DBMS.removeEvent(Stories.CurrentStoryName, sel.selectedIndex, Utils.processError(StoryEvents.refresh));
    }
};

StoryEvents.getEventHeader = function () {
    "use strict";
    var tr = makeEl("tr");
    addEl(tr, addEl(makeEl('th'), makeText("№")));
    addEl(tr, addEl(makeEl('th'), makeText(getL10n("stories-event"))));
    return tr;
};

StoryEvents.appendEventInput = function (event, index, date, preGameDate) {
    "use strict";
    var tr = makeEl("tr");
    
    // first col - event number
    addEl(tr, addEl(makeEl("td"), addEl(makeEl("span"), makeText(index+1))));
    
    // second col
    var td = makeEl("td");
    
    var divMain =  addClass(makeEl("div") ,"story-events-div-main");
    var divLeft =  addClass(makeEl("div") ,"story-events-div-left");
    var divRight = addClass(makeEl("div"),"story-events-div-right");
    addEl(divMain, divLeft);
    addEl(divMain, divRight);
    addEl(td, divMain);
    
    addEl(divLeft, StoryEvents.makeEventNameInput(event, index));
    addEl(divRight, UI.makeEventTimePicker({
        eventTime : event.time,
        index : index,
        preGameDate : preGameDate,
        date : date,
        extraClasses : ["isStoryEditable"],
        onChangeDateTimeCreator : StoryEvents.onChangeDateTimeCreator
    }));
    addEl(td, StoryEvents.makeEventTextInput(event, index));
    addEl(tr, td);

    return tr;
};

StoryEvents.makeEventNameInput = function (event, index) {
    "use strict";
    var input = makeEl("input");
    addClass(input, "isStoryEditable");
    input.value = event.name;
    input.eventIndex = index;
    input.addEventListener("change", StoryEvents.updateEventName);
    return input;
};

StoryEvents.makeEventTextInput = function (event, index) {
    "use strict";
    var input = makeEl("textarea");
    addClass(input, "isStoryEditable");
    addClass(input, "eventText");
    input.value = event.text;
    input.eventIndex = index;
    input.addEventListener("change", StoryEvents.updateEventText);
    return input;
};


StoryEvents.onChangeDateTimeCreator = function (myInput) {
    "use strict";
    return function (dp, input) {
        DBMS.updateEventProperty(Stories.CurrentStoryName, myInput.eventIndex, "time", input.val(), Utils.processError());
        StoryEvents.lastDate = input.val();
        removeClass(myInput, "defaultDate");
    }
};

StoryEvents.updateEventName = function (event) {
    "use strict";
    var input = event.target;
    if (input.value.trim() === "") {
        Utils.alert(getL10n("stories-event-name-is-not-specified"));
        StoryEvents.refresh();
        return;
    }

    DBMS.updateEventProperty(Stories.CurrentStoryName, input.eventIndex, "name", input.value, Utils.processError(StoryEvents.refresh));
};

StoryEvents.updateEventText = function (event) {
    "use strict";
    var input = event.target;
    if (input.value.trim() === "") {
        Utils.alert(getL10n("stories-event-text-is-empty"));
        StoryEvents.refresh();
        return;
    }
    DBMS.updateEventProperty(Stories.CurrentStoryName, input.eventIndex, "text", input.value, Utils.processError());
};
