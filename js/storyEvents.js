StoryEvents = {};

StoryEvents.init = function() {
    var button = document.getElementById("createEventButton");
    button.addEventListener("click", StoryEvents.createEvent);

    var button = document.getElementById("swapEventsButton");
    button.addEventListener("click", StoryEvents.swapEvents);

    var button = document.getElementById("cloneEventButton");
    button.addEventListener("click", StoryEvents.cloneEvent);

    var button = document.getElementById("mergeEventButton");
    button.addEventListener("click", StoryEvents.mergeEvents);

    var button = document.getElementById("removeEventButton");
    button.addEventListener("click", StoryEvents.removeEvent);

    StoryEvents.content = document.getElementById("storyEventsDiv");
};

StoryEvents.refresh = function() {

    // event part
    var table = document.getElementById("eventBlock");
    removeChildren(table);

    StoryEvents.appendEventHeader(table);

    for (var i = 0; i < Stories.CurrentStory.events.length; ++i) {
        StoryEvents.appendEventInput(table, Stories.CurrentStory.events[i],
                i + 1);
    }

    // refresh position selector
    var positionSelector = document.getElementById("positionSelector");
    removeChildren(positionSelector);

    for (var i = 0; i < Stories.CurrentStory.events.length; i++) {
        var option = document.createElement("option");
        option.appendChild(document.createTextNode("Перед " + (i + 1)));
        positionSelector.appendChild(option);
    }

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

    for (var i = 0; i < selectorArr.length; i++) {
        removeChildren(selectorArr[i]);
    }

    for (var i = 0; i < Stories.CurrentStory.events.length; i++) {
        for (var j = 0; j < selectorArr.length; j++) {
            var option = document.createElement("option");
            option.appendChild(document.createTextNode((i + 1)));
            selectorArr[j].appendChild(option);
        }
    }

};

StoryEvents.createEvent = function() {
    var eventName = document.getElementById("eventNameInput").value.trim();
    var input = document.getElementById("eventInput");
    var eventText = input.value.trim();

    if (eventName === "") {
        alert("Название события не указано");
        return;
    }
    if (eventText === "") {
        alert("Событие пусто");
        return;
    }

    var event = {
        name : eventName,
        text : eventText,
        time : "",
        characters : {}
    }

    var positionSelector = document.getElementById("positionSelector");

    var position = positionSelector.value;
    if (position === "В конец") {
        Stories.CurrentStory.events.push(event);
    } else {
        Stories.CurrentStory.events.splice(positionSelector.selectedIndex, 0,
                event);
    }

    StoryEvents.refresh();
};

StoryEvents.swapEvents = function() {
    var index1 = document.getElementById("firstEvent").selectedIndex;
    var index2 = document.getElementById("secondEvent").selectedIndex;
    if (index1 === index2) {
        alert("Позиции событий совпадают");
        return;
    }

    var tmp = Stories.CurrentStory.events[index1];
    Stories.CurrentStory.events[index1] = Stories.CurrentStory.events[index2];
    Stories.CurrentStory.events[index2] = tmp;

    StoryEvents.refresh();
};

StoryEvents.cloneEvent = function() {
    var index = document.getElementById("cloneEventSelector").selectedIndex;
    var event = Stories.CurrentStory.events[index];
    var copy = clone(event);

    Stories.CurrentStory.events.splice(index, 0, event);
    StoryEvents.refresh();
};

StoryEvents.mergeEvents = function() {
    var index = document.getElementById("mergeEventSelector").selectedIndex;
    if (!Stories.CurrentStory.events[index + 1]) {
        alert("Событие объединяется со следующим событием. Последнее событие не с кем объединять.");
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

StoryEvents.removeEvent = function() {
    var index = document.getElementById("removeEventSelector").selectedIndex;

    if (confirm("Вы уверены, что хотите удалить событие " + name
            + "? Все данные связанные с событием будут удалены безвозвратно.")) {
        Stories.CurrentStory.events.remove(index);
        StoryEvents.refresh();
    }
};

StoryEvents.appendEventHeader = function(table) {
    var tr = document.createElement("tr");
    table.appendChild(tr);
    var td = document.createElement("th");
    tr.appendChild(td);
    td.appendChild(document.createTextNode("№"));
    var td = document.createElement("th");
    tr.appendChild(td);
    td.appendChild(document.createTextNode("Событие"));

    var td = document.createElement("td");
    tr.appendChild(td);
    td.appendChild(document.createTextNode("Время"));
};

StoryEvents.appendEventInput = function(table, event, index) {
    var tr = document.createElement("tr");
    table.appendChild(tr);
    var td = document.createElement("td");
    tr.appendChild(td);
    var span = document.createElement("span");
    span.appendChild(document.createTextNode(index));
    td.appendChild(span);
    var td = document.createElement("td");
    tr.appendChild(td);
    var input = document.createElement("input");
    input.value = event.name;
    input.eventInfo = event;
    input.addEventListener("change", StoryEvents.updateEventName);
    td.appendChild(input);

    td.appendChild(document.createElement("br"));

    var input = document.createElement("textarea");
    input.className = "eventText";
    input.value = event.text;
    input.eventInfo = event;
    input.addEventListener("change", StoryEvents.updateEventText);
    td.appendChild(input);

    var td = document.createElement("td");
    tr.appendChild(td);
    var input = document.createElement("input");
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

    td.appendChild(input);
};

StoryEvents.onChangeDateTimeCreator = function(myInput) {
    return function(dp, input) {
        myInput.eventInfo.time = input.val();
        StoryEvents.lastDate = input.val();
        myInput.className = "eventTime";
    }
};

StoryEvents.updateEventName = function(event) {
    event.target.eventInfo.name = event.target.value;
};

StoryEvents.updateEventText = function(event) {
    event.target.eventInfo.text = event.target.value;
};

StoryEvents.updateTime = function(event) {
    event.target.eventInfo.time = event.target.value;
};