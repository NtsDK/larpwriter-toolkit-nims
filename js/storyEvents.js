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

StoryEvents.rebuildInterface = function(events, metaInfo){
    "use strict";
    	
	// event part
	var tableHead = getEl("eventBlockHead");
	clearEl(tableHead);
	var table = getEl("eventBlock");
	clearEl(table);
	
	addEl(tableHead, StoryEvents.getEventHeader());
	
	// refresh position selector
	var positionSelectors = [];
	
	positionSelectors.push(getEl("positionSelector"));
	positionSelectors.push(getEl("movePositionSelector"));
	
	positionSelectors.forEach(function (selector) {
		clearEl(selector);
	});
	
    var addOpt = R.curry(function(sel, text){
        addEl(sel, addEl(makeEl('option'), makeText(text)));
    });
	
	var option, addOptLoc;
	positionSelectors.forEach(function (positionSelector) {
	    
	    addOptLoc = addOpt(positionSelector);
        
		events.forEach(function (event) {
		    addOptLoc(strFormat(getL10n("common-set-item-before"), [event.name]));
		});
		
        addOptLoc(getL10n("common-set-item-as-last"));
		
		positionSelector.selectedIndex = events.length;
	});
	
	events.forEach(function (event, i) {
		StoryEvents.appendEventInput(table, event, i, metaInfo.date, metaInfo.preGameDate);
	});
	
	StoryEvents.eventsLength = events.length;
	
	// refresh swap selector
	var selectorArr = [];
	
	selectorArr.push(getEl("moveEventSelector"));
	selectorArr.push(getEl("removeEventSelector"));
	selectorArr.push(getEl("cloneEventSelector"));
	selectorArr.push(getEl("mergeEventSelector"));
	
	selectorArr.forEach(function (selector) {
		clearEl(selector);
	});
	
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

StoryEvents.appendEventInput = function (table, event, index, date, preGameDate) {
    "use strict";
    var tr, td, span, input;
    
    tr = makeEl("tr");
    table.appendChild(tr);
    
    // event number
    td = makeEl("td");
    tr.appendChild(td);
    span = makeEl("span");
    span.appendChild(makeText(index+1));
    td.appendChild(span);
    
    // event name
    td = makeEl("td");
    tr.appendChild(td);
    
    var divMain, divLeft, divRight;
    divMain = makeEl("div");
    divLeft = makeEl("div");
    divRight = makeEl("div");
    addClass(divMain ,"story-events-div-main");
    addClass(divLeft ,"story-events-div-left");
    addClass(divRight,"story-events-div-right");
    divMain.appendChild(divLeft);
    divMain.appendChild(divRight);
    td.appendChild(divMain);
    
    input = makeEl("input");
    addClass(input, "isStoryEditable");
    input.value = event.name;
    input.eventIndex = index;
    input.addEventListener("change", StoryEvents.updateEventName);
    divLeft.appendChild(input);

    // event datetime picker
    input = makeEl("input");
    addClass(input, "isStoryEditable");
    addClass(input, "eventTime");
    input.value = event.time;
    
    input.eventIndex = index;
    
    var opts = {
        lang : "ru",
        mask : true,
        startDate : new Date(preGameDate),
        endDate : new Date(date),
        onChangeDateTime : StoryEvents.onChangeDateTimeCreator(input),
    };
    
    if (event.time !== "") {
        opts.value = event.time;
    } else {
        opts.value = date;
        addClass(input, "defaultDate");
    }
    
    jQuery(input).datetimepicker(opts);
    
    divRight.appendChild(input);

    input = makeEl("textarea");
    addClass(input, "isStoryEditable");
    addClass(input, "eventText");
    input.value = event.text;
    input.eventIndex = index;
    input.addEventListener("change", StoryEvents.updateEventText);
    td.appendChild(input);

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
