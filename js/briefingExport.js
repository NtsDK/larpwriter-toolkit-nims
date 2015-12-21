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
        briefingData = DBMS.getBriefingData(false, function(err, briefingData){
            BriefingExport.generateDocxBriefings(template, briefingData);
        });
        break;
    case "templateByStory"  : 
    case "inventoryTemplate": 
        briefingData = DBMS.getBriefingData(true, function(err, briefingData){
            BriefingExport.generateDocxBriefings(template, briefingData);
        });
        break;
    }
};


BriefingExport.makeTextBriefings = function () {
    "use strict";

    DBMS.getBriefingData(BriefingExport.isGroupingByStory(), function(err, data){
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
    });
};

BriefingExport.isGroupingByStory = function () {
    "use strict";
    return document.getElementById("eventGroupingByStoryRadio2").checked;
};



BriefingExport.readTemplateFile = function (evt) {
    "use strict";
    // Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result;
            var briefingData = DBMS.getBriefingData(BriefingExport.isGroupingByStory(), function(err, briefingData){
                BriefingExport.generateDocxBriefings(contents, briefingData);
            });
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