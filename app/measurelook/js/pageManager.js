/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

'use strict';

((exports) => {
    const state = {};
    state.views = {};

    const btnOpts = {
        tooltip: true,
        className: 'mainNavButton'
    };

    exports.onMasterPageLoad = () => {
        initPage();
        const LocalDBMS = makeLocalDBMS(true);
        if (MODE === 'Standalone') {
            window.DBMS = new LocalDBMS();
            DBMS.setDatabase(BaseExample.data, (err) => {
                if (err) { Utils.handleError(err); return; }
                consistencyCheck(onDatabaseLoad);
            });
        } else if (MODE === 'NIMS_Server') {
            const RemoteDBMS = makeRemoteDBMS(LocalDBMS);
            window.DBMS = new RemoteDBMS();
            consistencyCheck(onDatabaseLoad);
        }
    };

    function onDatabaseLoad() {
        //        initTheme();

        stateInit();

        Utils.addView(state.containers, 'performance', Performance, { mainPage: true });
        //        Utils.addView(state.containers, 'instruction', Instruction);

        addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));

        Utils.addView(state.containers, 'about', About);

        addEl(state.navigation, makeButton('testButton', 'test', runTests, btnOpts));

        const button = makeButton('dataLoadButton', 'open-database', null, btnOpts);
        button.addEventListener('change', FileUtils.readSingleFile, false);

        const input = makeEl('input');
        input.type = 'file';
        addClass(input, 'hidden');
        setAttr(input, 'tabindex', -1);
        button.appendChild(input);
        button.addEventListener('click', (e) => {
            input.value = '';
            input.click();
        });
        addEl(state.navigation, button);

        //                addEl(state.navigation, makeButton("themeButton", "theme", () => nextTheme(), btnOpts));
        addEl(state.navigation, makeButton('dataSaveButton', 'save-database', FileUtils.saveFile, btnOpts));
        //if (MODE === 'Standalone') {
        //  addEl(state.navigation, makeButton('newBaseButton', 'create-database', FileUtils.makeNewBase, btnOpts));
        //}
        //addEl(state.navigation, makeButton("mainHelpButton", "docs", FileUtils.openHelp, btnOpts));

        //        addEl(state.navigation, makeL10nButton());

        //        Utils.addView(state.containers, 'logViewer', LogViewer2, { clazz: 'logViewerButton', tooltip: true });
        //        addEl(state.navigation, makeButton('testButton', 'test', runTests, btnOpts));

        //addEl(state.navigation, makeButton("refreshButton", "refresh", () => state.currentView.refresh(), btnOpts));

        FileUtils.init((err) => {
            if (err) { Utils.handleError(err); return; }
            consistencyCheck(state.currentView.refresh);
        });

        state.currentView.refresh();
        addBeforeUnloadListener();
    }

    function initPage() {
        L10n.localizeStatic();
        L10n.onL10nChange(() => state.currentView.refresh());
        UI.initSelectorFilters();
        UI.initPanelTogglers();
        function updateDialogs() {
            vex.dialog.buttons.YES.text = getL10n('common-ok');
            vex.dialog.buttons.NO.text = getL10n('common-cancel');
        }
        updateDialogs();
        L10n.onL10nChange(updateDialogs);
    }

    //    var curTheme = Constants.themeList[1];
    //
    //    var initTheme = function() {
    //        if(DBMS.setTheme){
    //            DBMS.getTheme(function(err, theme){
    //                if(err) {console.log(err);}
    //                if(theme !== ''){
    //                    curTheme = theme;
    //                }
    //                addClass(queryEl('body'), curTheme);
    //            });
    //        } else {
    //            addClass(queryEl('body'), curTheme);
    //        }
    //    };
    //
    //    var nextTheme = function() {
    //        removeClass(queryEl('body'), curTheme);
    //        curTheme = Constants.themeList[(R.indexOf(curTheme, Constants.themeList)+1)%Constants.themeList.length];
    //        addClass(queryEl('body'), curTheme);
    //        if(DBMS.setTheme){
    //            DBMS.setTheme(curTheme, function(err){
    //                if(err) {console.log(err); return;}
    //            });
    //        }
    //    };

    function consistencyCheck(callback) {
        DBMS.getConsistencyCheckResult((err, consistencyErrors) => {
            if (err) { Utils.handleError(err); return; }
            consistencyErrors.forEach(CommonUtils.consoleLog);
            if (consistencyErrors.length > 0) {
                Utils.alert(getL10n('overview-consistency-problem-detected'));
            } else {
                console.log('Consistency check didn\'t find errors');
            }
            callback();
        });
    }

    function stateInit() {
        state.navigation = getEl('navigation');
        state.containers = {
            root: state,
            navigation: state.navigation,
            content: getEl('contentArea')
        };
    }

    function runTests() {
        DBMS.getConsistencyCheckResult((err, consistencyErrors) => {
            if (err) { Utils.handleError(err); return; }
            consistencyErrors.forEach(CommonUtils.consoleLog);
            if (consistencyErrors.length > 0) {
                Utils.alert(getL10n('overview-consistency-problem-detected'));
            } else {
                Utils.alert(getL10n('overview-consistency-is-ok'));
                console.log('Consistency check didn\'t find errors');
            }
        });
    }

    function makeButton(clazz, name, callback, opts) {
        const button = makeEl('button');
        addClass(button, clazz);
        function delegate() {
            $(button).attr('data-original-title', L10n.getValue(`header-${name}`));
        }
        if (opts.tooltip) {
            L10n.onL10nChange(delegate);
            $(button).tooltip({
                title: L10n.getValue(`header-${name}`),
                placement: 'bottom'
            });
        }
        addClass(button, 'action-button');
        if (opts.className) {
            addClass(button, opts.className);
        }
        if (callback) {
            listen(button, 'click', callback);
        }
        return button;
    }

    function makeL10nButton() {
        const l10nBtn = makeButton('toggleL10nButton', 'l10n', L10n.toggleL10n, btnOpts);
        function setIcon() {
            l10nBtn.style.backgroundImage = strFormat('url("./images/{0}.svg")', [getL10n('header-dictionary-icon')]);
        }
        L10n.onL10nChange(setIcon);
        setIcon();
        return l10nBtn;
    }

    function addBeforeUnloadListener() {
        window.onbeforeunload = (evt) => {
            const message = getL10n('utils-close-page-warning');
            if (typeof evt === 'undefined') {
                evt = window.event;
            }
            if (evt) {
                evt.returnValue = message;
            }
            return message;
        };
    }
})(this.PageManager = {});
