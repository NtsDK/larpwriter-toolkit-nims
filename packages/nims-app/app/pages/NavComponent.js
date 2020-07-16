import { UI, U, L10n } from 'nims-app-core';

export class NavComponent {
    tabs = {};
    root = {
        views: {}
    };
    currentView;

    constructor(navigation, content) {
        this.navigation = navigation;
        this.content = content;
    }

    addNavSeparator() {
        return U.addEl(this.navigation, U.addClass(U.makeEl('div'), 'nav-separator'));
    }

    addNavEl(el) {
        return U.addEl(this.navigation, el);
    }

    innerSetFirstTab(opts) {
        U.addClass(opts.button, 'active');
        this.content.appendChild(opts.view.content || opts.view.getContent());
        this.root.currentView = opts.view;
    };

    setFirstTab(firstTab) {
        return this.innerSetFirstTab(this.tabs[firstTab].viewRes);
    }

    refreshCurrentView() {
        this.root.currentView.refresh();
    }

    addView(btnName, viewName, view, opts){
        this.tabs[viewName] = {
            viewName,
            viewRes: UI.addView({
                root: this.root,
                navigation: this.navigation,
                content: this.content,
            }, btnName, view, opts)
        };
    };
}
