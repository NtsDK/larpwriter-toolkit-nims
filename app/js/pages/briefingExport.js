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
    listen(getEl("makeDefaultTextBriefings"), "click", function(){
        BriefingExport.resolveTextTemplate(function(textTemplate){
            BriefingExport.makeTextBriefings("txt",textTemplate);
        });
    });

    listen(getEl("makeCustomTextBriefings"), "click", function(){
      BriefingExport.makeTextBriefings(getEl("textTypeSelector").value, getEl("templateArea").value);
    });
    
    var el = getEl("docxBriefings");
    el.addEventListener("change", BriefingExport.readTemplateFile);

    var els = document.querySelectorAll("#briefingExportDiv input[name=exportSelection]");
    for (var i = 0; i < els.length; i++) {
        listen(els[i], "change", BriefingExport.onExportSelectionChange);
    }
    getEl("exportSelectionAll").checked = true;

    el = getEl("briefingNumberSelector");
    Constants.briefingNumber.forEach(R.compose(addEl(el), makeOpt));
    
    listen(el, "change", BriefingExport.onNumberSelectorChange);
    
    BriefingExport.briefingNumberSelector = el;
    BriefingExport.briefingIntervalSelector = getEl("briefingIntervalSelector");
    BriefingExport.briefingMultiSelector = getEl("briefingMultiSelector");
    
    getEl("makeBriefingsByTime ".trim()).addEventListener("click", BriefingExport.makeExport("templateByTime")); 
    getEl("makeBriefingsByStory".trim()).addEventListener("click", BriefingExport.makeExport("templateByStory")); 
    getEl("makeInventoryList   ".trim()).addEventListener("click", BriefingExport.makeExport("inventoryTemplate")); 
    
    UI.initTabPanel("exportModeButton", "exportContainer");
    
    listen(getEl("previewTextOutput"), "click", BriefingExport.previewTextOutput);
    getEl("textBriefingPreviewArea").value = "";

    listen(getEl("showRawData"), "click", BriefingExport.previewTextDataAsIs);
    
    listen(getEl("convertToDocxTemplate"), "click", BriefingExport.convertToDocxTemplate);
    listen(getEl("generateByDocxTemplate"), "click", BriefingExport.generateByDocxTemplate);

    BriefingExport.briefingSelector = getEl("briefingSelector");
    BriefingExport.briefingMultiSelect = getEl("briefingMultiSelect");
    BriefingExport.content = getEl("briefingExportDiv");
};

BriefingExport.refresh = function () {
  "use strict";
  BriefingExport.resolveTextTemplate(function(textTemplate){
      getEl("templateArea").value = textTemplate;
      BriefingExport.onNumberSelectorChange();
  });
};

BriefingExport.resolveTextTemplate = function (callback) {
    "use strict";
    DBMS.getAllProfileSettings(function(err, profileSettings){
        if(err) {Utils.handleError(err); return;}
        var func = R.compose(R.join(''), R.insert(1, R.__, ["{{profileInfo-","}}\n"]), R.prop('name'));
        var filter = R.compose(R.equals(true), R.prop('doExport'));
        var value = profileSettings.filter(filter).map(func).join("");
        
        callback(R.replace(/\{0\}/g, value, TEXT_TEMPLATE));
    });
};


BriefingExport.onExportSelectionChange = function (event) {
  "use strict";
  var showBriefingSelector = event.target.id === 'exportSelectionSpecific';
  var showBriefingMultiSelect = event.target.id === 'exportSelectionMultiple';
  setClassByCondition(BriefingExport.briefingSelector, "hidden", !showBriefingSelector);
  setClassByCondition(BriefingExport.briefingMultiSelect, "hidden", !showBriefingMultiSelect);
};

BriefingExport.getSelectedUsers = function () {
  "use strict";
  var id = getSelectedRadio("#briefingExportDiv input[name=exportSelection]").id;
  switch(id){
  case 'exportSelectionAll':
      return null;
  case 'exportSelectionSpecific':
      return JSON.parse(BriefingExport.briefingIntervalSelector.selectedOptions[0].value);
  case 'exportSelectionMultiple':
      var opts = BriefingExport.briefingMultiSelector.selectedOptions;
      var vals = {};
      for (var i = 0; i < opts.length; i++) {
          vals[opts[i].value] = true;
      }
      return vals;
  default:
      Utils.alert("unexpected id: " + id);
  }
  return null;
};

