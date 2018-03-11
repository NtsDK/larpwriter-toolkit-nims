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
    const root = '.profile-binding2-tab ';

    exports.init = () => {
        exports.content = queryEl(root);
    };

    exports.refresh = () => {
        PermissionInformer.getEntityNamesArray('character', false, (err, characterNames) => {
            if (err) { Utils.handleError(err); return; }
            PermissionInformer.getEntityNamesArray('player', false, (err2, playerNames) => {
                if (err2) { Utils.handleError(err2); return; }
                DBMS.getProfileBindings((err3, profileBindings) => {
                    if (err3) { Utils.handleError(err3); return; }
                    rebuildInterface(characterNames, playerNames, profileBindings);
                });
            });
        });
    };
    
    function rebuildInterface(characterNames, playerNames, profileBindings){
        const bindedCharacterList = R.keys(profileBindings);
        const bindedPlayerList = R.values(profileBindings);
        const filter = list => R.compose(R.not, R.contains(R.__, list), R.prop('value'));
        
        addEls(clearEl(queryEl(`${root} .entity-list.character-list`)), 
            characterNames.filter(filter(bindedCharacterList)).map(profile2el('character')));
        
        addEls(clearEl(queryEl(`${root} .entity-list.player-list`)), 
            playerNames.filter(filter(bindedPlayerList)).map(profile2el('player')));
                
        const bindings = R.toPairs(profileBindings).map(binding => ({
            name: R.join('/', binding),
            value: binding
        }));
        bindings.sort(CommonUtils.charOrdAFactory(R.prop('name')));
        
        addEls(clearEl(queryEl(`${root} .entity-list.binding-list`)), bindings.map(binding2el));
    }
    
    const profile2el = R.curry((type, name) => {
        const el = wrapEl('div', qte(`${root} .profile-item-tmpl` ));
        el.profileName = name.value;
        addEl(qee(el, '.primary-name'), makeText(name.value));
        setAttr(el, 'profile-name', name.value);
        setAttr(el, 'profile-type', type);
        listen(el, 'dragstart', onDragStart);
        listen(el, 'drop', onDrop);
        listen(el, 'dragover', allowDrop);
        listen(el, 'dragenter', handleDragEnter);
        listen(el, 'dragleave', handleDragLeave);
        return el;
    })
    
    var onDragStart = function(event){
        console.log('onDragStart ' + this.profileName);
        event.dataTransfer.setData('data', JSON.stringify({ 
            name: getAttr(this, 'profile-name'), 
            type: getAttr(this, 'profile-type'), 
        }));
        event.dataTransfer.effectAllowed = 'move';
    };
    var onDrop = function(event){
        removeClass(this, 'over');
        console.log('onDrop ' + this.profileName + event.dataTransfer.getData('data'));
        if (event.stopPropagation) {
            event.stopPropagation(); // stops the browser from redirecting.
        }
        const thatData = JSON.parse(event.dataTransfer.getData('data'));
        if(thatData.type === getAttr(this, 'profile-type')){
            return;
        }
        
        createBinding([thatData, { 
            name: getAttr(this, 'profile-name'), 
            type: getAttr(this, 'profile-type'), 
        }]);
    };
    var allowDrop = function(event){
        console.log('allowDrop ' + this.profileName);
        event.preventDefault();
    };
    
    function handleDragEnter(event) {
        addClass(this, 'over');
    }

    function handleDragLeave(event) {
        removeClass(this, 'over');
    }
    
    function binding2el(binding){
        const el = wrapEl('div', qte(`${root} .binding-item-tmpl` ));
        addEl(qee(el, '.primary-name'), makeText(binding.name));
        setAttr(el, 'primary-name', binding.name);
        listen(qee(el, '.unlink'), 'click', () => removeBinding(binding.value));
        return el;
    }

    function createBinding(pair) {
        const characterName = pair[0].type === 'character' ? pair[0].name : pair[1].name;
        const playerName = pair[0].type === 'player' ? pair[0].name : pair[1].name;
        DBMS.createBinding(characterName, playerName, Utils.processError(exports.refresh));
    }

    function removeBinding(binding) {
        DBMS.removeBinding(binding[0], binding[1], Utils.processError(exports.refresh));
    }
})(this.ProfileBinding2 = {});