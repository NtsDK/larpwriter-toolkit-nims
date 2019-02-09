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

const Constants = require('common/constants');
const Export = require('resources/export');
const PermissionInformer = require('permissionInformer');
const R = require('ramda');

const Mustache = require('mustache');
const Docxtemplater = require('docxtemplater');
const JSZip = require('jszip');
const { saveAs } = require('file-saver');

const markdownit = require('markdown-it');

const state = {};
const root = '.briefing-export-tab ';

state.templates = {};
state.customDocxTemplate = null;

let generateSingleDocx, generateSingleTxt, refreshStorySetSelect, refreshCharacterSetSelect;

exports.init = () => {
//        U.listen(U.queryEl('#makeDefaultTextBriefings'), 'click', () => {
//            resolveTextTemplate((textTemplate) => {
//                makeTextBriefings('txt', generateSingleTxt(textTemplate));
//            });
//        });

    U.listen(U.queryEl('#makeCustomTextBriefings'), 'click', () => {
        makeTextBriefings(U.queryEl('#textTypeSelector').value, generateSingleTxt(U.queryEl('#templateArea').value));
    });
    U.listen(U.queryEl('#makeMarkdownBriefings'), 'click', () => {
        makeTextBriefings('html', R.compose(data => markdownit('commonmark').render(data), generateSingleTxt(U.queryEl('#templateArea').value)));
    });

    U.listen(U.queryEl('#docxBriefings'), 'change', readTemplateFile);
    U.listen(U.queryEl('#docxBriefings'), 'focus', (e) => {
        e.target.value = '';
        state.customDocxTemplate = null;
    });

    U.listen(U.queryEl('#makeDocxBriefings'), 'click', () => {
        if (state.customDocxTemplate === null) {
            UI.alert(L10n.getValue('briefings-custom-docx-template-is-missing'));
        } else {
            exportDocxByTemplate(state.customDocxTemplate);
        }
    });


    let els = U.queryElEls(document, `${root} input[name=exportCharacterSelection]`);
    els.map(U.listen(R.__, 'change', onCharacterSelectionChange));
    U.queryEl('#exportAllCharacters').checked = true;

    els = U.queryElEls(document, `${root} input[name=exportStorySelection]`);
    els.map(U.listen(R.__, 'change', onStorySelectionChange));
    U.queryEl('#exportAllStories').checked = true;

    const el = U.queryEl('#briefingNumberSelector');
    Constants.briefingNumber.forEach(R.compose(U.addEl(el), U.makeOpt));
    U.listen(el, 'change', refreshCharacterRangeSelect);

    state.briefingNumberSelector = el;
    state.briefingIntervalSelector = U.queryEl('#briefingIntervalSelector');
    state.characterSetSelector = U.queryEl('#characterSetSelector');
    state.storySetSelector = U.queryEl('#storySetSelector');

    U.queryEl('#makeBriefingsByTime '.trim()).addEventListener('click', makeExport('templateByTime'));
    U.queryEl('#makeBriefingsByStory'.trim()).addEventListener('click', makeExport('templateByStory'));
    U.queryEl('#makeInventoryList   '.trim()).addEventListener('click', makeExport('inventoryTemplate'));

    UI.initTabPanel('exportModeButton', 'exportContainer');

    U.listen(U.queryEl('#previewTextOutput'), 'click', previewTextOutput);
    U.queryEl('#textBriefingPreviewArea').value = '';

    U.listen(U.queryEl('#showRawData'), 'click', previewTextDataAsIs);

    U.listen(U.queryEl('#convertToDocxTemplate'), 'click', convertToDocxTemplate);
    U.listen(U.queryEl('#generateByDocxTemplate'), 'click', generateByDocxTemplate);

    exports.content = U.queryEl(root);
};

exports.refresh = () => {
    resolveTextTemplate((textTemplate) => {
        U.queryEl('#templateArea').value = textTemplate;
        refreshCharacterRangeSelect();
        refreshCharacterSetSelect();
        refreshStorySetSelect();
    });
};

function resolveTextTemplate(callback) {
    DBMS.getProfileStructure({ type: 'character' }).then((profileSettings) => {
        const func = R.compose(R.join(''), R.insert(1, R.__, ['{{profileInfo-', '}}\n']), R.prop('name'));
        const filter = R.compose(R.equals(true), R.prop('doExport'));
        const value = profileSettings.filter(filter).map(func).join('');

        callback(R.replace(/\{0\}/g, value, Export.getTemplate(L10n.getLang(), 'textTemplate')));
    }).catch(UI.handleError);
}

function onCharacterSelectionChange(event) {
    const exportCharacterRange = event.target.id === 'exportCharacterRange';
    const exportCharacterSet = event.target.id === 'exportCharacterSet';
    U.hideEl(U.queryEl('#characterRangeSelect'), !exportCharacterRange);
    U.hideEl(U.queryEl('#characterSetSelect'), !exportCharacterSet);
}