BriefingExport.onNumberSelectorChange = function () {
  "use strict";
  var selector = clearEl(BriefingExport.briefingIntervalSelector);
  var multiSel = clearEl(BriefingExport.briefingMultiSelector);
  var num = Number(BriefingExport.briefingNumberSelector.value);
  
  var option, chunks, displayText, value;
  PermissionInformer.getCharacterNamesArray(false, function(err, names){
    if(err) {Utils.handleError(err); return;}
    if (names.length > 0) {
      chunks = arr2Chunks(names, num);
      
      var data = chunks.map(function (chunk) {
        if(chunk.length === 1){
          displayText = chunk[0].displayName;
        } else {
          displayText = chunk[0].displayName + " - " + chunk[chunk.length-1].displayName;
        }
        
        value = JSON.stringify(chunk.reduce(function(map, nameInfo){
          map[nameInfo.value] = true;
          return map;
        }, {})); 
        
        return {
            "id":  value,
            "text": displayText
        };
      });
      
      $("#" + BriefingExport.briefingIntervalSelector.id).select2({data:data});
      fillSelector(multiSel, names.map(remapProps4Select));
    }
  });
};

BriefingExport.makeExport = function (type) {
    "use strict";
    return function(){
        if(!BriefingExport.templates[type]){
            BriefingExport.templates[type] = atob(templatesArr[type]);
        }
        BriefingExport.exportDocxByTemplate(BriefingExport.templates[type]);
    };
};

BriefingExport.getBriefingData = function(callback){
    "use strict";
    DBMS.getBriefingData(BriefingExport.getSelectedUsers(), function(err, briefingData){
        if(err) {Utils.handleError(err); return;}
        // some postprocessing
        DBMS.getAllProfileSettings(function(err, profileSettings){
            if(err) {Utils.handleError(err); return;}
            
            var checkboxNames = profileSettings.filter(function(profileItem, i){
                return profileItem.type === 'checkbox';
            }).map(R.prop('name'));
            
            briefingData.briefings.forEach(function(charData){
                charData.profileInfoArray.forEach(function(element){
                    if(checkboxNames.indexOf(element.itemName) != -1){
                        element.value = constL10n(Constants[element.value]);
                        element.splittedText = [{'string':constL10n(Constants[element.value])}]
                    }
                });
                checkboxNames.forEach(function(name){
                    charData['profileInfo-' + name] = constL10n(Constants[charData['profileInfo-' + name]]);
                });
            });
            callback(null, briefingData);
        });
    });
};

BriefingExport.exportDocxByTemplate = function(template){
    "use strict";
    BriefingExport.getBriefingData(function(err, briefingData){
        if(err) {Utils.handleError(err); return;}
        BriefingExport.generateBriefings(briefingData, "docx", BriefingExport.generateSingleDocx("blob", template), BriefingExport.generateSingleDocx("Uint8Array", template));
    });
};

BriefingExport.convertToDocxTemplate = function () {
    "use strict";
    var docxTemplate = BriefingExport.makeDocxTemplate("blob");
    if(Utils.confirm(getL10n("briefings-save-file"))){
        saveAs(docxTemplate, "template.docx");
    }
};

BriefingExport.generateByDocxTemplate = function () {
    "use strict";
    BriefingExport.exportDocxByTemplate(BriefingExport.makeDocxTemplate("Uint8Array"));
};

BriefingExport.makeDocxTemplate = function (type) {
    "use strict";
    var template = getEl('templateArea').value;
    
    var replaceBrackets = R.pipe(R.replace(/{{{/g, '{'),R.replace(/}}}/g, '}'),R.replace(/{{/g, '{'),R.replace(/}}/g, '}'));
    template = replaceBrackets(template).split('\n').map(function(string){
        return {string:string}
    });
    
    if(!BriefingExport.templates['genericTemplate']){
        BriefingExport.templates['genericTemplate'] = atob(templatesArr['genericTemplate']);
    }
    
    var doc = new window.Docxgen(BriefingExport.templates['genericTemplate']);
    doc.setData({
        splittedText: template
    });
    doc.render();
    return doc.getZip().generate({
            type : type
    });
};
BriefingExport.previewTextDataAsIs = function () {
  "use strict";
  
  BriefingExport.getBriefingData(function(err, briefingData){
    if(err) {Utils.handleError(err); return;}
    getEl('textBriefingPreviewArea').value = JSON.stringify(briefingData, null, "  ");
  });
};

