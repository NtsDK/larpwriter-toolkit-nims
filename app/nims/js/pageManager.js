/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

/*global
Utils, Overview, Profiles, Stories, Adaptations, Briefings, Timeline, SocialNetwork, FileUtils
 */

'use strict';

((exports) => {
    const state = {};
    state.views = {};

    const btnOpts = {
        tooltip: true,
        className: 'mainNavButton'
    };

    const initPage = () => {
        L10n.init();
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
    };

    const protoExpander = (arr) => {
        function protoCarrier() {}
        arr.forEach(name => (protoCarrier.prototype[name] = (() => 1)));
        return protoCarrier;
    };
    const playerArr = [
        'getPlayersOptions',
        'getWelcomeText',
        'getPlayerProfileInfo',
        'createCharacterByPlayer',
        'updateProfileField',
        'getRoleGridInfo'];

    exports.refresh = () => state.currentView.refresh();

    exports.onPlayerPageLoad = () => {
        initPage();
        const RemoteDBMS = makeRemoteDBMS(protoExpander(playerArr));
        window.DBMS = new RemoteDBMS();
        stateInit();
        Utils.addView(state.containers, 'player', Player, { mainPage: true });
        addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));
        Utils.addView(state.containers, 'about', About);
        //        addEl(state.navigation, makeL10nButton());
        addEl(state.navigation, makeButton('logoutButton', 'logout', postLogout, btnOpts));
        state.currentView.refresh();
    };

    exports.onIndexPageLoad = () => {
        initPage();
        const RemoteDBMS = makeRemoteDBMS(protoExpander(['getPlayersOptions', 'getRoleGridInfo']));
        window.DBMS = new RemoteDBMS();
        stateInit();
        DBMS.getPlayersOptions((err, playersOptions) => {
            if (err) { Utils.handleError(err); return; }
            addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));
            Utils.addView(state.containers, 'enter', Enter, { mainPage: true });
            if (playersOptions.allowPlayerCreation) {
                Utils.addView(state.containers, 'register', Register);
            }
            Utils.addView(state.containers, 'about', About);
            //            addEl(state.navigation, makeL10nButton());
            state.currentView.refresh();
        });
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

    function consistencyCheck(callback) {
        DBMS.getConsistencyCheckResult((err, checkResult) => {
            if (err) { Utils.handleError(err); return; }
            checkResult.errors.forEach(CommonUtils.consoleErr);
            if (checkResult.errors.length > 0) {
                Utils.alert(getL10n('overview-consistency-problem-detected'));
            } else {
                console.log('Consistency check didn\'t find errors');
            }
            callback(checkResult);
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

    function onDatabaseLoad() {
        PermissionInformer.refresh((err) => {
            if (err) { Utils.handleError(err); return; }

            PermissionInformer.isAdmin((err2, isAdmin) => {
                if (err2) { Utils.handleError(err2); return; }

                let button;
                stateInit();
                
                const tabs = {};
                const firstTab = 'Characters';
                
                const addView = (containers, btnName, viewName, opts) => {
                    tabs[viewName] = {
                        viewName: viewName,
                        viewRes: Utils.addView(containers, btnName, window[viewName], opts)
                    }
                };
                
                addView(state.containers, 'overview', 'Overview');
                addView(state.containers, 'profiles', 'Profiles');
                addView(state.containers, 'characters', 'Characters');
                addView(state.containers, 'players', 'Players');
                addView(state.containers, 'stories', 'Stories');
                addView(state.containers, 'adaptations', 'Adaptations');
                addView(state.containers, 'briefings', 'Briefings');
                addView(state.containers, 'relations', 'Relations');

                addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));

                addView(state.containers, 'timeline', 'Timeline', { clazz: 'timelineButton icon-button', tooltip: true });
                addView(state.containers, 'social-network', 'SocialNetwork', { clazz: 'socialNetworkButton icon-button', tooltip: true });
                addView(state.containers, 'profile-filter', 'ProfileFilter', { clazz: 'filterButton icon-button', tooltip: true });
                addView(state.containers, 'groups', 'Groups', { clazz: 'groupsButton icon-button', tooltip: true });
                addView(state.containers, 'textSearch', 'TextSearch', { clazz: 'textSearchButton icon-button', tooltip: true });
                addView(state.containers, "roleGrid", 'RoleGrid', { clazz: 'roleGridButton icon-button', tooltip: true });

                addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));
                
                if (MODE === 'NIMS_Server') {
                    addView(state.containers, 'admins', 'AccessManager', { clazz: 'accessManagerButton icon-button', tooltip: true });
                }
                addView(state.containers, 'logViewer', 'LogViewer2', { clazz: 'logViewerButton icon-button', tooltip: true });
                
                addEl(state.navigation, addClass(makeEl('div'), 'nav-separator'));

                if (isAdmin) {
                    button = makeButton('dataLoadButton icon-button', 'open-database', null, btnOpts);
                    button.addEventListener('change', FileUtils.readSingleFile, false);

                    const input = makeEl('input');
                    input.type = 'file';
                    addClass(input, 'hidden');
                    setAttr(input, 'tabindex', -1);
                    button.appendChild(input);
                    button.addEventListener('click', (e) => {
                        input.value = '';
                        input.click();
                        //                    e.preventDefault(); // prevent navigation to "#"
                    });
                    addEl(state.navigation, button);
                }

                addEl(state.navigation, makeButton('dataSaveButton icon-button', 'save-database', FileUtils.saveFile, btnOpts));
                if (MODE === 'Standalone') {
                    addEl(state.navigation, makeButton('newBaseButton icon-button', 'create-database', FileUtils.makeNewBase, btnOpts));
                }
                addEl(state.navigation, makeButton('mainHelpButton icon-button', 'docs', FileUtils.openHelp, btnOpts));

//                addEl(state.navigation, makeL10nButton());

                addEl(state.navigation, makeButton('testButton icon-button', 'test', runTests, btnOpts));
                addEl(state.navigation, makeButton('checkConsistencyButton icon-button', 'checkConsistency', checkConsistency, btnOpts));
                addEl(state.navigation, makeButton('clickAllTabsButton icon-button', 'clickAllTabs', clickThroughtHeaders, btnOpts));
                if (MODE === 'NIMS_Server') {
                    addEl(state.navigation, makeButton('logoutButton icon-button', 'logout', postLogout, btnOpts));
                }
                addEl(state.navigation, makeButton('refreshButton icon-button', 'refresh', () => state.currentView.refresh(), btnOpts));

                FileUtils.init((err3) => {
                    if (err3) { Utils.handleError(err3); return; }
                    consistencyCheck(state.currentView.refresh);
                });
                
                Utils.setFirstTab(state.containers, tabs[firstTab].viewRes);

                state.currentView.refresh();
                if (MODE === 'Standalone') {
                    addBeforeUnloadListener();
                }
                //                                runTests();
            });
        });
    }

    function clickThroughtHeaders() {
        let tabs = queryEls('#navigation .navigation-button');

        let index = 0;
        let subTabsNum = 0;
        function runClicker() {
            if (index <= tabs.length - 1) {
                tabs[index].click();
                if (subTabsNum === 0) {
                    const subTabs = queryEls('#contentArea .navigation-button');
                    tabs = R.insertAll(index + 1, subTabs, tabs);
                    subTabsNum = subTabs.length;
                } else {
                    subTabsNum--;
                }
                index++;
                setTimeout(runClicker, 500);
            }
        }
        runClicker();
    }

    function makeL10nButton() {
        const l10nBtn = makeButton('toggleL10nButton', 'l10n', L10n.toggleL10n, btnOpts);
        const setIcon = () => {
            l10nBtn.style.backgroundImage = strFormat('url("./images/{0}.svg")', [getL10n('header-dictionary-icon')]);
        };
        L10n.onL10nChange(setIcon);
        setIcon();
        return l10nBtn;
    }

    function runTests() {
//        window.RunTests();
//        
        consistencyCheck((checkRes) => {
            showModuleSchema(checkRes);
        });
    }
        
        
    function showModuleSchema(checkRes) {
//        queryEl(`.image-place`).innerHTML = dbmsModulesSvg;
//        const svg = queryEl(`.image-place svg`);
////        setAttr
//        
//        $(queryEl(`.consistency-check-result-dialog`)).modal('show');
//        const texts = qees(svg, 'text');
////        const rect = queryEl(texts[0].parentNode, 'rect');
//        setTimeout(() => {
//            texts.forEach(text => {
//                console.log(text.innerHTML);
//                const el = text.parentNode.previousElementSibling;
//                setAttr(el, 'fill', 'rgb(255,0,0)'); 
//            })
//            console.log(texts);
//        }, 1000)
//        
        
//        $(queryEl(`.consistency-check-result-dialog`)).modal('show');
//        
//     // Create the input graph
//        var g = new dagreD3.graphlib.Graph()
//          .setGraph({})
//          .setDefaultEdgeLabel(function() { return {}; });
//        
////        const addNode = (name) => g.setNode(name, { label: name });
//        const addNode = (name, i) => g.setNode(name, { label: 'someLabel_' + i });
//        
//        // Here we"re setting nodeclass, which is used by our custom drawNodes function
//        // below.
//        checkRes.nodes.forEach(addNode);
//        
//        console.log((
//                checkRes.nodes.map(el => JSON.stringify({id: el, width: 30, height: 30})).join(',')));
//        
//        console.log(checkRes.edges.map(pair => JSON.stringify({ id: pair[0] + pair[1], sources: [ pair[0] ], targets: [ pair[1] ] })).join(','));
////        { id: "e1", sources: [ "n1" ], targets: [ "n2" ] },
////        { id: "e2", sources: [ "n1" ], targets: [ "n3" ] } ,
////        { id: "e3", sources: [ "n2" ], targets: [ "n4" ] },
////        { id: "e4", sources: [ "n3" ], targets: [ "n4" ] } 
//        g.nodes().forEach(function(v) {
//          var node = g.node(v);
//          // Round the corners of the nodes
//          node.rx = node.ry = 5;
//        });
//        
//        const addEdge = (pair) => {
//            g.setEdge(pair[0], pair[1]);
//        }
//        checkRes.edges.forEach(addEdge);
//
//        g.graph().rankdir = "BT";
////        g.graph().ranker = "longest-path";
////        network-simplex, tight-tree or longest-path
//        
//        setTimeout(() => {
//            
//            // Create the renderer
//            var render = new dagreD3.render();
//            
//            // Set up an SVG group so that we can translate the final graph.
//            var svg = d3.select(".image-place svg"),
//            svgGroup = svg.append("g");
//            
//            // Run the renderer. This is what draws the final graph.
//            render(d3.select(".image-place svg g"), g);
//            
//            // Center the graph
//            var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
//            svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
//            svg.attr("height", g.graph().height + 40);
//        }, 200);
    }

    function checkConsistency() {
        consistencyCheck((err, checkRes) => {
            if (err) { Utils.handleError(err); return; }
            if (checkRes === undefined || checkRes.length === 0) {
                Utils.alert(getL10n('overview-consistency-is-ok'));
            } else {
                Utils.alert(getL10n('overview-consistency-problem-detected'));
            }
        });
    }

    function postLogout() {
        document.querySelector('#logoutForm button').click();
    }

    function makeButton(clazz, name, callback, opts) {
        const button = makeEl('button');
        addClass(button, clazz);
        if (opts.tooltip) {
            const delegate = () => {
                $(button).attr('data-original-title', L10n.getValue(`header-${name}`));
            };
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
    
    const dbmsModulesSvg = `
    <?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill-opacity="1" color-rendering="auto" color-interpolation="auto" text-rendering="auto" stroke="black" stroke-linecap="square" width="860" stroke-miterlimit="10" shape-rendering="auto" stroke-opacity="1" fill="black" stroke-dasharray="none" font-weight="normal" stroke-width="1" height="570" font-family="'Dialog'" font-style="normal" stroke-linejoin="miter" font-size="12px" stroke-dashoffset="0" image-rendering="auto">
  <!--Generated by ySVG 2.5-->
  <defs id="genericDefs"/>
  <g>
    <defs id="defs1">
      <clipPath clipPathUnits="userSpaceOnUse" id="clipPath1">
        <path d="M0 0 L860 0 L860 570 L0 570 L0 0 Z"/>
      </clipPath>
      <clipPath clipPathUnits="userSpaceOnUse" id="clipPath2">
        <path d="M-15 -15 L845 -15 L845 555 L-15 555 L-15 -15 Z"/>
      </clipPath>
    </defs>
    <g fill="white" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="translate(15,15)" stroke="white">
      <rect x="-15" width="860" height="570" y="-15" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="0" y="495" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="62.1611" xml:space="preserve" y="522.2139" clip-path="url(#clipPath2)" stroke="none">Meta</text>
      <rect x="0" y="495" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="75.5" y="0" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="83.3066" xml:space="preserve" y="27.2139" clip-path="url(#clipPath2)" stroke="none">CharacterProfileStructure</text>
      <rect x="75.5" y="0" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="196" y="495" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="261.4893" xml:space="preserve" y="522.2139" clip-path="url(#clipPath2)" stroke="none">Log</text>
      <rect x="196" y="495" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="524.125" y="120" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="570.2812" xml:space="preserve" y="147.2139" clip-path="url(#clipPath2)" stroke="none">Characters</text>
      <rect x="524.125" y="120" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="218.75" y="255" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="274.2432" xml:space="preserve" y="282.2139" clip-path="url(#clipPath2)" stroke="none">Players</text>
      <rect x="218.75" y="255" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="678.5" y="405" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="713.9775" xml:space="preserve" y="432.2139" clip-path="url(#clipPath2)" stroke="none">ProfileBindings</text>
      <rect x="678.5" y="405" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="399.75" y="255" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="456.5762" xml:space="preserve" y="282.2139" clip-path="url(#clipPath2)" stroke="none">Stories</text>
      <rect x="399.75" y="255" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="37.75" y="255" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="93.5742" xml:space="preserve" y="282.2139" clip-path="url(#clipPath2)" stroke="none">Groups</text>
      <rect x="37.75" y="255" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="0" y="405" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="25.8008" xml:space="preserve" y="432.2139" clip-path="url(#clipPath2)" stroke="none">InvestigationBoard</text>
      <rect x="0" y="405" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="610.75" y="255" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="661.2363" xml:space="preserve" y="282.2139" clip-path="url(#clipPath2)" stroke="none">Relations</text>
      <rect x="610.75" y="255" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="380.875" y="405" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="411.3457" xml:space="preserve" y="432.2139" clip-path="url(#clipPath2)" stroke="none">ManagementInfo</text>
      <rect x="380.875" y="405" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="392" y="495" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="447.1562" xml:space="preserve" y="522.2139" clip-path="url(#clipPath2)" stroke="none">Version</text>
      <rect x="392" y="495" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="588" y="495" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="641.8203" xml:space="preserve" y="522.2139" clip-path="url(#clipPath2)" stroke="none">Settings</text>
      <rect x="588" y="495" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
    </g>
    <g fill="rgb(151,194,252)" text-rendering="geometricPrecision" shape-rendering="geometricPrecision" transform="matrix(1,0,0,1,15,15)" stroke="rgb(151,194,252)">
      <rect x="181" y="120" clip-path="url(#clipPath2)" width="151" rx="4" ry="4" height="45" stroke="none"/>
    </g>
    <g text-rendering="geometricPrecision" stroke-miterlimit="1.45" shape-rendering="geometricPrecision" font-family="sans-serif" transform="matrix(1,0,0,1,15,15)" stroke-linecap="butt">
      <text x="198.1436" xml:space="preserve" y="147.2139" clip-path="url(#clipPath2)" stroke="none">PlayerProfileStructure</text>
      <rect x="181" y="120" clip-path="url(#clipPath2)" fill="none" width="151" rx="4" ry="4" height="45" stroke="rgb(43,124,233)"/>
      <path fill="none" d="M599.625 119.9707 L599.625 105 L188.75 105 L188.75 53" clip-path="url(#clipPath2)"/>
      <path d="M188.75 45 L183.75 57 L188.75 54 L193.75 57 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M716.25 404.9561 L716.25 360 L332 360 L332 308" clip-path="url(#clipPath2)"/>
      <path d="M332 300 L327 312 L332 309 L337 312 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M791.75 404.9561 L791.75 225 L656.25 225 L656.25 173" clip-path="url(#clipPath2)"/>
      <path d="M656.25 165 L651.25 177 L656.25 174 L661.25 177 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M475.25 254.9707 L475.25 240 L543 240 L543 173" clip-path="url(#clipPath2)"/>
      <path d="M543 165 L538 177 L543 174 L548 177 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M75.5 254.9707 L75.5 240 L113.25 240 L113.25 53" clip-path="url(#clipPath2)"/>
      <path d="M113.25 45 L108.25 57 L113.25 54 L118.25 57 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M75.5 404.9744 L75.5 308" clip-path="url(#clipPath2)"/>
      <path d="M75.5 300 L70.5 312 L75.5 309 L80.5 312 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M686.25 254.9707 L686.25 240 L618.5 240 L618.5 173" clip-path="url(#clipPath2)"/>
      <path d="M618.5 165 L613.5 177 L618.5 174 L623.5 177 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M513 404.9707 L513 390 L580.75 390 L580.75 173" clip-path="url(#clipPath2)"/>
      <path d="M580.75 165 L575.75 177 L580.75 174 L585.75 177 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M399.75 404.9707 L399.75 390 L151 390 L151 308" clip-path="url(#clipPath2)"/>
      <path d="M151 300 L146 312 L151 309 L156 312 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M475.25 404.9744 L475.25 308" clip-path="url(#clipPath2)"/>
      <path d="M475.25 300 L470.25 312 L475.25 309 L480.25 312 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M437.5 404.9707 L437.5 375 L256.5 375 L256.5 308" clip-path="url(#clipPath2)"/>
      <path d="M256.5 300 L251.5 312 L256.5 309 L261.5 312 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M294.25 254.9561 L294.25 173" clip-path="url(#clipPath2)"/>
      <path d="M294.25 165 L289.25 177 L294.25 174 L299.25 177 Z" clip-path="url(#clipPath2)" stroke="none"/>
      <path fill="none" d="M151 254.9707 L151 240 L218.75 240 L218.75 173" clip-path="url(#clipPath2)"/>
      <path d="M218.75 165 L213.75 177 L218.75 174 L223.75 177 Z" clip-path="url(#clipPath2)" stroke="none"/>
    </g>
  </g>
</svg>
    `;
    
})(this.PageManager = {});
