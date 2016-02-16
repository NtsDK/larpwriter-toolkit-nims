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

BriefingExport.briefingNumber = [1,5,10,20];

BriefingExport.init = function () {
    "use strict";
    var el = document.getElementById("makeBriefings");
    el.addEventListener("click", BriefingExport.makeTextBriefings);

    el = document.getElementById("docxBriefings");
    el.addEventListener("change", BriefingExport.readTemplateFile);

    el = document.getElementById("eventGroupingByStoryRadio2");
    el.checked = true;

    el = document.getElementById("exportSelectionAll");
    el.checked = true;
    el.addEventListener("change", BriefingExport.onExportSelectionChange);
    BriefingExport.exportSelectionAll = el;

    el = document.getElementById("exportSelectionSpecific");
    el.addEventListener("change", BriefingExport.onExportSelectionChange);

    el = getEl("briefingNumberSelector");
    var option;
    BriefingExport.briefingNumber.forEach(function(number){
      option = makeEl("option");
      option.appendChild(makeText(number));
      el.appendChild(option);
    });
    
    listen(el, "change", BriefingExport.onNumberSelectorChange);
    
    BriefingExport.briefingNumberSelector = el;
    BriefingExport.briefingIntervalSelector = getEl("briefingIntervalSelector");
    
    document.getElementById("makeBriefingsByTime ".trim()).addEventListener("click", BriefingExport.makeExport("templateByTime")); 
    document.getElementById("makeBriefingsByStory".trim()).addEventListener("click", BriefingExport.makeExport("templateByStory")); 
    document.getElementById("makeInventoryList   ".trim()).addEventListener("click", BriefingExport.makeExport("inventoryTemplate")); 

    BriefingExport.briefingSelector = document.getElementById("briefingSelector");
    BriefingExport.content = document.getElementById("briefingExportDiv");
};

BriefingExport.refresh = function () {
  "use strict";
  BriefingExport.onNumberSelectorChange();
};

BriefingExport.onExportSelectionChange = function () {
  "use strict";
  toggleClass(BriefingExport.briefingSelector, "hidden");
};

BriefingExport.getSelectedUsers = function () {
  "use strict";
  if(!BriefingExport.exportSelectionAll.checked){
    return BriefingExport.briefingIntervalSelector.selectedOptions[0].valueObject;
  }
  return null;
};

BriefingExport.onNumberSelectorChange = function () {
  "use strict";
  var selector = BriefingExport.briefingIntervalSelector;
  Utils.removeChildren(selector);
  var num = Number(BriefingExport.briefingNumberSelector.value);
  
  var option, chunks, displayText;
  PermissionInformer.getCharacterNamesArray(false, function(err, names){
    if(err) {Utils.handleError(err); return;}
    if (names.length > 0) {
      chunks = arr2Chunks(names, num);
      
      chunks.forEach(function (chunk) {
        if(chunk.length === 1){
          displayText = chunk[0].displayName;
        } else {
          displayText = chunk[0].displayName + " - " + chunk[chunk.length-1].displayName;
        }
        
        option = makeEl("option");
        option.appendChild(makeText(displayText));
        
        option.valueObject = chunk.reduce(function(map, nameInfo){
          map[nameInfo.value] = true;
          return map;
        }, {}); 
        selector.appendChild(option);
      });
    }
  });
};


BriefingExport.makeExport = function (type) {
    "use strict";
    return function(){
        if(!BriefingExport.templates[type]){
            BriefingExport.templates[type] = atob(templatesArr[type]);
        }
        BriefingExport.exportByDefaultTemplate(type);
    };
};

BriefingExport.exportByDefaultTemplate = function(type){
    "use strict";
    
    var template = BriefingExport.templates[type];
    var briefingData;
    switch(type){
    case "templateByTime"   : 
        briefingData = DBMS.getBriefingData(false, BriefingExport.getSelectedUsers(), function(err, briefingData){
        	if(err) {Utils.handleError(err); return;}
            BriefingExport.generateDocxBriefings(template, briefingData);
        });
        break;
    case "templateByStory"  : 
    case "inventoryTemplate": 
        briefingData = DBMS.getBriefingData(true, BriefingExport.getSelectedUsers(), function(err, briefingData){
        	if(err) {Utils.handleError(err); return;}
            BriefingExport.generateDocxBriefings(template, briefingData);
        });
        break;
    }
};


BriefingExport.makeTextBriefings = function () {
    "use strict";

    DBMS.getBriefingData(BriefingExport.isGroupingByStory(), BriefingExport.getSelectedUsers(), function(err, data){
    	if(err) {Utils.handleError(err); return;}
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
            var briefingData = DBMS.getBriefingData(BriefingExport.isGroupingByStory(), BriefingExport.getSelectedUsers(), function(err, briefingData){
            	if(err) {Utils.handleError(err); return;}
            	BriefingExport.generateDocxBriefings(contents, briefingData);
            });
        }
        r.readAsBinaryString(f);
    } else {
        Utils.alert("Ошибка при загрузке файла");
    }
};

BriefingExport.generateDocxBriefings = function (contents, briefingData, fileName) {
    "use strict";
    
    var toSeparateFiles = document.getElementById("toSeparateFileCheckbox").checked;
    var exportStatus = document.getElementById("exportStatus");
//    Utils.removeChildren(exportStatus);
    
    var updateStatus = function(text){
      Utils.removeChildren(exportStatus);
      exportStatus.appendChild(document.createTextNode(text));
    };
    
    if(!fileName){
        fileName = "briefings";
    }

    var out, archive;
    updateStatus("Подготовка к выгрузке.");
    if (toSeparateFiles) {
        var zip = new JSZip();
        content = zip.generate();
        updateStatus("Данные подготовлены. Начинаю выгрузку.");

        briefingData.briefings.forEach(function (briefing, i) {
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
            updateStatus("Выгружено " + (i+1) + " из " + briefingData.briefings.length + ".");
        });
        updateStatus("Данные выгружены. Архивирую.");
        archive = zip.generate({type : "blob"});
        updateStatus("Архив готов.");
        if(Utils.confirm("Архив сформирован. Сохраняем?")){
          saveAs(archive, fileName + ".zip");
        }
    } else {
        updateStatus("Данные подготовлены. Начинаю выгрузку.");
        var doc = new window.Docxgen(contents);
        doc.setData(briefingData);
        doc.render() // apply them (replace all occurences of {first_name} by
        // Hipp, ...)
        out = doc.getZip().generate({
            type : "blob"
        });
        updateStatus("Файл выгружен.");
        if(Utils.confirm("Документ сформирован. Сохраняем?")){
          saveAs(out, fileName + ".docx");
        }
    }
};