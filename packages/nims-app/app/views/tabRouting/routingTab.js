import ReactDOM from 'react-dom';
import { getRoutingTabTemplate } from "./RoutingTabTemplate.jsx";

export default function RoutingTabTmpl(opts) {
    const state = {};
    const tmplRoot = '.tab-routing-tmpl';

    let content;
    function getContent() {
        return content;
    }

    function init(){
        content = U.makeEl('div');
        U.addEl(U.qe('.tab-container'), content);
        ReactDOM.render(getRoutingTabTemplate(), content);
        L10n.localizeStatic(content);

        // const el = U.queryEl(tmplRoot).cloneNode(true);
        // U.removeClass(el, 'tab-routing-tmpl');
        const el = U.qee(content, '.routing-tab');
        U.addEl(U.queryEl('.tab-container'), el);
        state.views = {};
        const containers = {
            root: state,
            navigation: U.qee(el, '.sub-tab-navigation'),
            content: U.qee(el, '.sub-tab-content')
        };
        const tabs = R.indexBy(R.prop('viewName'), opts.tabs.map(tab => ({
            viewName: tab.viewName,
            viewRes: UI.addView(containers, tab.btnName, tab.viewBody)
        })));

        UI.setFirstTab(containers, tabs[opts.firstTab].viewRes);
        content = el;
    };

    function refresh(){
        state.currentView.refresh();
    };

    return {
        getContent,
        init,
        refresh
    };
};
