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


export class NavComponentV1 {
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
            // el
        });
        // this.addNavEl(U.addClass(U.makeEl('div'), 'nav-separator'));
    }

    // nav toolbar
    addNavEl(el) {
        this.navEls.push({
            type: 'element',
            el
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
                U.addEl(this.navigation, navEl.el);
            } else if(navEl.type === 'button') {
                const { clazz, btnName, callback, opts } = navEl;
                const button = U.makeEl('button');
                U.addClass(button, clazz);
                if (opts.tooltip) {
                    const delegate = () => {
                        $(button).attr('data-original-title', L10n.getValue(`header-${btnName}`));
                    };
                    L10n.onL10nChange(delegate);
                    $(button).tooltip({
                        title: L10n.getValue(`header-${btnName}`),
                        placement: 'bottom'
                    });
                }
                U.addClass(button, 'action-button');
                if (opts.className) {
                    U.addClass(button, opts.className);
                }
                if (callback) {
                    U.listen(button, 'click', callback);
                }
                U.addEl(this.navigation, button);
            } else if(navEl.type === 'separator') {
                U.addEl(this.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));
            } else if(navEl.type === 'link') {
                const { btnName, viewName, view, opts } = navEl;
                view.init();
                const button = this.makeNavButton(btnName, opts);
                U.addEl(this.navigation, button);

                const callback = (show, btnName) => this.showView(show, viewName);

                const onClickDelegate = this.makeNavButtonOnClick(btnName, callback);

                button.addEventListener('click', onClickDelegate);

                navEl.callback = callback;
                this.viewIndex[viewName] = {
                    viewName,
                    btnName,
                    button,
                    view,
                };
            } else {
                console.error('Unknown nav element type:', navEl.type);
            }
        });

        const { button, view, btnName } = this.viewIndex[this.firstViewName]
        U.addClass(button, 'active');
        this.content.appendChild(view.content || view.getContent());
        this.currentView = view;

        // if(testNavEl) {
        //     ReactDOM.render(getNavExperiment({
        //         navEls: this.navEls,
        //         L10n,
        //         firstRouteName: btnName
        //     }), testNavEl);
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

    // nav toolbar
    makeNavButtonOnClick(btnName, onNavClick) {
        return (evt) => {
            const button = evt.target;
            //Tests.run();
            if (this.toggleMode) {
                // untoggle other active buttons
                const els = U.queryEls(`.-toggle-class-${btnName}`);
                for (let i = 0; i < els.length; i++) {
                    if (!button.isEqualNode(els[i]) && U.hasClass(els[i], 'active')) {
                        els[i].click();
                    }
                }
            }

            const isActive = U.hasClass(button, 'active');
            const elems = this.navigation.getElementsByClassName(navButtonClass);
            for (let i = 0; i < elems.length; i++) {
                U.removeClass(elems[i], 'active');
            }
            const activateView = !this.toggleMode || (this.toggleMode && !isActive);
            U.setClassIf(button, 'active', activateView);
            onNavClick(activateView, btnName);
        };
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

    // nav toolbar
    makeNavButton(btnName, opts){
        const button = U.makeEl('button');
        function delegate() {
            $(button).attr('data-original-title', L10n.getValue(`header-${btnName}`));
        }
        if (opts.tooltip) {
            L10n.onL10nChange(delegate);
            $(button).tooltip({
                title: L10n.getValue(`header-${btnName}`),
                placement: 'bottom'
            });
        } else {
            U.addEl(button, U.makeText(L10n.getValue(`header-${btnName}`)));
            U.setAttr(button, 'l10n-id', `header-${btnName}`);
        }
        U.addClass(button, navButtonClass);
        U.addClass(button, `-test-${btnName}`);
        U.addClass(button, `-toggle-class-${btnName}`);
        if (opts.clazz) {
            U.addClass(button, opts.clazz);
        }
        return button;
    }
}
