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
    var button = document.getElementById("createEventButton");
    button.addEventListener("click", StoryEvents.createEvent);

    button = document.getElementById("swapEventsButton");
    button.addEventListener("click", StoryEvents.swapEvents);

    button = document.getElementById("cloneEventButton");
    button.addEventListener("click", StoryEvents.cloneEvent);

    button = document.getElementById("mergeEventButton");
    button.addEventListener("click", StoryEvents.mergeEvents);

    button = document.getElementById("removeEventButton");
    button.addEventListener("click", StoryEvents.removeEvent);

    StoryEvents.content = document.getElementById("storyEventsDiv");
};

StoryEvents.refresh = function () {
    "use strict";
    if(Stories.CurrentStoryName === undefined){
        return;
    }
    
    DBMS.getMetaInfo(function(err, metaInfo){
    	if(err) {Utils.handleError(err); return;}
        DBMS.getStoryEvents(Stories.CurrentStoryName, function(err, events){
        	if(err) {Utils.handleError(err); return;}
            StoryEvents.rebuildInterface(events, metaInfo);
        });
    });
};

StoryEvents.rebuildInterface = function(events, metaInfo){
    "use strict";
    // event part
    var tableHead = document.getElementById("eventBlockHead");
    Utils.removeChildren(tableHead);
    var table = document.getElementById("eventBlock");
    Utils.removeChildren(table);

    StoryEvents.appendEventHeader(tableHead);

    // refresh position selector
    var positionSelector = document.getElementById("positionSelector");
    Utils.removeChildren(positionSelector);
    
    events.forEach(function (event, i) {
        StoryEvents.appendEventInput(table, event, i, metaInfo.date, metaInfo.preGameDate);
    });
    
    events.forEach(function (event, i) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode("Перед '" + event.name + "'"));
        positionSelector.appendChild(option);
    });
    
    var option = document.createElement("option");
    option.appendChild(document.createTextNode("В конец"));
    positionSelector.appendChild(option);
    
    positionSelector.selectedIndex = events.length;
    
    StoryEvents.eventsLength = events.length;
    
    // refresh swap selector
    var selectorArr = [];
    
    selectorArr.push(document.getElementById("firstEvent"));
    selectorArr.push(document.getElementById("secondEvent"));
    selectorArr.push(document.getElementById("removeEventSelector"));
    selectorArr.push(document.getElementById("cloneEventSelector"));
    selectorArr.push(document.getElementById("mergeEventSelector"));
    
    selectorArr.forEach(function (selector) {
        Utils.removeChildren(selector);
    });
    
    events.forEach(function (event, i) {
        selectorArr.forEach(function (selector) {
            option = document.createElement("option");
            option.appendChild(document.createTextNode(event.name));
            selector.appendChild(option);
        });
    });
};

StoryEvents.createEvent = function () {
    "use strict";
    var eventName = document.getElementById("eventNameInput").value.trim();
    var input = document.getElementById("eventInput");
    var eventText = input.value.trim();

    if (eventName === "") {
        Utils.alert("Название события не указано");
        return;
    }
    if (eventText === "") {
        Utils.alert("Событие пусто");
        return;
    }
    
    DBMS.createEvent(Stories.CurrentStoryName, eventName, eventText, 
            positionSelector.value === "В конец", positionSelector.selectedIndex, Utils.processError(StoryEvents.refresh));
};

StoryEvents.swapEvents = function () {
    "use strict";
    var index1 = document.getElementById("firstEvent").selectedIndex;
    var index2 = document.getElementById("secondEvent").selectedIndex;
    if (index1 === index2) {
        Utils.alert("Позиции событий совпадают");
        return;
    }
    
    DBMS.swapEvents(Stories.CurrentStoryName, index1, index2, Utils.processError(StoryEvents.refresh));
};

StoryEvents.cloneEvent = function () {
    "use strict";
    var index = document.getElementById("cloneEventSelector").selectedIndex;
    
    DBMS.cloneEvent(Stories.CurrentStoryName, index, Utils.processError(StoryEvents.refresh));
};

StoryEvents.mergeEvents = function () {
    "use strict";
    var index = document.getElementById("mergeEventSelector").selectedIndex;
    if (StoryEvents.eventsLength == index + 1) {
        Utils.alert("Выбранное событие объединяется со следующим событием. Последнее событие не с кем объединять.");
        return;
    }
    
    DBMS.mergeEvents(Stories.CurrentStoryName, index, Utils.processError(StoryEvents.refresh));
};

StoryEvents.removeEvent = function () {
    "use strict";
    var index = document.getElementById("removeEventSelector").selectedIndex;

    if (Utils.confirm("Вы уверены, что хотите удалить событие " + name
            + "? Все данные связанные с событием будут удалены безвозвратно.")) {
        
        DBMS.removeEvent(Stories.CurrentStoryName, index, Utils.processError(StoryEvents.refresh));
    }
};

StoryEvents.appendEventHeader = function (table) {
    "use strict";
    var tr = document.createElement("tr");
        var td = document.createElement("th");
        td.appendChild(document.createTextNode("№"));
        tr.appendChild(td);

        td = document.createElement("th");
        td.appendChild(document.createTextNode("Событие"));
        tr.appendChild(td);

    table.appendChild(tr);
};

StoryEvents.appendEventInput = function (table, event, index, date, preGameDate) {
    "use strict";
    var tr, td, span, input;
    
    tr = document.createElement("tr");
    table.appendChild(tr);
    
    // event number
    td = document.createElement("td");
    tr.appendChild(td);
    span = document.createElement("span");
    span.appendChild(document.createTextNode(index+1));
    td.appendChild(span);
    
    // event name
    td = document.createElement("td");
    tr.appendChild(td);
    
    var divMain, divLeft, divRight;
    divMain = document.createElement("div");
    divLeft = document.createElement("div");
    divRight = document.createElement("div");
    addClass(divMain ,"story-events-div-main");
    addClass(divLeft ,"story-events-div-left");
    addClass(divRight,"story-events-div-right");
    divMain.appendChild(divLeft);
    divMain.appendChild(divRight);
    td.appendChild(divMain);
    
    input = document.createElement("input");
    input.value = event.name;
    input.eventIndex = index;
    input.addEventListener("change", StoryEvents.updateEventName);
    divLeft.appendChild(input);

    // event datetime picker
    input = document.createElement("input");
    input.value = event.time;
    input.className = "eventTime";
    
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
        input.className = "eventTime defaultDate";
    }
    
    jQuery(input).datetimepicker(opts);
    
    divRight.appendChild(input);

    input = document.createElement("textarea");
    input.className = "eventText";
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
        myInput.className = "eventTime";
    }
};

StoryEvents.updateEventName = function (event) {
    "use strict";
    var input = event.target;
    DBMS.updateEventProperty(Stories.CurrentStoryName, input.eventIndex, "name", input.value, Utils.processError(StoryEvents.refresh));
};

StoryEvents.updateEventText = function (event) {
    "use strict";
    var input = event.target;
    DBMS.updateEventProperty(Stories.CurrentStoryName, input.eventIndex, "text", input.value, Utils.processError());
};