BriefingExport.previewTextOutput = function () {
    "use strict";
    BriefingExport.getBriefingData(function(err, data){
        if(err) {Utils.handleError(err); return;}
        getEl("textBriefingPreviewArea").value = BriefingExport.generateSingleTxt(getEl("templateArea").value, data);
    });
};

BriefingExport.makeTextBriefings = function (fileType, template) {
    "use strict";
    
    var delegate = BriefingExport.generateSingleTxt(template);
    
    BriefingExport.getBriefingData(function(err, briefingData){
        if(err) {Utils.handleError(err); return;}
        BriefingExport.generateBriefings(briefingData, fileType, function(data){
            var result = delegate(data);
            return new Blob([ result ], {
                type : "text/plain;charset=utf-8"
            });
        }, delegate);
    });
};

BriefingExport.readTemplateFile = function (evt) {
    "use strict";
    // Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function (e) {
            var template = e.target.result;
            BriefingExport.getBriefingData(function(err, briefingData){
                if(err) {Utils.handleError(err); return;}
                BriefingExport.generateBriefings(briefingData, "docx", BriefingExport.generateSingleDocx("blob", template), BriefingExport.generateSingleDocx("Uint8Array", template));
            });
        }
        r.readAsBinaryString(f);
    } else {
        Utils.alert(getL10n("briefings-error-on-template-uploading"));
    }
};

var updateStatus = function(text){
    var exportStatus = getEl("exportStatus");
    clearEl(exportStatus);
    exportStatus.appendChild(makeText(text));
};

BriefingExport.generateBriefings = function (briefingData, fileType, oneFileDelegate, separateFileDelegate) {
    "use strict";
    
    var toSeparateFiles = getEl("toSeparateFileCheckbox").checked;
    
    var fileName = "briefings";

    var out, archive;
    updateStatus(getL10n("briefings-save-preparing"));
    try{
        if (toSeparateFiles) {
            var zip = new JSZip();
            var content = zip.generate();
            updateStatus(getL10n("briefings-start-saving"));
    
            var res = BriefingExport.makeArchiveData(briefingData, separateFileDelegate);
            for ( var key in res) {
                zip.file(key + "." + fileType, res[key]);
            }
            
            updateStatus(getL10n("briefings-archiving"));
            archive = zip.generate({type : "blob"});
            updateStatus(getL10n("briefings-archive-is-ready"));
            BriefingExport.saveFile("briefings-save-archive", archive, fileName + ".zip");
        } else {
            updateStatus(getL10n("briefings-start-saving"));
            out = oneFileDelegate(briefingData);
            updateStatus(getL10n("briefings-file-is-ready"));
            BriefingExport.saveFile("briefings-save-file", out, fileName + "." + fileType);
        }
    } catch (err){
        Utils.alert(getL10n("briefings-error-on-generating-briefings"));
        console.log(err);
    }
};

BriefingExport.saveFile = function(msgKey, out, fileName){
    "use strict";
    if(Utils.confirm(getL10n(msgKey))){
      saveAs(out, fileName);
    }
};

BriefingExport.makeArchiveData = function(briefingData, generateSingleDelegate){
    "use strict";
    var res = {};
    briefingData.briefings.forEach(function (briefing, i) {
        res[briefing.charName] = generateSingleDelegate( {
            gameName: briefingData.gameName,
            briefings : [ briefing ]
        });
        updateStatus(strFormat(getL10n("briefings-save-status"),[i+1, briefingData.briefings.length]));
    });
    return res;
};
    
BriefingExport.generateSingleDocx = R.curry(function (type, template, data) {
    "use strict";
    var doc = new window.Docxgen(template);
    doc.setData(data);
    doc.render() // apply them (replace all occurences of {first_name} by
    // Hipp, ...)
    var out = doc.getZip().generate({
        type : type
    });
    return out;
});

BriefingExport.generateSingleTxt = R.curry(function (template, data) {
    try{
        return Mustache.render(template, data);
    } catch(err){
        Utils.alert(strFormat(getL10n('briefings-template-error'), [err.message]));
        throw err;
    }
});