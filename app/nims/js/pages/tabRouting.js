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
 Utils, BriefingPreview, BriefingExport
 */

'use strict';

function ProfileTmpl(exports, opts) {
    
    const state = {};
    const tmplRoot = '.tab-routing-tmpl';
    
    exports.init = () => {
        const el = queryEl(tmplRoot).cloneNode(true);
        removeClass(el, 'tab-routing-tmpl');
        addEl(queryEl('.tab-container'), el);
        state.views = {};
        const containers = {
            root: state,
            navigation: qee(el, '.sub-tab-navigation'),
            content: qee(el, '.sub-tab-content')
        };
        const tabs = R.indexBy(R.prop('viewName'), opts.tabs.map(tab => {
            return {
                viewName: tab.viewName,
                viewRes: Utils.addView(containers, tab.btnName, window[tab.viewName]) 
            }
        }));
        
        Utils.setFirstTab(containers, tabs[opts.firstTab].viewRes);
        exports.content = el;
    };

    exports.refresh = () => {
        state.currentView.refresh();
    };
}

ProfileTmpl(this.Briefings = {}, {
    firstTab: 'BriefingPreview',
    tabs: [{
        btnName: 'briefing-preview',
        viewName: 'BriefingPreview'
    },{
        btnName: 'briefing-export',
        viewName: 'BriefingExport'
    }]
});
ProfileTmpl(this.Characters = {}, {
    firstTab: 'CharacterEditor',
    tabs: [{
        btnName: 'filling-profile',
        viewName: 'CharacterEditor'
    }]
});
ProfileTmpl(this.Players = {}, {
    firstTab: 'PlayerEditor',
    tabs: [{
        btnName: 'filling-profile',
        viewName: 'PlayerEditor'
    }]
});