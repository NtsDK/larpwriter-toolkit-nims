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

(function(exports){

    var state = {};
    
    state.templates = {};
    
    exports.init = function () {
        listen(getEl("makeDefaultTextBriefings"), "click", function(){
            resolveTextTemplate(function(textTemplate){
                makeTextBriefings("txt",textTemplate);
            });
        });
    
        listen(getEl("makeCustomTextBriefings"), "click", function(){
          makeTextBriefings(getEl("textTypeSelector").value, getEl("templateArea").value);
        });
        
        var el = getEl("docxBriefings");
        el.addEventListener("change", readTemplateFile);
    
        var els = document.querySelectorAll("#briefingExportDiv input[name=exportSelection]");
        for (var i = 0; i < els.length; i++) {
            listen(els[i], "change", onExportSelectionChange);
        }
        getEl("exportSelectionAll").checked = true;
    
        el = getEl("briefingNumberSelector");
        Constants.briefingNumber.forEach(R.compose(addEl(el), makeOpt));
        
        listen(el, "change", onNumberSelectorChange);
        
        state.briefingNumberSelector = el;
        state.briefingIntervalSelector = getEl("briefingIntervalSelector");
        state.briefingMultiSelector = getEl("briefingMultiSelector");
        
        getEl("makeBriefingsByTime ".trim()).addEventListener("click", makeExport("templateByTime")); 
        getEl("makeBriefingsByStory".trim()).addEventListener("click", makeExport("templateByStory")); 
        getEl("makeInventoryList   ".trim()).addEventListener("click", makeExport("inventoryTemplate")); 
        
        UI.initTabPanel("exportModeButton", "exportContainer");
        
        listen(getEl("previewTextOutput"), "click", previewTextOutput);
        getEl("textBriefingPreviewArea").value = "";
    
        listen(getEl("showRawData"), "click", previewTextDataAsIs);
        
        listen(getEl("convertToDocxTemplate"), "click", convertToDocxTemplate);
        listen(getEl("generateByDocxTemplate"), "click", generateByDocxTemplate);
    
        state.briefingSelector = getEl("briefingSelector");
        state.briefingMultiSelect = getEl("briefingMultiSelect");
        exports.content = getEl("briefingExportDiv");
    };
    
    exports.refresh = function () {
        resolveTextTemplate(function(textTemplate) {
            getEl("templateArea").value = textTemplate;
            onNumberSelectorChange();
        });
    };
    
    var resolveTextTemplate = function (callback) {
        DBMS.getCharacterProfileStructure(function(err, profileSettings){
            if(err) {Utils.handleError(err); return;}
            var func = R.compose(R.join(''), R.insert(1, R.__, ["{{profileInfo-","}}\n"]), R.prop('name'));
            var filter = R.compose(R.equals(true), R.prop('doExport'));
            var value = profileSettings.filter(filter).map(func).join("");
            
            callback(R.replace(/\{0\}/g, value, TEXT_TEMPLATE));
        });
    };
    
    
    var onExportSelectionChange = function (event) {
      var showBriefingSelector = event.target.id === 'exportSelectionSpecific';
      var showBriefingMultiSelect = event.target.id === 'exportSelectionMultiple';
      setClassByCondition(state.briefingSelector, "hidden", !showBriefingSelector);
      setClassByCondition(state.briefingMultiSelect, "hidden", !showBriefingMultiSelect);
    };
    
    var getSelectedUsers = function () {
      var id = getSelectedRadio("#briefingExportDiv input[name=exportSelection]").id;
      switch(id){
      case 'exportSelectionAll':
          return null;
      case 'exportSelectionSpecific':
          return JSON.parse(state.briefingIntervalSelector.selectedOptions[0].value);
      case 'exportSelectionMultiple':
          var opts = state.briefingMultiSelector.selectedOptions;
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
    
    var onNumberSelectorChange = function () {
      var selector = clearEl(state.briefingIntervalSelector);
      var multiSel = clearEl(state.briefingMultiSelector);
      var num = Number(state.briefingNumberSelector.value);
      
      var option, chunks, displayText, value;
      PermissionInformer.getEntityNamesArray('character', false, function(err, names){
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
          
          $("#" + state.briefingIntervalSelector.id).select2({data:data});
          fillSelector(multiSel, names.map(remapProps4Select));
        }
      });
    };
    
    var makeExport = function (type) {
        return function(){
            if(!state.templates[type]){
                state.templates[type] = atob(templatesArr[type]);
            }
            exportDocxByTemplate(state.templates[type]);
        };
    };
    
    var getBriefingData = function(callback){
        DBMS.getBriefingData(getSelectedUsers(), function(err, briefingData){
            if(err) {Utils.handleError(err); return;}
            // some postprocessing
            DBMS.getCharacterProfileStructure(function(err, profileSettings){
                if(err) {Utils.handleError(err); return;}
                
                var checkboxNames = profileSettings.filter(function(profileItem, i){
                    return profileItem.type === 'checkbox';
                }).map(R.prop('name'));
                
                briefingData.briefings.forEach(function(charData){
                    charData.profileInfoArray.forEach(function(element){
                        if(checkboxNames.indexOf(element.itemName) != -1){
                            element.value = constL10n(Constants[element.value]);
                            element.splittedText = [{'string':element.value}]
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
    
    var exportDocxByTemplate = function(template){
        getBriefingData(function(err, briefingData){
            if(err) {Utils.handleError(err); return;}
            generateBriefings(briefingData, "docx", generateSingleDocx("blob", template), generateSingleDocx("Uint8Array", template));
        });
    };
    
    var convertToDocxTemplate = function () {
        var docxTemplate = makeDocxTemplate("blob");
        if(Utils.confirm(getL10n("briefings-save-file"))){
            saveAs(docxTemplate, "template.docx");
        }
    };
    
    var generateByDocxTemplate = function () {
        exportDocxByTemplate(makeDocxTemplate("Uint8Array"));
    };
    
    var makeDocxTemplate = function (type) {
        var template = getEl('templateArea').value;
        
        var replaceBrackets = R.pipe(R.replace(/{{{/g, '{'),R.replace(/}}}/g, '}'),R.replace(/{{/g, '{'),R.replace(/}}/g, '}'));
        template = replaceBrackets(template).split('\n').map(function(string){
            return {string:string}
        });
        
        if(!state.templates['genericTemplate']){
            state.templates['genericTemplate'] = atob(templatesArr['genericTemplate']);
        }
        
        var doc = new window.Docxgen(state.templates['genericTemplate']);
        doc.setData({
            splittedText: template
        });
        doc.render();
        return doc.getZip().generate({
                type : type
        });
    };
    var previewTextDataAsIs = function () {
      getBriefingData(function(err, briefingData){
        if(err) {Utils.handleError(err); return;}
        getEl('textBriefingPreviewArea').value = JSON.stringify(briefingData, null, "  ");
      });
    };
    
    var previewTextOutput = function () {
        getBriefingData(function(err, data){
            if(err) {Utils.handleError(err); return;}
            getEl("textBriefingPreviewArea").value = generateSingleTxt(getEl("templateArea").value, data);
        });
    };
    
    var makeTextBriefings = function (fileType, template) {
        var delegate = generateSingleTxt(template);
        
        getBriefingData(function(err, briefingData){
            if(err) {Utils.handleError(err); return;}
            generateBriefings(briefingData, fileType, function(data){
                var result = delegate(data);
                return new Blob([ result ], {
                    type : "text/plain;charset=utf-8"
                });
            }, delegate);
        });
    };
    
    var readTemplateFile = function (evt) {
        // Retrieve the first (and only!) File from the FileList object
        var f = evt.target.files[0];
    
        if (f) {
            var r = new FileReader();
            r.onload = function (e) {
                var template = e.target.result;
                getBriefingData(function(err, briefingData){
                    if(err) {Utils.handleError(err); return;}
                    generateBriefings(briefingData, "docx", generateSingleDocx("blob", template), generateSingleDocx("Uint8Array", template));
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
    
    var generateBriefings = function (briefingData, fileType, oneFileDelegate, separateFileDelegate) {
        var toSeparateFiles = getEl("toSeparateFileCheckbox").checked;
        
        var fileName = "briefings";
    
        var out, archive;
        updateStatus(getL10n("briefings-save-preparing"));
        try{
            if (toSeparateFiles) {
                var zip = new JSZip();
                var content = zip.generate();
                updateStatus(getL10n("briefings-start-saving"));
        
                var res = makeArchiveData(briefingData, separateFileDelegate);
                for ( var key in res) {
                    zip.file(key + "." + fileType, res[key]);
                }
                
                updateStatus(getL10n("briefings-archiving"));
                archive = zip.generate({type : "blob"});
                updateStatus(getL10n("briefings-archive-is-ready"));
                saveFile("briefings-save-archive", archive, fileName + ".zip");
            } else {
                updateStatus(getL10n("briefings-start-saving"));
                out = oneFileDelegate(briefingData);
                updateStatus(getL10n("briefings-file-is-ready"));
                saveFile("briefings-save-file", out, fileName + "." + fileType);
            }
        } catch (err){
            Utils.alert(getL10n("briefings-error-on-generating-briefings"));
            console.log(err);
        }
    };
    
    var saveFile = function(msgKey, out, fileName){
        if(Utils.confirm(getL10n(msgKey))){
          saveAs(out, fileName);
        }
    };
    
    var makeArchiveData = function(briefingData, generateSingleDelegate){
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
        
    var generateSingleDocx = R.curry(function (type, template, data) {
        var doc = new window.Docxgen(template);
        doc.setData(data);
        doc.render() // apply them (replace all occurences of {first_name} by
        // Hipp, ...)
        var out = doc.getZip().generate({
            type : type
        });
        return out;
    });
    
    var generateSingleTxt = R.curry(function (template, data) {
        try{
            return Mustache.render(template, data);
        } catch(err){
            Utils.alert(strFormat(getL10n('briefings-template-error'), [err.message]));
            throw err;
        }
    });

})(this['BriefingExport']={});