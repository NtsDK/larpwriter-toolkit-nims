import ReactDOM from 'react-dom';
import { getRoutingTabTemplate } from "./RoutingTabTemplate.jsx";
import { UI, U, L10n } from 'nims-app-core';

export class RoutingTab {
    state = {};
    content;

    constructor(opts) {
        this.opts = opts;
    }
    // const tmplRoot = '.tab-routing-tmpl';

    getContent() {
        return this.content;
    }

    init(){
        this.content = U.makeEl('div');
        U.addEl(U.qe('.tab-container'), this.content);
        ReactDOM.render(getRoutingTabTemplate(), this.content);
        L10n.localizeStatic(this.content);

        // const el = U.queryEl(tmplRoot).cloneNode(true);
        // U.removeClass(el, 'tab-routing-tmpl');
        const el = U.qee(this.content, '.routing-tab');
        U.addEl(U.queryEl('.tab-container'), el);
        this.state.views = {};
        const containers = {
            root: this.state,
            navigation: U.qee(el, '.sub-tab-navigation'),
            content: U.qee(el, '.sub-tab-content')
        };
        const tabs = R.indexBy(R.prop('viewName'), this.opts.tabs.map(tab => ({
            viewName: tab.viewName,
            viewRes: UI.addView(containers, tab.btnName, tab.viewBody)
        })));

        UI.setFirstTab(containers, tabs[this.opts.firstTab].viewRes);
        this.content = el;
    };

    refresh(){
        this.state.currentView.refresh();
    };
};
