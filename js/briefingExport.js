/*global
 Utils, DBMS, Database
 */

"use strict";

var BriefingExport = {};

BriefingExport.templates = {};

BriefingExport.init = function () {
    "use strict";
    var button = document.getElementById("makeBriefings");
    button.addEventListener("click", BriefingExport.makeTextBriefings);

    button = document.getElementById("docxBriefings");
    button.addEventListener("change", BriefingExport.readTemplateFile);

    button = document.getElementById("eventGroupingByStoryRadio2");
    button.checked = true;
    
    document.getElementById("makeBriefingsByTime ".trim()).addEventListener("click", BriefingExport.makeExport("templateByTime")); 
    document.getElementById("makeBriefingsByStory".trim()).addEventListener("click", BriefingExport.makeExport("templateByStory")); 
    document.getElementById("makeInventoryList   ".trim()).addEventListener("click", BriefingExport.makeExport("inventoryTemplate")); 

    BriefingExport.content = document.getElementById("briefingExportDiv");
};

BriefingExport.refresh = function () {
    "use strict";
};

BriefingExport.makeExport = function (type) {
    "use strict";
    return function(){
        if(!BriefingExport.templates[type]){
          // base64 encoded docx
          var request = $.ajax({
              url : type + ".txt",
              dataType : "text",
              method : "GET",
              contentType : "text/plain;charset=utf-8"
          });
          
          request.done(function(data) {
              BriefingExport.templates[type] = atob(data);
              BriefingExport.exportByDefaultTemplate(type);
          });
          
          request.fail(function(errorInfo, textStatus, errorThrown) {
              alert(errorInfo.responseText);
          });
        } else {
            BriefingExport.exportByDefaultTemplate(type);
        }
    };
};

BriefingExport.exportByDefaultTemplate = function(type){
    "use strict";
    
    var template = BriefingExport.templates[type];
    var briefingData;
    switch(type){
    case "templateByTime"   : 
        briefingData = BriefingExport.getBriefingData(false);
        BriefingExport.generateDocxBriefings(template, briefingData);
        break;
    case "templateByStory"  : 
    case "inventoryTemplate": 
        briefingData = BriefingExport.getBriefingData(true);
        BriefingExport.generateDocxBriefings(template, briefingData);
        break;
    }
};


BriefingExport.makeTextBriefings = function () {
    "use strict";

    var data = BriefingExport.getBriefingData(BriefingExport.isGroupingByStory());

    var characterList = {};

    data.briefings.forEach(function (briefingData) {
        var briefing = "";
        
        briefing += briefingData.name + "\n\n";
        
        var regex = new RegExp('^profileInfo');
        
        Object.keys(briefingData).filter(function (element) {
            return regex.test(element);
        }).forEach(
                function (element) {
                    briefing += "----------------------------------\n";
                    briefing += element.substring("profileInfo.".length, element.length) + "\n";
                    briefing += briefingData[element] + "\n";
                    briefing += "----------------------------------\n\n";
                });
        
        briefing += "----------------------------------\n";
        briefing += "Инвентарь\n";
        briefing += briefingData.inventory + "\n";
        briefing += "----------------------------------\n\n";
        
        if (briefingData.storiesInfo) {
            briefingData.storiesInfo.forEach(function (storyInfo) {
                briefing += "----------------------------------\n";
                briefing += storyInfo.name + "\n\n";
                
                storyInfo.eventsInfo.forEach(function (event) {
                    briefing += event.time + ": " + event.text + "\n\n";
                });
                
                briefing += "----------------------------------\n\n";
            });
        }
        
        if (briefingData.eventsInfo) {
            briefing += "----------------------------------\n";
            
            briefingData.eventsInfo.forEach(function (event) {
                briefing += event.time + ": " + event.text + "\n\n";
            });
            
            briefing += "----------------------------------\n\n";
        }
        
        characterList[briefingData.name] = briefing;
    });

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

BriefingExport.isGroupingByStory = function () {
    "use strict";
    return document.getElementById("eventGroupingByStoryRadio2").checked;
};

BriefingExport.getBriefingData = function (groupingByStory) {
    "use strict";
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

        for ( var element in profileInfo) {
            dataObject["profileInfo." + element] = profileInfo[element];
        }

        charArray.push(dataObject);
    }

    data["briefings"] = charArray;
    return data;
};

BriefingExport.getProfileInfo = function (charName) {
    "use strict";
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
    "use strict";
    var eventsInfo = [];
    for ( var storyName in Database.Stories) {
        var storyInfo = {};

        var story = Database.Stories[storyName];
        if (!story.characters[charName]) {
            continue;
        }

        storyInfo.name = storyName;

        story.events.filter(function (event) {
            return event.characters[charName];
        }).forEach(function (event) {
            var eventInfo = {};
            if (event.characters[charName].text !== "") {
                eventInfo.text = event.characters[charName].text;
            } else {
                eventInfo.text = event.text;
            }
            eventInfo.time = event.time;
            eventsInfo.push(eventInfo);
        });
    }
    eventsInfo.sort(eventsByTime);

    return eventsInfo;
};

BriefingExport.getStoriesInfo = function (charName) {
    "use strict";
    var storiesInfo = [];
    for ( var storyName in Database.Stories) {
        var storyInfo = {};

        var story = Database.Stories[storyName];
        if (!story.characters[charName]) {
            continue;
        }

        storyInfo.name = storyName;
        var eventsInfo = [];

        story.events.filter(function (event) {
            return event.characters[charName];
        }).forEach(function (event) {
            var eventInfo = {};
            if (event.characters[charName].text !== "") {
                eventInfo.text = event.characters[charName].text;
            } else {
                eventInfo.text = event.text;
            }
            eventInfo.time = event.time;
            eventsInfo.push(eventInfo);
        });
        storyInfo.eventsInfo = eventsInfo;

        storiesInfo.push(storyInfo);
    }
    return storiesInfo;
};

BriefingExport.readTemplateFile = function (evt) {
    "use strict";
    // Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result;
            var briefingData = BriefingExport.getBriefingData(BriefingExport.isGroupingByStory());
            BriefingExport.generateDocxBriefings(contents, briefingData);
        }
        r.readAsBinaryString(f);
    } else {
        Utils.alert("Failed to load file");
    }
};

BriefingExport.generateDocxBriefings = function (contents, briefingData, fileName) {
    "use strict";

    var toSeparateFiles = document.getElementById("toSeparateFileCheckbox").checked;
    
    if(!fileName){
        fileName = "briefings";
    }

    var out;
    if (toSeparateFiles) {
        var zip = new JSZip();
        content = zip.generate();

        briefingData.briefings.forEach(function (briefing) {
            var doc = new window.Docxgen(contents);
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
        });
        saveAs(zip.generate({
            type : "blob"
        }), fileName + ".zip");
    } else {
        var doc = new window.Docxgen(contents);
        doc.setData(briefingData);
        doc.render() // apply them (replace all occurences of {first_name} by
        // Hipp, ...)
        out = doc.getZip().generate({
            type : "blob"
        });
        saveAs(out, fileName + ".docx");
    }
};