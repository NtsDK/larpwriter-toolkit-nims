/*global
 Utils, Database, DBMS
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
    // event part
    var tableHead = document.getElementById("eventBlockHead");
    Utils.removeChildren(tableHead);
    var table = document.getElementById("eventBlock");
    Utils.removeChildren(table);

    StoryEvents.appendEventHeader(tableHead);

    // refresh position selector
    var positionSelector = document.getElementById("positionSelector");
    Utils.removeChildren(positionSelector);
    
    if(Stories.CurrentStory === undefined){
        return;
    }

    Stories.CurrentStory.events.forEach(function (event, i) {
//        StoryEvents.appendEventInput(table, event, event.name);
        StoryEvents.appendEventInput(table, event, i + 1);
    });

    Stories.CurrentStory.events.forEach(function (event, i) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode("Перед '" + event.name + "'"));
//        option.appendChild(document.createTextNode("Перед " + (i + 1)));
        positionSelector.appendChild(option);
    });

    var option = document.createElement("option");
    option.appendChild(document.createTextNode("В конец"));
    positionSelector.appendChild(option);

    positionSelector.selectedIndex = Stories.CurrentStory.events.length;

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

    Stories.CurrentStory.events.forEach(function (event, i) {
        selectorArr.forEach(function (selector) {
            option = document.createElement("option");
            option.appendChild(document.createTextNode(event.name));
//            option.appendChild(document.createTextNode(i + 1));
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

    var event = {
        name : eventName,
        text : eventText,
        time : "",
        characters : {}
    };

    var positionSelector = document.getElementById("positionSelector");

    var position = positionSelector.value;
    if (position === "В конец") {
        Stories.CurrentStory.events.push(event);
    } else {
        Stories.CurrentStory.events.splice(positionSelector.selectedIndex, 0, event);
    }

    StoryEvents.refresh();
};

StoryEvents.swapEvents = function () {
    "use strict";
    var index1 = document.getElementById("firstEvent").selectedIndex;
    var index2 = document.getElementById("secondEvent").selectedIndex;
    if (index1 === index2) {
        Utils.alert("Позиции событий совпадают");
        return;
    }

    var tmp = Stories.CurrentStory.events[index1];
    Stories.CurrentStory.events[index1] = Stories.CurrentStory.events[index2];
    Stories.CurrentStory.events[index2] = tmp;

    StoryEvents.refresh();
};

StoryEvents.cloneEvent = function () {
    "use strict";
    var index = document.getElementById("cloneEventSelector").selectedIndex;
    var event = Stories.CurrentStory.events[index];
    var copy = Utils.clone(event);

    Stories.CurrentStory.events.splice(index, 0, event);
    StoryEvents.refresh();
};

StoryEvents.mergeEvents = function () {
    "use strict";
    var index = document.getElementById("mergeEventSelector").selectedIndex;
    if (!Stories.CurrentStory.events[index + 1]) {
        Utils.alert("Событие объединяется со следующим событием. Последнее событие не с кем объединять.");
        return;
    }

    var event1 = Stories.CurrentStory.events[index];
    var event2 = Stories.CurrentStory.events[index + 1];

    event1.name += event2.name;
    event1.text += event2.text;
    for ( var characterName in event2.characters) {
        if (event1.characters[characterName]) {
            event1.characters[characterName].text += event2.characters[characterName].text;
            event1.characters[characterName].ready = false;
        } else {
            event1.characters[characterName] = event2.characters[characterName];
        }
    }
    Stories.CurrentStory.events.remove(index + 1);
    StoryEvents.refresh();
};

StoryEvents.removeEvent = function () {
    "use strict";
    var index = document.getElementById("removeEventSelector").selectedIndex;

    if (Utils.confirm("Вы уверены, что хотите удалить событие " + name
            + "? Все данные связанные с событием будут удалены безвозвратно.")) {
        Stories.CurrentStory.events.remove(index);
        StoryEvents.refresh();
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

//        td = document.createElement("th");
//        td.appendChild(document.createTextNode("Время"));
//        tr.appendChild(td);
    table.appendChild(tr);
};

StoryEvents.appendEventInput = function (table, event, index) {
    "use strict";
    var tr, td, span, input;
    
    tr = document.createElement("tr");
    table.appendChild(tr);
    
    // event number
    td = document.createElement("td");
    tr.appendChild(td);
    span = document.createElement("span");
    span.appendChild(document.createTextNode(index));
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
    input.eventInfo = event;
    input.addEventListener("change", StoryEvents.updateEventName);
//    td.appendChild(input);
    divLeft.appendChild(input);

    // event datetime picker
    input = document.createElement("input");
    input.value = event.time;
    input.className = "eventTime";
    
    input.eventInfo = event;
    
    var opts = {
            lang : "ru",
            mask : true,
            startDate : new Date(Database.Meta.preGameDate),
            endDate : new Date(Database.Meta.date),
            onChangeDateTime : StoryEvents.onChangeDateTimeCreator(input),
    };
    
    if (event.time !== "") {
        opts.value = event.time;
    } else {
        opts.value = Database.Meta.date;
        input.className = "eventTime defaultDate";
    }
    
    jQuery(input).datetimepicker(opts);
    
//    td.appendChild(input);
    divRight.appendChild(input);
//    td.appendChild(document.createElement("br"));

    // event text
    input = document.createElement("textarea");
    input.className = "eventText";
    input.value = event.text;
    input.eventInfo = event;
    input.addEventListener("change", StoryEvents.updateEventText);
    td.appendChild(input);

//    td = document.createElement("td");
//    tr.appendChild(td);
};

StoryEvents.onChangeDateTimeCreator = function (myInput) {
    "use strict";
    return function (dp, input) {
        myInput.eventInfo.time = input.val();
        StoryEvents.lastDate = input.val();
        myInput.className = "eventTime";
    }
};

StoryEvents.updateEventName = function (event) {
    "use strict";
    event.target.eventInfo.name = event.target.value;
};

StoryEvents.updateEventText = function (event) {
    "use strict";
    event.target.eventInfo.text = event.target.value;
};

StoryEvents.updateTime = function (event) {
    "use strict";
    event.target.eventInfo.time = event.target.value;
};