import { UI, U, L10n } from 'nims-app-core';

const navButtonClass = 'navigation-button';

/** Comment for addView
 *  opts
    tooltip - add tooltip to button, used for iconic buttons
    id - set button id
    mainPage - enable view as first page - deprecated. Use Utils.setFirstTab instead
    toggle - toggle content, associated with button
*/


export class NavComponent {
    viewIndex = {};
    currentView = null;
    navigation = null;
    content = null;
    toggleMode;

    constructor(navigation, content, toggleMode = false) {
        this.navigation = navigation;
        this.content = content;
        this.toggleMode = toggleMode;
    }

    addNavSeparator() {
        return U.addEl(this.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));
    }

    addNavEl(el) {
        return U.addEl(this.navigation, el);
    }

    innerSetFirstTab({ button, view }) {
        U.addClass(button, 'active');
        this.content.appendChild(view.content || view.getContent());
        this.currentView = view;
    };

    setFirstTab(firstTab) {
        return this.innerSetFirstTab(this.viewIndex[firstTab]);
    }

    refreshCurrentView() {
        if (this.hasCurrentView()) {
            this.currentView.refresh();
        }
    }

    addView(btnName, viewName, view, opts = {}){
        view.init();
        const button = this.makeNavButton(btnName, opts);

        this.navigation.appendChild(button);

        const onClickDelegate = this.makeNavButtonOnClick(btnName, view);

        button.addEventListener('click', onClickDelegate);

        // deprecated. Use Utils.setFirstTab instead
        if (opts.mainPage) {
            this.innerSetFirstTab({ button, view });
        }

        this.viewIndex[viewName] = {
            viewName,
            btnName,
            button,
            view
        };
    };

    hasCurrentView() {
        return this.currentView != undefined;
    }

    // name used only for EventPresence
    сurrentViewNameIs(name) {
        return this.hasCurrentView() && this.currentView === this.viewIndex[name].view;
    }

    refreshAllNews() {
        R.values(this.viewIndex).forEach(obj => obj.view.refresh());
    }

    makeNavButtonOnClick(btnName, view) {
        return (evt) => {
            //Tests.run();
            const elems = this.navigation.getElementsByClassName(navButtonClass);
            if (this.toggleMode) {
                const els = U.queryEls(`.-toggle-class-${btnName}`);
                for (let i = 0; i < els.length; i++) {
                    if (!evt.target.isEqualNode(els[i]) && U.hasClass(els[i], 'active')) {
                        els[i].click();
                    }
                }
            }

            const isActive = U.hasClass(evt.target, 'active');
            for (let i = 0; i < elems.length; i++) {
                U.removeClass(elems[i], 'active');
            }
            if (!this.toggleMode || (this.toggleMode && !isActive)) {
                U.addClass(evt.target, 'active');
                U.passEls(this.content, U.queryEl('#warehouse'));
                this.content.appendChild(view.content || view.getContent());
                U.removeClass(this.content, 'hidden');
                this.currentView = view;
                view.refresh();
            } else {
                U.removeClass(evt.target, 'active');
                U.passEls(this.content, U.queryEl('#warehouse'));
                this.currentView = null;
                U.addClass(this.content, 'hidden');
            }
        };
    }

    makeNavButton(name, opts){
        const button = U.makeEl('button');
        function delegate() {
            $(button).attr('data-original-title', L10n.getValue(`header-${name}`));
        }
        if (opts.tooltip) {
            L10n.onL10nChange(delegate);
            $(button).tooltip({
                title: L10n.getValue(`header-${name}`),
                placement: 'bottom'
            });
        } else {
            U.addEl(button, U.makeText(L10n.getValue(`header-${name}`)));
            U.setAttr(button, 'l10n-id', `header-${name}`);
        }
        U.addClass(button, navButtonClass);
        U.addClass(button, `-test-${name}`);
        U.addClass(button, `-toggle-class-${name}`);
        if (opts.clazz) {
            U.addClass(button, opts.clazz);
        }
        return button;
    }
}