function onStorySelectionChange(event) {
    const exportStorySet = event.target.id === 'exportStorySet';
    U.hideEl(U.queryEl('#storySetSelect'), !exportStorySet);
}

function getSelectedUsers() {
    const { id } = U.getSelectedRadio(U.qe(root), 'input[name=exportCharacterSelection]');
    switch (id) {
    case 'exportAllCharacters':
        return null;
    case 'exportCharacterRange':
        return JSON.parse(state.briefingIntervalSelector.selectedOptions[0].value);
    case 'exportCharacterSet':
        return U.nl2array(state.characterSetSelector.selectedOptions).map(opt => opt.value);
    default:
        UI.alert(`unexpected id: ${id}`);
    }
    return null;
}

function getSelectedStories() {
    const { id } = U.getSelectedRadio(U.qe(root), 'input[name=exportStorySelection]');
    switch (id) {
    case 'exportAllStories':
        return null;
    case 'exportStorySet':
        return U.nl2array(state.storySetSelector.selectedOptions).map(opt => opt.value);
    default:
        UI.alert(`unexpected id: ${id}`);
    }
    return null;
}

function refreshCharacterRangeSelect() {
    const selector = U.clearEl(state.briefingIntervalSelector);
    const num = Number(state.briefingNumberSelector.value);

    let chunks;
    PermissionInformer.getEntityNamesArray({ type: 'character', editableOnly: false }).then((names) => {
        if (names.length > 0) {
            chunks = R.splitEvery(num, names);
            const data = chunks.map(chunk => ({
                id: JSON.stringify(chunk.map(nameInfo => nameInfo.value)),
                text: chunk.length === 1 ? chunk[0].displayName
                    : `${chunk[0].displayName} - ${chunk[chunk.length - 1].displayName}`
            }));

            $(`#${state.briefingIntervalSelector.id}`).select2({ data });
        }
    }).catch(UI.handleError);
}


function refreshSetSelect(entityType, selectorName) {
    const multiSel = U.clearEl(state[selectorName]);
    PermissionInformer.getEntityNamesArray({ type: entityType, editableOnly: false }).then((names) => {
        if (names.length > 0) {
            U.fillSelector(multiSel, names.map(UI.remapProps4Select));
            U.setAttr(multiSel, 'size', names.length > 15 ? 15 : names.length);
        }
    }).catch(UI.handleError);
}

refreshStorySetSelect = () => refreshSetSelect('story', 'storySetSelector');
refreshCharacterSetSelect = () => refreshSetSelect('character', 'characterSetSelector');

function makeExport(type) {
    return () => {
        // if (!state.templates[type]) {
        state.templates[type] = atob(Export.getTemplate(L10n.getLang(), type));
        // }
        exportDocxByTemplate(state.templates[type]);
    };
}

function postprocessCheckboxes(briefingData, profileStructure, prefix, arrName) {
    const checkboxNames = profileStructure.filter(item => item.type === 'checkbox').map(R.prop('name'));
    briefingData.briefings.forEach((charData) => {
        if (charData[arrName] === undefined) return;
        charData[arrName].forEach((element) => {
            if (checkboxNames.indexOf(element.itemName) !== -1) {
                element.value = L10n.const(Constants[element.value]);
                element.splittedText = [{ string: element.value }];
            }
        });
        checkboxNames.forEach((name) => {
            charData[prefix + name] = L10n.const(Constants[charData[prefix + name]]);
        });
    });
}

function getBriefingData(callback) {
    Promise.all([
        DBMS.getBriefingData({
            selCharacters: getSelectedUsers(),
            selStories: getSelectedStories(),
            exportOnlyFinishedStories: U.queryEl('#exportOnlyFinishedStories').checked
        }),
        DBMS.getProfileStructure({ type: 'character' }),
        DBMS.getProfileStructure({ type: 'player' }),
    ]).then((results) => {
        const [briefingData, characterProfileStructure, playerProfileStructure] = results;
        postprocessCheckboxes(briefingData, characterProfileStructure, 'profileInfo-', 'profileInfoArray');
        postprocessCheckboxes(briefingData, playerProfileStructure, 'playerInfo-', 'playerInfoArray');
        callback(null, briefingData);
    }).catch(UI.handleError);
}

function exportDocxByTemplate(template) {
    getBriefingData((err, briefingData) => {
        if (err) { UI.handleError(err); return; }
        generateBriefings(briefingData, 'docx', generateSingleDocx('blob', template), generateSingleDocx('Uint8Array', template));
    });
}

function convertToDocxTemplate() {
    const docxTemplate = makeDocxTemplate('blob');
    UI.confirm(L10n.getValue('briefings-save-file'), () => {
        saveAs(docxTemplate, FileUtils.makeFileName('template', 'docx'));
    });
}

function generateByDocxTemplate() {
    exportDocxByTemplate(makeDocxTemplate('Uint8Array'));
}

