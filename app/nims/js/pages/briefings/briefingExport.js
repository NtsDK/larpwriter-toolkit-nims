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

'use strict';

((exports) => {
    const state = {};

    state.templates = {};
    state.customDocxTemplate = null;

    let generateSingleDocx, generateSingleTxt, refreshStorySetSelect, refreshCharacterSetSelect;

    exports.init = () => {
        listen(getEl('makeDefaultTextBriefings'), 'click', () => {
            resolveTextTemplate((textTemplate) => {
                makeTextBriefings('txt', generateSingleTxt(textTemplate));
            });
        });

        listen(getEl('makeCustomTextBriefings'), 'click', () => {
            makeTextBriefings(getEl('textTypeSelector').value, generateSingleTxt(getEl('templateArea').value));
        });
        listen(getEl('makeMarkdownBriefings'), 'click', () => {
            makeTextBriefings('html', R.compose(data => markdownit('commonmark').render(data), generateSingleTxt(getEl('templateArea').value)));
        });

        listen(getEl('docxBriefings'), 'change', readTemplateFile);
        listen(getEl('docxBriefings'), 'focus', (e) => {
            e.target.value = '';
            state.customDocxTemplate = null;
        });

        listen(getEl('makeDocxBriefings'), 'click', () => {
            if (state.customDocxTemplate === null) {
                Utils.alert(getL10n('briefings-custom-docx-template-is-missing'));
            } else {
                exportDocxByTemplate(state.customDocxTemplate);
            }
        });


        let els = queryElEls(document, '#briefingExportDiv input[name=exportCharacterSelection]');
        els.map(listen(R.__, 'change', onCharacterSelectionChange));
        getEl('exportAllCharacters').checked = true;

        els = queryElEls(document, '#briefingExportDiv input[name=exportStorySelection]');
        els.map(listen(R.__, 'change', onStorySelectionChange));
        getEl('exportAllStories').checked = true;

        const el = getEl('briefingNumberSelector');
        Constants.briefingNumber.forEach(R.compose(addEl(el), makeOpt));
        listen(el, 'change', refreshCharacterRangeSelect);

        state.briefingNumberSelector = el;
        state.briefingIntervalSelector = getEl('briefingIntervalSelector');
        state.characterSetSelector = getEl('characterSetSelector');
        state.storySetSelector = getEl('storySetSelector');

        getEl('makeBriefingsByTime '.trim()).addEventListener('click', makeExport('templateByTime'));
        getEl('makeBriefingsByStory'.trim()).addEventListener('click', makeExport('templateByStory'));
        getEl('makeInventoryList   '.trim()).addEventListener('click', makeExport('inventoryTemplate'));

        UI.initTabPanel('exportModeButton', 'exportContainer');

        listen(getEl('previewTextOutput'), 'click', previewTextOutput);
        getEl('textBriefingPreviewArea').value = '';

        listen(getEl('showRawData'), 'click', previewTextDataAsIs);

        listen(getEl('convertToDocxTemplate'), 'click', convertToDocxTemplate);
        listen(getEl('generateByDocxTemplate'), 'click', generateByDocxTemplate);

        exports.content = getEl('briefingExportDiv');
    };

    exports.refresh = () => {
        resolveTextTemplate((textTemplate) => {
            getEl('templateArea').value = textTemplate;
            refreshCharacterRangeSelect();
            refreshCharacterSetSelect();
            refreshStorySetSelect();
        });
    };

    function resolveTextTemplate(callback) {
        DBMS.getProfileStructure('character', (err, profileSettings) => {
            if (err) { Utils.handleError(err); return; }
            const func = R.compose(R.join(''), R.insert(1, R.__, ['{{profileInfo-', '}}\n']), R.prop('name'));
            const filter = R.compose(R.equals(true), R.prop('doExport'));
            const value = profileSettings.filter(filter).map(func).join('');

            callback(R.replace(/\{0\}/g, value, TEXT_TEMPLATE));
        });
    }

    function onCharacterSelectionChange(event) {
        const exportCharacterRange = event.target.id === 'exportCharacterRange';
        const exportCharacterSet = event.target.id === 'exportCharacterSet';
        hideEl(getEl('characterRangeSelect'), !exportCharacterRange);
        hideEl(getEl('characterSetSelect'), !exportCharacterSet);
    }

    function onStorySelectionChange(event) {
        const exportStorySet = event.target.id === 'exportStorySet';
        hideEl(getEl('storySetSelect'), !exportStorySet);
    }

    function getSelectedUsers() {
        const { id } = getSelectedRadio('#briefingExportDiv input[name=exportCharacterSelection]');
        switch (id) {
        case 'exportAllCharacters':
            return null;
        case 'exportCharacterRange':
            return JSON.parse(state.briefingIntervalSelector.selectedOptions[0].value);
        case 'exportCharacterSet':
            return nl2array(state.characterSetSelector.selectedOptions).map(opt => opt.value);
        default:
            Utils.alert(`unexpected id: ${id}`);
        }
        return null;
    }

    function getSelectedStories() {
        const { id } = getSelectedRadio('#briefingExportDiv input[name=exportStorySelection]');
        switch (id) {
        case 'exportAllStories':
            return null;
        case 'exportStorySet':
            return nl2array(state.storySetSelector.selectedOptions).map(opt => opt.value);
        default:
            Utils.alert(`unexpected id: ${id}`);
        }
        return null;
    }

    function refreshCharacterRangeSelect() {
        const selector = clearEl(state.briefingIntervalSelector);
        const num = Number(state.briefingNumberSelector.value);

        let chunks;
        PermissionInformer.getEntityNamesArray('character', false, (err, names) => {
            if (err) { Utils.handleError(err); return; }
            if (names.length > 0) {
                chunks = R.splitEvery(num, names);
                const data = chunks.map(chunk => ({
                    id: JSON.stringify(chunk.map(nameInfo => nameInfo.value)),
                    text: chunk.length === 1 ? chunk[0].displayName :
                        `${chunk[0].displayName} - ${chunk[chunk.length - 1].displayName}`
                }));

                $(`#${state.briefingIntervalSelector.id}`).select2({ data });
            }
        });
    }


    function refreshSetSelect(entityType, selectorName) {
        const multiSel = clearEl(state[selectorName]);
        PermissionInformer.getEntityNamesArray(entityType, false, (err, names) => {
            if (err) { Utils.handleError(err); return; }
            if (names.length > 0) {
                fillSelector(multiSel, names.map(remapProps4Select));
                setAttr(multiSel, 'size', names.length > 15 ? 15 : names.length);
            }
        });
    }

    refreshStorySetSelect = () => refreshSetSelect('story', 'storySetSelector');
    refreshCharacterSetSelect = () => refreshSetSelect('character', 'characterSetSelector');

    function makeExport(type) {
        return () => {
            if (!state.templates[type]) {
                state.templates[type] = atob(templatesArr[type]);
            }
            exportDocxByTemplate(state.templates[type]);
        };
    }

    function postprocessCheckboxes(briefingData, profileStructure, prefix, arrName) {
        const checkboxNames = profileStructure.filter(item => item.type === 'checkbox').map(R.prop('name'));
        briefingData.briefings.forEach((charData) => {
            if (charData[arrName] === undefined) return;
            charData[arrName].forEach((element) => {
                if (checkboxNames.indexOf(element.itemName) !== -1) {
                    element.value = constL10n(Constants[element.value]);
                    element.splittedText = [{ string: element.value }];
                }
            });
            checkboxNames.forEach((name) => {
                charData[prefix + name] = constL10n(Constants[charData[prefix + name]]);
            });
        });
    }

    function getBriefingData(callback) {
        DBMS.getBriefingData(getSelectedUsers(), getSelectedStories(), getEl('exportOnlyFinishedStories').checked, (err, briefingData) => {
            if (err) { Utils.handleError(err); return; }
            // some postprocessing
            DBMS.getProfileStructure('character', (err2, characterProfileStructure) => {
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getProfileStructure('player', (err3, playerProfileStructure) => {
                    if (err3) { Utils.handleError(err3); return; }
                    postprocessCheckboxes(briefingData, characterProfileStructure, 'profileInfo-', 'profileInfoArray');
                    postprocessCheckboxes(briefingData, playerProfileStructure, 'playerInfo-', 'playerInfoArray');
                    callback(null, briefingData);
                });
            });
        });
    }

    function exportDocxByTemplate(template) {
        getBriefingData((err, briefingData) => {
            if (err) { Utils.handleError(err); return; }
            generateBriefings(briefingData, 'docx', generateSingleDocx('blob', template), generateSingleDocx('Uint8Array', template));
        });
    }

    function convertToDocxTemplate() {
        const docxTemplate = makeDocxTemplate('blob');
        Utils.confirm(getL10n('briefings-save-file'), () => {
            saveAs(docxTemplate, 'template.docx');
        });
    }

    function generateByDocxTemplate() {
        exportDocxByTemplate(makeDocxTemplate('Uint8Array'));
    }

    function makeDocxTemplate(type) {
        let template = getEl('templateArea').value;

        const replaceBrackets = R.pipe(R.replace(/{{{/g, '{'), R.replace(/}}}/g, '}'), R.replace(/{{/g, '{'), R.replace(/}}/g, '}'));
        template = replaceBrackets(template).split('\n').map(string => ({ string }));

        if (!state.templates.genericTemplate) {
            state.templates.genericTemplate = atob(templatesArr.genericTemplate);
        }

        const doc = new window.Docxgen(state.templates.genericTemplate);
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
            if (err) { Utils.handleError(err); return; }
            getEl('textBriefingPreviewArea').value = JSON.stringify(briefingData, null, '  ');
        });
    }

    function previewTextOutput() {
        getBriefingData((err, data) => {
            if (err) { Utils.handleError(err); return; }
            getEl('textBriefingPreviewArea').value = generateSingleTxt(getEl('templateArea').value, data);
        });
    }

    function makeTextBriefings(fileType, delegate) {
        getBriefingData((err, briefingData) => {
            if (err) { Utils.handleError(err); return; }
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
                Utils.alert(getL10n('briefings-template-is-loaded'));
            };
            r.readAsBinaryString(f);
        } else {
            Utils.alert(getL10n('briefings-error-on-template-uploading'));
        }
    }

    function updateStatus(text) {
        const exportStatus = getEl('exportStatus');
        clearEl(exportStatus);
        exportStatus.appendChild(makeText(text));
    }

    function generateBriefings(briefingData, fileType, oneFileDelegate, separateFileDelegate) {
        const toSeparateFiles = getEl('toSeparateFileCheckbox').checked;

        const fileName = 'briefings';

        let out, archive;
        updateStatus(getL10n('briefings-save-preparing'));
        try {
            if (toSeparateFiles) {
                const zip = new JSZip();
                const content = zip.generate();
                updateStatus(getL10n('briefings-start-saving'));

                const res = makeArchiveData(briefingData, separateFileDelegate);
                R.keys(res).forEach((key) => {
                    zip.file(`${key}.${fileType}`, res[key]);
                });

                updateStatus(getL10n('briefings-archiving'));
                archive = zip.generate({ type: 'blob' });
                updateStatus(getL10n('briefings-archive-is-ready'));
                saveFile('briefings-save-archive', archive, `${fileName}.zip`);
            } else {
                updateStatus(getL10n('briefings-start-saving'));
                out = oneFileDelegate(briefingData);
                updateStatus(getL10n('briefings-file-is-ready'));
                saveFile('briefings-save-file', out, `${fileName}.${fileType}`);
            }
        } catch (err) {
            Utils.alert(getL10n('briefings-error-on-generating-briefings'));
            console.log(err);
        }
    }

    function saveFile(msgKey, out, fileName) {
        Utils.confirm(getL10n(msgKey), () => {
            saveAs(out, fileName);
        });
    }

    function makeArchiveData(briefingData, generateSingleDelegate) {
        const res = {};
        briefingData.briefings.forEach((briefing, i) => {
            res[briefing.charName] = generateSingleDelegate({
                gameName: briefingData.gameName,
                briefings: [briefing]
            });
            updateStatus(strFormat(getL10n('briefings-save-status'), [i + 1, briefingData.briefings.length]));
        });
        return res;
    }

    generateSingleDocx = R.curry((type, template, data) => {
        const doc = new window.Docxgen(template);
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
            Utils.alert(strFormat(getL10n('briefings-template-error'), [err.message]));
            throw err;
        }
    });
})(this.BriefingExport = {});
