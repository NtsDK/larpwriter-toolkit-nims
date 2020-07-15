import Slider from 'bootstrap-slider';
import ReactDOM from 'react-dom';
import { getSliderContainer } from "./SliderContainer.jsx";
import { getSlidersTemplate, getCreateSliderBody, getMoveSliderBody } from "./SlidersTemplate.jsx";
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
import './sliders.css';
import { createModalDialog } from "../commons/uiCommons";
import { UI, U, L10n } from 'nims-app-core';

const root = '.sliders-tab ';
const state = {};
state.sliders = [];

let content;

function getContent(){
    return content;
}

function init(){
    content = U.makeEl('div');
    U.addEl(U.qe('.tab-container'), content);
    ReactDOM.render(getSlidersTemplate(), content);
    L10n.localizeStatic(content);

    const createSliderDialog = createModalDialog(root, createSlider, {
        dialogTitle: 'sliders-create-slider',
        actionButtonTitle: 'common-create',
        getComponent: getCreateSliderBody,
        componentClass: '.CreateSliderBody'
    });

    state.editSliderDialog = createModalDialog(root, editSlider, {
        // bodySelector: 'create-slider-body',
        dialogTitle: 'sliders-edit-slider',
        actionButtonTitle: 'common-save',
        getComponent: getCreateSliderBody,
        componentClass: '.CreateSliderBody'
    });

    state.moveSliderDialog = createModalDialog(root, moveSlider, {
        // bodySelector: 'move-slider-body',
        dialogTitle: 'sliders-move-slider',
        actionButtonTitle: 'common-move',
        getComponent: getMoveSliderBody,
        componentClass: '.MoveSliderBody'
    });

    U.listen(U.qe(`${root} .create`), 'click', () => createSliderDialog.showDlg());

    content = U.queryEl(root);
};

function refresh(){
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

function makeSliderBackbone(sl, i) {
    const content = U.makeEl('div');
    ReactDOM.render(getSliderContainer(), content);
    const el =  U.qee(content, '.SliderContainer');

    // const el = U.qmte(`${root} .slider-container-tmpl`);
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
            DBMS.removeSlider({ index: i }).then(refresh, UI.handleError);
        });
    });
    L10n.localizeStatic(el);
    return el;
}

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
            refresh();
        }).catch(err => UI.setError(dialog, err));
    };
}

function editSlider(dialog) {
    return () => {
        const name = U.qee(dialog, '.slider-name').value.trim();
        const top = U.qee(dialog, '.slider-top').value.trim();
        const bottom = U.qee(dialog, '.slider-bottom').value.trim();
        const { pos } = dialog;
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
            refresh();
        }).catch(err => UI.setError(dialog, err));
    };
}

function moveSlider(dialog) {
    return () => {
        const index = dialog.currentIndex;
        const pos = U.qee(dialog, '.move-slider-pos-select').selectedIndex;

        DBMS.moveSlider({ index, pos }).then(() => {
            dialog.hideDlg();
            refresh();
        }).catch(err => UI.setError(dialog, err));
    };
}

export default {
    init, refresh, getContent
}

