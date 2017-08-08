/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
   limitations under the License. */

"use strict";

(function(exports){

    exports.initTabPanel = function(tabClazz, containerClazz) {
        var containers = getEls(containerClazz);
    
        var i;
        for (i = 1; i < containers.length; i++) { // don't hide 1st element
            addClass(containers[i], "hidden");
        }
    
        var tabButtons = getEls(tabClazz);
    
        addClass(tabButtons[0], "active");
    
        for (i = 0; i < tabButtons.length; i++) {
            listen(tabButtons[i], "click", tabButtonClick(tabButtons, containers));
        }
    };
    
    var tabButtonClick = function(buttons, containers) {
        return function(event) {
            for (var i = 0; i < buttons.length; i++) {
                setClassByCondition(buttons[i], "active", event.target.id === buttons[i].id);
            }
            for (var i = 0; i < containers.length; i++) {
                setClassByCondition(containers[i], "hidden", event.target.id + "Container" !== containers[i].id);
            }
        };
    };
    
    exports.fillShowItemSelector = function (selector, displayArray) {
        var el;
        setAttr(selector, "size", displayArray.length);
        displayArray.forEach(function(value) {
            el = setProps(makeEl("option"), {
                "selected" : true,
            });
            setClassByCondition(el, 'hidden', value.hidden);
            addEl(selector, addEl(el, makeText(value.name)));
        });
    };
    
    exports.fillShowItemSelector2 = function (selector, optionGroups) {
        var el, groupEl, counter = 0;
        addEls(selector, optionGroups.map(function(group) {
            counter++;
            groupEl = setAttr(makeEl("optgroup"), 'label', group.name);
            addEls(groupEl, group.array.map((value) => {
                el = setProps(makeEl("option"), {
                    "selected" : true,
                });
                setClassByCondition(el, 'hidden', value.hidden);
                counter += (value.hidden ? 0 : 1);
                return addEl(el, makeText(value.name));
            }));
            return groupEl;
        }));
        setAttr(selector, "size", counter);
    };
    
    exports.showSelectedEls = function(classKey){
        return function(event){
            var el = event.target;
            var els, i, j;
            for (i = 0; i < el.options.length; i += 1) {
                els = getEls(i + classKey);
                for (j = 0; j < els.length; j++) {
                    setClassByCondition(els[j], "hidden", !el.options[i].selected);
                }
            }
        }
    };
    
    exports.initSelectorFilters = function(){
        var elems = document.querySelectorAll("[selector-filter]");
        var el, sel;
        for (var i = 0; i < elems.length; i++) {
            el = elems[i];
            sel = queryEl(getAttr(el,"selector-filter"));
            el.value = '';
            listen(el, "input", filterOptions(sel))
        }
    };
    
    var filterOptions = function(sel){
        return function(event){
            var val = event.target.value;
            var i, opt;
            val = CommonUtils.globStringToRegex(val.trim().toLowerCase());
            for (i = 0; i < sel.options.length; i += 1) {
                opt = sel.options[i];
                var isVisible = opt.innerHTML.toLowerCase().search(val) !== -1;
                if(!isVisible){
                    opt.selected = false;
                }
                setClassByCondition(opt, "hidden", !isVisible);
//                setClassByCondition(opt, "hidden", opt.innerHTML.toLowerCase().search(val) === -1);
            }
            sel.dispatchEvent(new Event('change'));
        }
    };
    
    exports.initPanelTogglers = function(){
        var elems = document.querySelectorAll("[panel-toggler]");
        var el, sel, attr;
        for (var i = 0; i < elems.length; i++) {
            el = elems[i];
            attr = getAttr(el,"panel-toggler");
            sel = document.querySelector(attr);
            if(sel == null){
                Utils.alert("Panel toggler is broken: " + attr);
            }
            listen(el, "click", exports.togglePanel(sel))
        }
    };
    
    exports.togglePanel = function(sel){
        return function(event){
            toggleClass(sel, "hidden");
        }
    };
    
    exports.makeEventTimePicker = function (opts) {
        var input = makeEl("input");
        R.ap([addClass(input)], opts.extraClasses);
        addClass(input, "eventTime");
        input.value = opts.eventTime;
        
        input.eventIndex = opts.index;
        
        var pickerOpts = {
            lang : L10n.getLang(),
            mask : true,
            startDate : new Date(opts.preGameDate),
            endDate : new Date(opts.date),
            onChangeDateTime : opts.onChangeDateTimeCreator(input),
        };
        
        if (opts.eventTime !== "") {
            pickerOpts.value = opts.eventTime;
        } else {
            pickerOpts.value = opts.date;
            addClass(input, "defaultDate");
        }
        
        jQuery(input).datetimepicker(pickerOpts);
        return input;
    };
    
    exports.resizeTextarea = function (ev) {
        var that = ev.target;
        that.style.height = '24px';
        that.style.height = that.scrollHeight + 12 + 'px';
    };
    
    exports.resizeTextarea2 = function (that) {
        that.style.height = '24px';
        that.style.height = that.scrollHeight + 12 + 'px';
    };
    
    exports.makeAdaptationTimeInput = function(storyName, event, characterName, isEditable){
        var input = makeEl("input");
        setClassByCondition(input, "notEditable", !isEditable);
        addClass(input,"adaptationTimeInput");
        input.value = event.characters[characterName].time;
        input.dataKey = JSON.stringify([storyName, event.index, characterName]);
        listen(input, "change", onChangePersonalTimeDelegate);
        return input;
    };
    
    var onChangePersonalTimeDelegate = function (event) {
        var dataKey = JSON.parse(event.target.dataKey);
        var time = event.target.value;
        DBMS.setEventAdaptationProperty(dataKey[0], dataKey[1], dataKey[2], 'time', time, Utils.processError());
    };
    
    exports.makeAdaptationReadyInput = function(storyName, event, characterName, isEditable){
        var div = makeEl("div");
        var input = makeEl("input");
        setClassByCondition(input, "notEditable", !isEditable);
        input.type = "checkbox";
        input.checked = event.characters[characterName].ready;
        input.dataKey = JSON.stringify([storyName, event.index, characterName]);
        input.id = event.index + "-" + storyName + "-" + characterName;
        listen(input, "change", onChangeReadyStatus);
        addEl(div, input);
        
        addEl(div, setAttr(addEl(makeEl("label"), makeText(constL10n(Constants.finishedText))), "for", input.id));
        return div;
    };
    
    var onChangeReadyStatus = function (event) {
        var dataKey = JSON.parse(event.target.dataKey);
        var value = event.target.checked;
        DBMS.setEventAdaptationProperty(dataKey[0], dataKey[1], dataKey[2], 'ready', value, Utils.processError());
    };
    
    exports.makePanelCore = function(title, content){
        var panel = addClasses(makeEl('div'), ["panel", "panel-default"]);
        var h3 = addClass(addEl(makeEl('h3'), title), "panel-title");
        var a = setAttr(makeEl('a'),'href','#/');
        var headDiv = addClass(makeEl('div'), "panel-heading");
        addEl(panel, addEl(headDiv, addEl(a, h3)));
        var contentDiv = addClass(makeEl('div'), "panel-body");
        addEl(panel, addEl(contentDiv, content));
        return {
            panel: panel,
            contentDiv: contentDiv,
            a: a
        };
    };
    
    exports.makeProfileTable = function(profileStructure, profile){
        var value;
        var profileDiv = addEls(makeEl('tbody'), profileStructure.filter(element => element.doExport).map(function (element) {
            switch (element.type) {
            case "text":
                value = addClass(makeEl("span"), "briefingTextSpan");
                addEl(value, makeText(profile[element.name]));
                break;
            case "enum":
            case "multiEnum":
            case "number":
            case "string":
                value = makeText(profile[element.name]);
                break;
            case "checkbox":
                value = makeText(constL10n(Constants[profile[element.name]]));
                break;
            default:
                throw new Error('Unexpected type ' + element.type);
            }
            return exports.makeTableRow(makeText(element.name), value);
        }));
        return addEl(addClasses(makeEl('table'), ['table','table-striped']), profileDiv);
    };
    
    exports.makeTableRow = function(col1, col2){
        return addEls(makeEl('tr'), [addEl(makeEl('td'), col1), addEl(makeEl('td'),col2)]);
    };

})(this['UI']={});