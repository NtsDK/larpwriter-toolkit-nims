"use strict";

var BriefingExport = {};

BriefingExport.init = function () {
    var button = document.getElementById("makeBriefings");
    button.addEventListener("click", BriefingExport.makeTextBriefings);

    var button = document.getElementById("docxBriefings");
    button.addEventListener("change", BriefingExport.readTemplateFile);

    var button = document.getElementById("eventGroupingByStoryRadio2");
    button.checked = true;

    BriefingExport.content = document.getElementById("briefingExportDiv");
};

BriefingExport.refresh = function () {

};

BriefingExport.makeTextBriefings = function () {

    var data = BriefingExport.getBriefingData();

    var characterList = {};

    for (var i = 0; i < data.briefings.length; i++) {
        var briefingData = data.briefings[i];

        var briefing = "";

        briefing += briefingData.name + "\n\n";

        var regex = new RegExp('^profileInfo');

        Object.keys(briefingData).filter(function (element) {
            return regex.test(element);
        }).forEach(
                function (element) {
                    briefing += "----------------------------------\n";
                    briefing += element.substring("profileInfo.".length,
                            element.length)
                            + "\n";
                    briefing += briefingData[element] + "\n";
                    briefing += "----------------------------------\n\n";
                });

        briefing += "----------------------------------\n";
        briefing += "Инвентарь\n";
        briefing += briefingData.inventory + "\n";
        briefing += "----------------------------------\n\n";

        if (briefingData.storiesInfo) {
            for (var j = 0; j < briefingData.storiesInfo.length; j++) {
                var storyInfo = briefingData.storiesInfo[j];
                briefing += "----------------------------------\n";
                briefing += storyInfo.name + "\n\n";

                for (var k = 0; k < storyInfo.eventsInfo.length; k++) {
                    var event = storyInfo.eventsInfo[k];
                    briefing += event.time + ": " + event.text + "\n\n";
                }

                briefing += "----------------------------------\n\n";
            }
        }

        if (briefingData.eventsInfo) {
            briefing += "----------------------------------\n";

            for (var k = 0; k < briefingData.eventsInfo.length; k++) {
                var event = briefingData.eventsInfo[k];
                briefing += event.time + ": " + event.text + "\n\n";
            }

            briefing += "----------------------------------\n\n";
        }

        characterList[briefingData.name] = briefing;
    }

    var toSeparateFiles = document.getElementById("toSeparateFileCheckbox").checked;

    if (toSeparateFiles) {
        for ( var charName in characterList) {
            var blob = new Blob([ characterList[charName] ], {
                type : "text/plain;charset=utf-8"
            });
            saveAs(blob, charName + ".txt");
        }
    } else {
        var result = "";
        for ( var charName in characterList) {
            result += characterList[charName];
        }
        var blob = new Blob([ result ], {
            type : "text/plain;charset=utf-8"
        });
        saveAs(blob, "briefings.txt");
    }

};

BriefingExport.getBriefingData = function () {
    var data = {};

    var charArray = [];

    for ( var charName in Database.Characters) {
        var inventory = "";
        for ( var storyName in Database.Stories) {
            var story = Database.Stories[storyName];
            if (story.characters[charName]
                    && story.characters[charName].inventory
                    && story.characters[charName].inventory !== "") {
                inventory += story.characters[charName].inventory + ", ";
            }
        }

        var groupingByStory = document
                .getElementById("eventGroupingByStoryRadio2").checked;
        var profileInfo = BriefingExport.getProfileInfo(charName);

        if (groupingByStory) {
            var storiesInfo = BriefingExport.getStoriesInfo(charName);
        } else {
            var eventsInfo = BriefingExport.getEventsInfo(charName);
        }
        var dataObject = {
            "name" : charName,
            "inventory" : inventory,
            "storiesInfo" : storiesInfo,
            "eventsInfo" : eventsInfo
        };

        Object.keys(profileInfo).forEach(function (element) {
            dataObject["profileInfo." + element] = profileInfo[element];
        });

        charArray.push(dataObject);
    }

    data["briefings"] = charArray;
    return data;
};

BriefingExport.getProfileInfo = function (charName) {
    var character = Database.Characters[charName];
    var profileInfo = {};

    Database.ProfileSettings.forEach(function (element) {
        switch (element.type) {
        case "text":
        case "string":
        case "enum":
        case "number":
            profileInfo[element.name] = character[element.name];
            break;
        case "checkbox":
            profileInfo[element.name] = character[element.name] ? "Да" : "Нет";
            break;
        }
    });
    return profileInfo;
};

BriefingExport.getEventsInfo = function (charName) {
    var eventsInfo = [];
    for ( var storyName in Database.Stories) {
        var storyInfo = {};

        var story = Database.Stories[storyName];
        if (!story.characters[charName]) {
            continue;
        }

        storyInfo.name = storyName;

        for (var i = 0; i < story.events.length; ++i) {
            var event = story.events[i];
            var eventInfo = {};
            if (event.characters[charName]) {
                if (event.characters[charName].text !== "") {
                    eventInfo.text = event.characters[charName].text;
                } else {
                    eventInfo.text = event.text;
                }
                eventInfo.time = event.time;
                eventsInfo.push(eventInfo);
            }
        }
    }
    eventsInfo.sort(eventsByTime);

    return eventsInfo;
};

BriefingExport.getStoriesInfo = function (charName) {
    var storiesInfo = [];
    for ( var storyName in Database.Stories) {
        var storyInfo = {};

        var story = Database.Stories[storyName];
        if (!story.characters[charName]) {
            continue;
        }

        storyInfo.name = storyName;
        var eventsInfo = [];

        for (var i = 0; i < story.events.length; ++i) {
            var event = story.events[i];
            var eventInfo = {};
            if (event.characters[charName]) {
                if (event.characters[charName].text !== "") {
                    eventInfo.text = event.characters[charName].text;
                } else {
                    eventInfo.text = event.text;
                }
                eventInfo.time = event.time;
                eventsInfo.push(eventInfo);
            }
        }
        storyInfo.eventsInfo = eventsInfo;

        storiesInfo.push(storyInfo);
    }
    return storiesInfo;
};

BriefingExport.readTemplateFile = function (evt) {
    // Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result;
            BriefingExport.generateDocxBriefings(contents);
        }
        r.readAsBinaryString(f);
    } else {
        alert("Failed to load file");
    }
};

BriefingExport.generateDocxBriefings = function (contents) {

    var toSeparateFiles = document.getElementById("toSeparateFileCheckbox").checked;

    var briefingData = BriefingExport.getBriefingData();
    if (toSeparateFiles) {
        var zip = new JSZip();
        content = zip.generate();

        for (var i = 0; i < briefingData.briefings.length; i++) {
            var doc = new window.Docxgen(contents);
            var briefing = briefingData.briefings[i];
            var tmpData = {
                briefings : [ briefing ]
            };
            doc.setData(tmpData);
            doc.render() // apply them (replace all occurences of
            // {first_name} by Hipp, ...)
            out = doc.getZip().generate({
                type : "Uint8Array"
            });
            zip.file(briefing.name + ".docx", out);
        }
        saveAs(zip.generate({
            type : "blob"
        }), "briefings.zip");
    } else {
        var doc = new window.Docxgen(contents);
        doc.setData(briefingData);
        doc.render() // apply them (replace all occurences of {first_name} by
        // Hipp, ...)
        out = doc.getZip().generate({
            type : "blob"
        });
        saveAs(out, "briefings.docx");
    }
};