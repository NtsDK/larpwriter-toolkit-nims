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
 Utils, DBMS, StoryEvents, StoryCharacters, EventPresence
 */

'use strict';

((exports) => {
    const state = {};

    exports.init = function () {
        state.left = { views: {} };
        state.right = { views: {} };
        let containers = {
            root: state.left,
            navigation: queryEl('.stories-navigation-container .left-side'),
            content: queryEl('.stories-content-container .left-side')
        };
        Utils.addView(containers, 'master-story', MasterStory, { mainPage: true, toggle: true });
        Utils.addView(containers, 'story-events', StoryEvents, { toggle: true });
        Utils.addView(containers, 'story-characters', StoryCharacters, { toggle: true });
        Utils.addView(containers, 'event-presence', EventPresence, { toggle: true });
        containers = {
            root: state.right,
            navigation: queryEl('.stories-navigation-container .right-side'),
            content: queryEl('.stories-content-container .right-side')
        };
        Utils.addView(containers, 'master-story', MasterStory, { toggle: true });
        Utils.addView(containers, 'story-events', StoryEvents, { mainPage: true, toggle: true });
        Utils.addView(containers, 'story-characters', StoryCharacters, { toggle: true });
        Utils.addView(containers, 'event-presence', EventPresence, { toggle: true });

        listen(queryEl('#storiesDiv .create-entity-button'), 'click', createStory);
        listen(queryEl('#storiesDiv .rename-entity-button'), 'click', renameStory);
        listen(queryEl('#storiesDiv .remove-entity-button'), 'click', removeStory);

        $('#storySelector').select2().on('change', onStorySelectorChangeDelegate);

        exports.content = getEl('storiesDiv');
    };

    exports.chainRefresh = function () {
        if ((state.left.currentView && state.left.currentView.name === 'EventPresence') ||
            (state.right.currentView && state.right.currentView.name === 'EventPresence')) {
            EventPresence.refresh();
        }
    };

    exports.refresh = function () {
        const selectors = ['#storiesDiv .rename-entity-select', '#storiesDiv .remove-entity-select'];

        const storySelector = clearEl(getEl('storySelector'));
        selectors.forEach(R.compose(clearEl, queryEl));

        PermissionInformer.getEntityNamesArray('story', false, (err, allStoryNames) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.getEntityNamesArray('story', true, (err, userStoryNames) => {
                if (err) { Utils.handleError(err); return; }
                if (userStoryNames.length > 0) {
                    var data = getSelect2Data(userStoryNames);
                    selectors.forEach((selector) => {
                        $(selector).select2(data);
                    });
                }

                if (allStoryNames.length > 0) {
                    const storyName = getSelectedStoryName(allStoryNames);

                    var data = getSelect2Data(allStoryNames);
                    $('#storySelector').select2(data).val(storyName).trigger('change');

                    onStorySelectorChange(storyName);
                } else {
                    onStorySelectorChange();
                }

                if (state.left.currentView)state.left.currentView.refresh();
                if (state.right.currentView)state.right.currentView.refresh();
            });
        });
    };

    var getSelectedStoryName = function (storyNames) {
        const settings = DBMS.getSettings();
        if (!settings.Stories) {
            settings.Stories = {
                storyName: storyNames[0].value
            };
        }
        let storyName = settings.Stories.storyName;
        if (storyNames.map(nameInfo => nameInfo.value).indexOf(storyName) === -1) {
            settings.Stories.storyName = storyNames[0].value;
            storyName = storyNames[0].value;
        }
        return storyName;
    };

    var createStory = function () {
        const input = queryEl('#storiesDiv .create-entity-input');
        const storyName = input.value.trim();

        DBMS.createStory(storyName, (err) => {
            if (err) { Utils.handleError(err); return; }
            updateSettings(storyName);
            PermissionInformer.refresh((err) => {
                if (err) { Utils.handleError(err); return; }
                input.value = '';
                exports.refresh();
            });
        });
    };

    var renameStory = function () {
        const toInput = queryEl('#storiesDiv .rename-entity-input');
        const fromName = queryEl('#storiesDiv .rename-entity-select').value.trim();
        const toName = toInput.value.trim();

        DBMS.renameStory(fromName, toName, (err) => {
            if (err) { Utils.handleError(err); return; }
            updateSettings(toName);
            PermissionInformer.refresh((err) => {
                if (err) { Utils.handleError(err); return; }
                toInput.value = '';
                exports.refresh();
            });
        });
    };

    var removeStory = function () {
        const name = queryEl('#storiesDiv .remove-entity-select').value.trim();

        Utils.confirm(strFormat(getL10n('stories-are-you-sure-about-story-removing'), [name]), () => {
            DBMS.removeStory(name, (err) => {
                if (err) { Utils.handleError(err); return; }
                PermissionInformer.refresh((err) => {
                    if (err) { Utils.handleError(err); return; }
                    exports.refresh();
                });
            });
        });
    };

    var onStorySelectorChangeDelegate = function (event) {
        const storyName = event.target.value;
        onStorySelectorChange(storyName);
    };

    var onStorySelectorChange = function (storyName) {
        state.CurrentStoryName = storyName;

        if (storyName) {
            updateSettings(storyName);
            PermissionInformer.isEntityEditable('story', storyName, (err, isStoryEditable) => {
                if (err) { Utils.handleError(err); return; }
                if (state.left.currentView)state.left.currentView.refresh();
                if (state.right.currentView)state.right.currentView.refresh();
                Utils.enable(exports.content, 'isStoryEditable', isStoryEditable);
            });
        } else { // when there are no stories at all
            updateSettings(null);
            if (state.left.currentView)state.left.currentView.refresh();
            if (state.right.currentView)state.right.currentView.refresh();
        }
    };

    exports.getCurrentStoryName = () => state.CurrentStoryName;

    var updateSettings = function (storyName) {
        const settings = DBMS.getSettings();
        settings.Stories.storyName = storyName;
    };
})(this.Stories = {});
