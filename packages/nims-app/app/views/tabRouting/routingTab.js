import ReactDOM from 'react-dom';
import { getRoutingTabTemplate } from "./RoutingTabTemplate.jsx";
import { UI, U, L10n } from 'nims-app-core';
import { NavComponentV1 } from "../../pages/NavComponentV1";

export class RoutingTab {
    navComponent;
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

        this.navComponent = new NavComponentV1(
            U.qee(el, '.sub-tab-navigation'),
            U.qee(el, '.sub-tab-content')
        );
        this.opts.tabs.forEach(tab => this.navComponent.addView(tab.btnName, tab.viewName, tab.viewBody));
        this.navComponent.setFirstView(this.opts.firstTab);
        this.navComponent.render();
        this.content = el;
    };

    refresh(){
        this.navComponent.refreshCurrentView();
    };
};