function makeDocxTemplate(type) {
    let template = U.queryEl('#templateArea').value;

    const replaceBrackets = R.pipe(R.replace(/{{{/g, '{'), R.replace(/}}}/g, '}'), R.replace(/{{/g, '{'), R.replace(/}}/g, '}'));
    template = replaceBrackets(template).split('\n').map(string => ({ string }));

    // if (!state.templates.genericTemplate) {
    state.templates.genericTemplate = atob(Export.getTemplate(L10n.getLang(), 'genericTemplate'));
    // }

    const doc = new Docxtemplater();
    const zip = new JSZip(state.templates.genericTemplate);
    doc.loadZip(zip);

    // const doc = new window.Docxgen(state.templates.genericTemplate);
    doc.setData({
        splittedText: template
    });
    doc.render();
    return doc.getZip().generate({
        type
    });
}
function previewTextDataAsIs() {
    getBriefingData((err, briefingData) => {
        if (err) { UI.handleError(err); return; }
        U.queryEl('#textBriefingPreviewArea').value = JSON.stringify(briefingData, null, '  ');
    });
}

function previewTextOutput() {
    getBriefingData((err, data) => {
        if (err) { UI.handleError(err); return; }
        U.queryEl('#textBriefingPreviewArea').value = generateSingleTxt(U.queryEl('#templateArea').value, data);
    });
}

function makeTextBriefings(fileType, delegate) {
    getBriefingData((err, briefingData) => {
        if (err) { UI.handleError(err); return; }
        generateBriefings(briefingData, fileType, (data) => {
            const result = delegate(data);
            return new Blob([result], {
                type: 'text/plain;charset=utf-8'
            });
        }, delegate);
    });
}

function readTemplateFile(evt) {
    // Retrieve the first (and only!) File from the FileList object
    const f = evt.target.files[0];

    if (f) {
        const r = new FileReader();
        r.onload = (e) => {
            state.customDocxTemplate = e.target.result;
            UI.alert(L10n.getValue('briefings-template-is-loaded'));
        };
        r.readAsBinaryString(f);
    } else {
        UI.alert(L10n.getValue('briefings-error-on-template-uploading'));
    }
}

function updateStatus(text) {
    const exportStatus = U.queryEl('#exportStatus');
    U.clearEl(exportStatus);
    exportStatus.appendChild(U.makeText(text));
}

function generateBriefings(briefingData, fileType, oneFileDelegate, separateFileDelegate) {
    const toSeparateFiles = U.queryEl('#toSeparateFileCheckbox').checked;

    const fileName = 'characterSheets';

    let out, archive;
    updateStatus(L10n.getValue('briefings-save-preparing'));
    try {
        if (toSeparateFiles) {
            const zip = new JSZip();
            const content = zip.generate();
            updateStatus(L10n.getValue('briefings-start-saving'));

            const res = makeArchiveData(briefingData, separateFileDelegate);
            R.keys(res).forEach((key) => {
                zip.file(`${key}.${fileType}`, res[key]);
            });

            updateStatus(L10n.getValue('briefings-archiving'));
            archive = zip.generate({ type: 'blob' });
            updateStatus(L10n.getValue('briefings-archive-is-ready'));
            saveFile('briefings-save-archive', archive, fileName, 'zip');
        } else {
            updateStatus(L10n.getValue('briefings-start-saving'));
            out = oneFileDelegate(briefingData);
            updateStatus(L10n.getValue('briefings-file-is-ready'));
            saveFile('briefings-save-file', out, fileName, fileType);
        }
    } catch (err) {
        UI.alert(L10n.getValue('briefings-error-on-generating-briefings'));
        console.log(err);
    }
}

function saveFile(msgKey, out, fileName, extension) {
    UI.confirm(L10n.getValue(msgKey), () => {
        saveAs(out, FileUtils.makeFileName(fileName, extension));
    });
}

function makeArchiveData(briefingData, generateSingleDelegate) {
    const res = {};
    briefingData.briefings.forEach((briefing, i) => {
        const name = briefing.charName + (briefing.playerName ? `_${briefing.playerName}` : '');
        res[name] = generateSingleDelegate({
            gameName: briefingData.gameName,
            briefings: [briefing]
        });
        updateStatus(CU.strFormat(L10n.getValue('briefings-save-status'), [i + 1, briefingData.briefings.length]));
    });
    return res;
}

generateSingleDocx = R.curry((type, template, data) => {
    // const doc = new window.Docxgen(template);
    const doc = new Docxtemplater();
    const zip = new JSZip(template);
    doc.loadZip(zip);
    doc.setData(data);
    doc.render(); // apply them (replace all occurences of {first_name} by
    // Hipp, ...)
    const out = doc.getZip().generate({
        type
    });
    return out;
});

generateSingleTxt = R.curry((template, data) => {
    try {
        return Mustache.render(template, data);
    } catch (err) {
        UI.alert(CU.strFormat(L10n.getValue('briefings-template-error'), [err.message]));
        throw err;
    }
});
// })(window.BriefingExport = {});
