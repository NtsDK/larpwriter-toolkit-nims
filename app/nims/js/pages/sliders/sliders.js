/*Copyright 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

'use strict';

((exports) => {
    const root = '.sliders-tab ';
    const state = {};
    state.sliders = [];
    
    const model = [{
        name: 'Тип коммуникации',
        top: 'Вербальный',
        bottom: 'Невербальный',
        value: 5
    }, {
        name: 'Открытость',
        top: 'Прозрачность',
        bottom: 'Тайна',
        value: -2
    }];

    exports.init = () => {
        const createSliderDialog = UI.createModalDialog(root, createSlider, {
            bodySelector: 'create-slider-body',
            dialogTitle: 'sliders-create-slider',
            actionButtonTitle: 'common-create',
        });
        
        state.editSliderDialog = UI.createModalDialog(root, editSlider, {
            bodySelector: 'create-slider-body',
            dialogTitle: 'sliders-edit-slider',
            actionButtonTitle: 'common-save',
        });
        
        state.moveSliderDialog = UI.createModalDialog(root, moveSlider, {
            bodySelector: 'move-slider-body',
            dialogTitle: 'sliders-move-slider',
            actionButtonTitle: 'common-move',
        });
        
        listen(qe(`${root} .create`), 'click', () => createSliderDialog.showDlg());
        
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        const positions = model.map( info => {return {name: strFormat(L10n.get('common', 'set-item-before'), [info.name])}});
        positions.push({name: L10n.get('common', 'set-item-as-last')});
        fillSelector(clearEl(qe(`${root} .move-slider-pos-select`)), positions);
        
        addEls(clearEl(queryEl('.mixer-panel .panel-body')), model.map( makeSliderBackbone )) ;
        
        clearEls(state.sliders);
        
        state.sliders = model.map( (sl, i) => new Slider('.mixer-panel .panel-body input[pos="' + i + '"]', {
            max: 10,
            min: -10,
            orientation: 'vertical',
            reversed: true,
            tooltip: 'always',
            value: sl.value,
            formatter: function(value) {
                return Math.abs(value);
            },
        }).on('change', (event) => {sl.value = event.newValue; DBMSstoreSliderData();}));
    };
    
    var makeSliderBackbone = (sl, i) => {
        const el = qmte(`${root} .slider-container-tmpl`);
        setAttr(qee(el, 'input'), 'pos', i);
        addEl(qee(el, '.slider-name'), makeText(sl.name));
        addEl(qee(el, '.slider-top'), makeText(sl.top));
        addEl(qee(el, '.slider-bottom'), makeText(sl.bottom));
        
        listen(qee(el, 'button.move'), 'click', () => {
            state.moveSliderDialog.currentIndex = i;
            state.moveSliderDialog.showDlg();
        });
        listen(qee(el, 'button.rename'), 'click', () => {
            qee(state.editSliderDialog, '.slider-name').value = sl.name;
            qee(state.editSliderDialog, '.slider-top').value = sl.top;
            qee(state.editSliderDialog, '.slider-bottom').value = sl.bottom;
            state.editSliderDialog.pos = i;
            state.editSliderDialog.showDlg();
        });
        listen(qee(el, 'button.remove'), 'click', () => {
            Utils.confirm(L10n.format('sliders', 'are-you-sure-about-removing-slider', [sl.name]), () => {
                DBMSremoveSlider(i, Utils.processError(exports.refresh));
            })
        });
        L10n.localizeStatic(el);
        return el;
    };
    
    function createSlider(dialog) {
        return () => {
            const name = qee(dialog, '.slider-name').value.trim();
            const top = qee(dialog, '.slider-top').value.trim();
            const bottom = qee(dialog, '.slider-bottom').value.trim();
            DBMScreateSlider(name, top, bottom, (err) => {
                if (err) {
                    setError(dialog, err);
                } else {
                    qee(dialog, '.slider-name').value = '';
                    qee(dialog, '.slider-top').value = '';
                    qee(dialog, '.slider-bottom').value = '';
                    dialog.hideDlg();
                    exports.refresh();
                }
            });
        };
    }
    
    function editSlider(dialog) {
        return () => {
            const name = qee(dialog, '.slider-name').value.trim();
            const top = qee(dialog, '.slider-top').value.trim();
            const bottom = qee(dialog, '.slider-bottom').value.trim();
            const pos = dialog.pos;
            DBMSupdateSlider(pos, name, top, bottom, (err) => {
                if (err) {
                    setError(dialog, err);
                } else {
                    qee(dialog, '.slider-name').value = '';
                    qee(dialog, '.slider-top').value = '';
                    qee(dialog, '.slider-bottom').value = '';
                    dialog.hideDlg();
                    exports.refresh();
                }
            });
        }
    }
    
    function moveSlider(dialog) {
        return () => {
            var index = dialog.currentIndex;
            var pos = qee(dialog, '.move-slider-pos-select').selectedIndex;
            
            DBMSmoveSlider(index, pos, (err) => {
                if (err) {
                    setError(dialog, err);
                } else {
                    dialog.hideDlg();
                    exports.refresh();
                }
            })
        }
    }

    
    function DBMSmoveSlider(index, pos, callback){
        if(pos > index){
            pos--;
        }
        var tmp = model[index];
        model.splice(index, 1);
        model.splice(pos, 0, tmp);
        
        if(callback) callback();
    }
    
    function DBMSstoreSliderData(callback){
        if(callback) callback();
    }
    
    function DBMScreateSlider(name, top, bottom, callback){
        model.push({ name, top, bottom });
        callback();
    }
    
    function DBMSupdateSlider(pos, name, top, bottom, callback){
        model[pos].name = name;
        model[pos].top = top;
        model[pos].bottom = bottom;
        callback();
    }
    
    function DBMSremoveSlider(pos, callback){
        CommonUtils.removeFromArrayByIndex(model, pos);
        callback();
    }
})(this.Sliders = {});
