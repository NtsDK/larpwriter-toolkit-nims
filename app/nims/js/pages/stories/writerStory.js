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
 Utils, DBMS
 */

'use strict';

((exports) => {
    const state = {};

    exports.init = () => {
        listen(getEl('writerStoryArea'), 'change', updateWriterStory);
        exports.content = getEl('writerStoryDiv2');
    };

    exports.refresh = () => {
        const storyArea = getEl('writerStoryArea');
        const storyName = Stories.getCurrentStoryName();

        if (storyName) {
            DBMS.getWriterStory(storyName, (err, story) => {
                if (err) { Utils.handleError(err); return; }
                storyArea.value = story;
            });
        } else {
            storyArea.value = '';
        }
    };

    function updateWriterStory() {
        const storyArea = getEl('writerStoryArea');
        DBMS.setWriterStory(Stories.getCurrentStoryName(), storyArea.value, Utils.processError());
    }
})(this.WriterStory = {});