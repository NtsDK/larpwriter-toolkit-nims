const Slider = require('bootstrap-slider');
require('bootstrap-slider/dist/css/bootstrap-slider.min.css');
require('./sliders.css');
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

// ((exports) => {
const root = '.sliders-tab ';
const state = {};
state.sliders = [];

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

    U.listen(U.qe(`${root} .create`), 'click', () => createSliderDialog.showDlg());

    exports.content = U.queryEl(root);
};

exports.refresh = () => {
    DBMS.getSliderData().then(createSliders).catch(UI.handleError);
};

function createSliders(model) {
    const positions = model.map(info => ({ name: CU.strFormat(L10n.get('common', 'set-item-before'), [info.name]) }));
    positions.push({ name: L10n.get('common', 'set-item-as-last') });
    U.fillSelector(U.clearEl(U.qe(`${root} .move-slider-pos-select`)), positions);

    U.addEls(U.clearEl(U.queryEl('.mixer-panel .panel-body')), model.map(makeSliderBackbone));

    U.clearEls(state.sliders);

    state.sliders = model.map((sl, i) => {
        const slider = new Slider(`.mixer-panel .panel-body input[pos="${i}"]`, {
            max: 10,
            min: -10,
            orientation: 'vertical',
            reversed: true,
            tooltip: 'always',
            value: sl.value,
            formatter(value) {
                return Math.abs(value);
            },
        });
        slider.on('change', (event) => {
            DBMS.updateSliderValue({ index: i, value: event.newValue }).catch(UI.handleError);
        });
        return slider;
    });
}

var makeSliderBackbone = (sl, i) => {
    const el = U.qmte(`${root} .slider-container-tmpl`);
    U.setAttr(U.qee(el, 'input'), 'pos', i);
    U.addEl(U.qee(el, '.slider-name'), U.makeText(sl.name));
    U.addEl(U.qee(el, '.slider-top'), U.makeText(sl.top));
    U.addEl(U.qee(el, '.slider-bottom'), U.makeText(sl.bottom));

    U.listen(U.qee(el, 'button.move'), 'click', () => {
        state.moveSliderDialog.currentIndex = i;
        state.moveSliderDialog.showDlg();
    });
    U.listen(U.qee(el, 'button.rename'), 'click', () => {
        U.qee(state.editSliderDialog, '.slider-name').value = sl.name;
        U.qee(state.editSliderDialog, '.slider-top').value = sl.top;
        U.qee(state.editSliderDialog, '.slider-bottom').value = sl.bottom;
        state.editSliderDialog.pos = i;
        state.editSliderDialog.showDlg();
    });
    U.listen(U.qee(el, 'button.remove'), 'click', () => {
        UI.confirm(L10n.format('sliders', 'are-you-sure-about-removing-slider', [sl.name]), () => {
            DBMS.removeSlider({ index: i }).then(exports.refresh, UI.handleError);
        });
    });
    L10n.localizeStatic(el);
    return el;
};

function createSlider(dialog) {
    return () => {
        const name = U.qee(dialog, '.slider-name').value.trim();
        const top = U.qee(dialog, '.slider-top').value.trim();
        const bottom = U.qee(dialog, '.slider-bottom').value.trim();
        DBMS.createSlider({ name, top, bottom }).then(() => {
            U.qee(dialog, '.slider-name').value = '';
            U.qee(dialog, '.slider-top').value = '';
            U.qee(dialog, '.slider-bottom').value = '';
            dialog.hideDlg();
            exports.refresh();
        }).catch(err => UI.setError(dialog, err));
    };
}

function editSlider(dialog) {
    return () => {
        const name = U.qee(dialog, '.slider-name').value.trim();
        const top = U.qee(dialog, '.slider-top').value.trim();
        const bottom = U.qee(dialog, '.slider-bottom').value.trim();
        const pos = dialog.pos;
        DBMS.updateSliderNaming({
            index: pos,
            name,
            top,
            bottom
        }).then(() => {
            U.qee(dialog, '.slider-name').value = '';
            U.qee(dialog, '.slider-top').value = '';
            U.qee(dialog, '.slider-bottom').value = '';
            dialog.hideDlg();
            exports.refresh();
        }).catch(err => UI.setError(dialog, err));
    };
}

function moveSlider(dialog) {
    return () => {
        const index = dialog.currentIndex;
        const pos = U.qee(dialog, '.move-slider-pos-select').selectedIndex;

        DBMS.moveSlider({ index, pos }).then(() => {
            dialog.hideDlg();
            exports.refresh();
        }).catch(err => UI.setError(dialog, err));
    };
}
// })(window.Sliders = {});
