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
    listen(getEl("makeDefaultTextBriefings"), "click", function(){
      BriefingExport.makeTextBriefings("txt",TEXT_TEMPLATE);
    });

    listen(getEl("makeCustomTextBriefings"), "click", function(){
      BriefingExport.makeTextBriefings(getEl("textTypeSelector").value, getEl("templateArea").value);
    });
    
    var el = getEl("docxBriefings");
    el.addEventListener("change", BriefingExport.readTemplateFile);

//    el = getEl("eventGroupingByStoryRadio2");
//    el.checked = true;

    el = getEl("exportSelectionAll");
    el.checked = true;
    el.addEventListener("change", BriefingExport.onExportSelectionChange);
    BriefingExport.exportSelectionAll = el;

    el = getEl("exportSelectionSpecific");
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
    
    getEl("makeBriefingsByTime ".trim()).addEventListener("click", BriefingExport.makeExport("templateByTime")); 
    getEl("makeBriefingsByStory".trim()).addEventListener("click", BriefingExport.makeExport("templateByStory")); 
    getEl("makeInventoryList   ".trim()).addEventListener("click", BriefingExport.makeExport("inventoryTemplate")); 
    
    UI.initTabPanel("exportModeButton", "exportContainer");
    
    listen(getEl("previewTextOutput"), "click", BriefingExport.previewTextOutput);
    getEl("textBriefingPreviewArea").value = "";

    listen(getEl("showRawData"), "click", BriefingExport.previewTextDataAsIs);

    BriefingExport.briefingSelector = getEl("briefingSelector");
    BriefingExport.content = getEl("briefingExportDiv");
};

BriefingExport.refresh = function () {
  "use strict";
  
  getEl("templateArea").value = TEXT_TEMPLATE;
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
  clearEl(selector);
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

BriefingExport.getBriefingData = function(callback){
    "use strict";
    DBMS.getBriefingData(BriefingExport.getSelectedUsers(), function(err, briefingData){
        if(err) {Utils.handleError(err); return;}
        // some postprocessing
        DBMS.getAllProfileSettings(function(err, profileSettings){
            if(err) {Utils.handleError(err); return;}
            
            var checkboxIndexes = [];
            var checkboxNames = [];
            profileSettings.forEach(function(profileItem, i){
                if(profileItem.type === 'checkbox'){
                    checkboxIndexes.push(i);
                    checkboxNames.push(profileItem.name);
                }
            });
            
            briefingData.briefings.forEach(function(charData){
                checkboxIndexes.forEach(function(index){
                    var obj = charData.profileInfoArray[index];
                    obj.value = obj.splittedText = constL10n(Constants[obj.value]);
                });
                checkboxNames.forEach(function(name){
                    charData['profileInfo.' + name] = constL10n(Constants[charData['profileInfo.' + name]]);
                });
            });
            callback(null, briefingData);
        });
    });
};

BriefingExport.exportByDefaultTemplate = function(type){
    "use strict";
    BriefingExport.getBriefingData(function(err, briefingData){
      if(err) {Utils.handleError(err); return;}
      BriefingExport.generateDocxBriefings(BriefingExport.templates[type], briefingData);
    });
};

BriefingExport.previewTextDataAsIs = function () {
  "use strict";
  
  BriefingExport.getBriefingData(function(err, briefingData){
    if(err) {Utils.handleError(err); return;}
    getEl('textBriefingPreviewArea').value = JSON.stringify(briefingData, null, "  ");
  });
};

BriefingExport.renderText = function(textTemplate, delegate){
  "use strict";
  BriefingExport.getBriefingData(function(err, data){
    if(err) {Utils.handleError(err); return;}
    var characterList = {};
    data.briefings.forEach(function (briefingData) {
      characterList[briefingData.name] = Mustache.render(textTemplate, briefingData);
    });
    
    delegate(characterList);
  });
}

BriefingExport.previewTextOutput = function () {
  "use strict";
  
  BriefingExport.renderText(getEl("templateArea").value, function(characterList){
    var str = "";
    for(var name in characterList){
      str += characterList[name];
    }
    
    getEl("textBriefingPreviewArea").value = str;
  });
};

BriefingExport.makeTextBriefings = function (fileType, textTemplate) {
    "use strict";
    
  BriefingExport.renderText(textTemplate, function(characterList){
    var toSeparateFiles = getEl("toSeparateFileCheckbox").checked;
    
    if (toSeparateFiles) {
      var zip = new JSZip();
      
      var blob;
      for ( var charName in characterList) {
        zip.file(charName + "." + fileType, characterList[charName]);
      }
      
      var archive = zip.generate({type : "blob"});
      saveAs(archive, "briefings.zip");
    } else {
      var result = "";
      for ( var charName in characterList) {
          result += characterList[charName];
      }
      var blob = new Blob([ result ], {
          type : "text/plain;charset=utf-8"
      });
      saveAs(blob, "briefings." + fileType);
    }
  });
};

BriefingExport.isGroupingByStory = function () {
    "use strict";
    return true;
//    return getEl("eventGroupingByStoryRadio2").checked;
};

BriefingExport.readTemplateFile = function (evt) {
    "use strict";
    // Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function (e) {
            var contents = e.target.result;
            BriefingExport.getBriefingData(function(err, briefingData){
            	if(err) {Utils.handleError(err); return;}
            	BriefingExport.generateDocxBriefings(contents, briefingData);
            });
        }
        r.readAsBinaryString(f);
    } else {
        Utils.alert(getL10n("briefings-error-on-template-uploading"));
    }
};

BriefingExport.generateDocxBriefings = function (contents, briefingData, fileName) {
    "use strict";
    
    var toSeparateFiles = getEl("toSeparateFileCheckbox").checked;
    var exportStatus = getEl("exportStatus");
    
    var updateStatus = function(text){
      clearEl(exportStatus);
      exportStatus.appendChild(makeText(text));
    };
    
    if(!fileName){
        fileName = "briefings";
    }

    var out, archive;
    updateStatus(getL10n("briefings-save-preparing"));
    try{
        if (toSeparateFiles) {
            var zip = new JSZip();
            content = zip.generate();
            updateStatus(getL10n("briefings-start-saving"));
    
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
                updateStatus(strFormat(getL10n("briefings-save-status"),[i+1, briefingData.briefings.length]));
            });
            updateStatus(getL10n("briefings-archiving"));
            archive = zip.generate({type : "blob"});
            updateStatus(getL10n("briefings-archive-is-ready"));
            if(Utils.confirm(getL10n("briefings-save-archive"))){
              saveAs(archive, fileName + ".zip");
            }
        } else {
            updateStatus(getL10n("briefings-start-saving"));
            var doc = new window.Docxgen(contents);
            doc.setData(briefingData);
            doc.render() // apply them (replace all occurences of {first_name} by
            // Hipp, ...)
            out = doc.getZip().generate({
                type : "blob"
            });
            updateStatus(getL10n("briefings-file-is-ready"));
            if(Utils.confirm(getL10n("briefings-save-file"))){
              saveAs(out, fileName + ".docx");
            }
        }
    } catch (err){
        Utils.alert(getL10n("briefings-error-on-generating-briefings"));
    }
};