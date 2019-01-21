module.exports = function RoutingTabTmpl(opts) {
    const exports = {};
    const state = {};
    const tmplRoot = '.tab-routing-tmpl';

    exports.init = () => {
        const el = U.queryEl(tmplRoot).cloneNode(true);
        U.removeClass(el, 'tab-routing-tmpl');
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

        Utils.setFirstTab(containers, tabs[opts.firstTab].viewRes);
        exports.content = el;
    };

    exports.refresh = () => {
        state.currentView.refresh();
    };
    exports.test = () => {
        state.currentView.test();
    };
    return exports;
}