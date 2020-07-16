import ReactDOM from 'react-dom';
import { getTextSearchTemplate } from "./TextSearchTemplate.jsx";
import { UI, U, L10n } from 'nims-app-core';

const root = '.text-search-tab ';

export class TextSearch {

    content;

    constructor({L10n, DBMS}) {
        this.findTexts = this.findTexts.bind(this);
        this.L10nObj = L10n;
        this.DBMSObj = DBMS;
    }

    getContent(){
        return this.content;
    }

    init(){
        this.content = U.makeEl('div');
        U.addEl(U.qe('.tab-container'), this.content);
        ReactDOM.render(getTextSearchTemplate(), this.content);
        this.L10nObj.localizeStatic(this.content);

        U.listen(U.queryEl(`${root}.text-search-button`), 'click', this.findTexts);
        U.listenOnEnter(U.queryEl(`${root}.text-search-input`), this.findTexts);
        this.content = U.queryEl(root);
    };

    refresh() {
    };

    findTexts() {
        const selectedTextTypes = U.queryElEls(U.queryEl(root), `${root}.textSearchTypeRadio`)
            .filter(el => el.checked).map(el => el.value);
        const searchStr = U.queryEl(`${root}.text-search-input`).value;
        const caseSensitive = U.queryEl('#caseSensitiveTextSearch').checked;
        this.DBMSObj.getTexts({
            searchStr,
            textTypes: selectedTextTypes,
            caseSensitive
        }).then((texts) => {
            const text2panel = text => makePanel(
                U.makeText(`${this.L10nObj.getValue(`text-search-${text.textType}`)} (${text.result.length})`),
                makePanelContent(text, searchStr, caseSensitive)
            );
            U.addEls(U.clearEl(U.queryEl(`${root}.result-panel`)), texts.map(text2panel));
        }).catch(UI.handleError);
    }

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
