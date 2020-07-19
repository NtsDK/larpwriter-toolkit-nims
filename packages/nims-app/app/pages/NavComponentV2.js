import { UI, U, L10n } from 'nims-app-core';
import { getNavExperiment } from "./NavExperiment.jsx";
import ReactDOM from 'react-dom';

const navButtonClass = 'navigation-button';

/** Comment for addView
 *  opts
    tooltip - add tooltip to button, used for iconic buttons
    id - set button id
    mainPage - enable view as first page - deprecated. Use Utils.setFirstView instead
    toggle - toggle content, associated with button
*/


export class NavComponentV2 {
    // nav toolbar
    navigation = null;
    toggleMode;
    // nav body
    viewIndex = {};
    currentView = null;
    content = null;
    navEls = [];

    constructor(navigation, content, toggleMode = false) {
        this.navigation = navigation;
        this.content = content;
        this.toggleMode = toggleMode;
    }

    // nav toolbar
    addNavSeparator() {
        this.navEls.push({
            type: 'separator',
        });
    }

    // nav toolbar
    addNavEl(el) {
        this.navEls.push({
            type: 'element',
            el
        });
    }

    addCustomNavElComponent(elComponent) {
        this.navEls.push({
            type: 'customEl',
            elComponent
        });
    }

    addButton(clazz, btnName, callback, opts) {
        this.navEls.push({
            type: 'button',
            clazz,
            btnName,
            callback,
            opts
        });
    }

    // both
    setFirstView(viewName) {
        this.firstViewName = viewName;
    }

    render(testNavEl) {
        this.navEls.forEach(navEl => {
            if(navEl.type === 'element') {
            } else if(navEl.type === 'customEl') {
            } else if(navEl.type === 'button') {
            } else if(navEl.type === 'separator') {
            } else if(navEl.type === 'link') {
                const { btnName, viewName, view, opts } = navEl;
                view.init();
                const callback = (show, btnName) => this.showView(show, viewName);
                navEl.callback = callback;
                this.viewIndex[viewName] = {
                    viewName,
                    btnName,
                    // button,
                    view,
                };
            } else {
                console.error('Unknown nav element type:', navEl.type);
            }
        });

        const { button, view, btnName } = this.viewIndex[this.firstViewName]
        // U.addClass(button, 'active');
        // this.content.appendChild(view.content || view.getContent());
        // this.currentView = view;

        return getNavExperiment({
            navEls: this.navEls,
            L10n,
            firstRouteName: btnName
        });

        // if(testNavEl) {
            // ReactDOM.render(getNavExperiment({
            //     navEls: this.navEls,
            //     L10n,
            //     firstRouteName: btnName
            // }), this.navigation);
        // }
    }

    // nav body
    refreshCurrentView() {
        if (this.hasCurrentView()) {
            this.currentView.refresh();
        }
    }

    // both
    addView(btnName, viewName, view, opts = {}){
        this.navEls.push({
            type: 'link',
            btnName,
            viewName,
            view,
            opts
        });
    };

    // nav body
    hasCurrentView() {
        return this.currentView != undefined;
    }

    // nav body
    сurrentViewNameIs(viewName) {
        return this.hasCurrentView() && this.currentView === this.viewIndex[viewName].view;
    }

    // nav body
    refreshAllNews() {
        R.values(this.viewIndex).forEach(obj => obj.view.refresh());
    }

    // nav body
    showView(show, viewName) {
        const obj = R.values(this.viewIndex).find(obj => obj.viewName === viewName);
        if(!obj) {
            console.warn('Obj for viewName not found: ', viewName);
            return;
        }
        const { view } = obj;

        if (show) {
            U.passEls(this.content, U.queryEl('#warehouse'));
            this.content.appendChild(view.content || view.getContent());
            U.removeClass(this.content, 'hidden');
            this.currentView = view;
            view.refresh();
        } else {
            U.passEls(this.content, U.queryEl('#warehouse'));
            this.currentView = null;
            U.addClass(this.content, 'hidden');
        }
    }
}
