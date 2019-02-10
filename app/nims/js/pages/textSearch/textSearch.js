/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

//const R = require('ramda');

// ((exports) => {
const root = '.text-search-tab ';

exports.init = () => {
    U.listen(U.queryEl(`${root}.text-search-button`), 'click', findTexts);
    U.listenOnEnter(U.queryEl(`${root}.text-search-input`), findTexts);
    exports.content = U.queryEl(root);
};

exports.refresh = () => {
};

function findTexts() {
    const selectedTextTypes = U.queryElEls(U.queryEl(root), `${root}.textSearchTypeRadio`)
        .filter(el => el.checked).map(el => el.value);
    const searchStr = U.queryEl(`${root}.text-search-input`).value;
    const caseSensitive = U.queryEl('#caseSensitiveTextSearch').checked;
    DBMS.getTexts({
        searchStr,
        textTypes: selectedTextTypes,
        caseSensitive
    }).then((texts) => {
        const text2panel = text => makePanel(
            U.makeText(`${L10n.getValue(`text-search-${text.textType}`)} (${text.result.length})`),
            makePanelContent(text, searchStr, caseSensitive)
        );
        U.addEls(U.clearEl(U.queryEl(`${root}.result-panel`)), texts.map(text2panel));
    }).catch(UI.handleError);
}

function makePanelContent(textsInfo, searchStr, caseSensitive) {
    textsInfo.result.sort(CU.charOrdAFactory(R.prop('name')));
    return U.addEls(U.makeEl('div'), textsInfo.result.map((textInfo) => {
        const head = U.addEl(U.makeEl('div'), U.makeText(textInfo.name));
        const body = U.addClass(U.makeEl('div'), textInfo.type === 'text' ? 'text-body' : 'string-body');
        const regex = new RegExp(CU.escapeRegExp(searchStr), caseSensitive ? 'g' : 'gi');
        body.innerHTML = textInfo.text.replace(regex, '<span>$&</span>');
        return U.addEls(U.addClass(U.makeEl('div'), 'text-card'), [head, body]);
    }));
}

function makePanel(title, content) {
    const panelInfo = UI.makePanelCore(title, content);
    UI.attachPanelToggler(panelInfo.a, panelInfo.contentDiv);
    panelInfo.a.click();
    return panelInfo.panel;
}
// })(window.TextSearch = {});
