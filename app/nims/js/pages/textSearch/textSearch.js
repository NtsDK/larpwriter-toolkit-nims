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

'use strict';

((exports) => {
    const root = '.text-search-tab ';

    exports.init = () => {
        listen(queryEl(`${root}.text-search-button`), 'click', findTexts);
        listenOnEnter(queryEl(`${root}.text-search-input`), findTexts);
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
    };

    function findTexts() {
        const selectedTextTypes = queryElEls(queryEl(root), `${root}.textSearchTypeRadio`)
            .filter(el => el.checked).map(el => el.value);
        const searchStr = queryEl(`${root}.text-search-input`).value;
        const caseSensitive = getEl('caseSensitiveTextSearch').checked;
        DBMS.getTextsNew({
            searchStr, 
            textTypes: selectedTextTypes, 
            caseSensitive
        }).then((texts) => {
            const text2panel = text =>
                makePanel(
                    makeText(`${getL10n(`text-search-${text.textType}`)} (${text.result.length})`),
                    makePanelContent(text, searchStr, caseSensitive)
                );
            addEls(clearEl(queryEl(`${root}.result-panel`)), texts.map(text2panel));
        }).catch(Utils.handleError);
    }

    function makePanelContent(textsInfo, searchStr, caseSensitive) {
        textsInfo.result.sort(CommonUtils.charOrdAFactory(R.prop('name')));
        return addEls(makeEl('div'), textsInfo.result.map((textInfo) => {
            const head = addEl(makeEl('div'), makeText(textInfo.name));
            const body = addClass(makeEl('div'), textInfo.type === 'text' ? 'text-body' : 'string-body');
            const regex = new RegExp(CommonUtils.escapeRegExp(searchStr), caseSensitive ? 'g' : 'gi');
            body.innerHTML = textInfo.text.replace(regex, '<span>$&</span>');
            return addEls(addClass(makeEl('div'), 'text-card'), [head, body]);
        }));
    }

    function makePanel(title, content) {
        const panelInfo = UI.makePanelCore(title, content);
        UI.attachPanelToggler(panelInfo.a, panelInfo.contentDiv);
        panelInfo.a.click();
        return panelInfo.panel;
    }
})(this.TextSearch = {});
