/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

((callback2) => {
    function profileViewAPI(LocalDBMS, opts) {
        const {
            R, CU, Constants, Errors
        } = opts;

        function getPath(type) {
            if (type === 'character') return ['Characters'];
            if (type === 'player') return ['Players'];
            return null;
        }
        function getStructurePath(type) {
            if (type === 'character') return ['CharacterProfileStructure'];
            if (type === 'player') return ['PlayerProfileStructure'];
            return null;
        }

        const getProfileInfo = (type, database) => {
            // var structure = R.path(getStructurePath(type), database).filter(el => el.showInRoleGrid === true);
            const structure = R.path(getStructurePath(type), database);
            return {
                structure,
                profiles: R.mapObjIndexed(R.pick(structure.map(R.prop('name'))), R.path(getPath(type), database))
            };
        };

        LocalDBMS.prototype.getRoleGridInfo = function () {
            const characters = getProfileInfo('character', this.database);
            const players = getProfileInfo('player', this.database);

            const bindings = this.database.ProfileBindings;
            const profileData = R.keys(characters.profiles).map((characterName) => {
                const playerName = bindings[characterName];
                return {
                    character: characters.profiles[characterName],
                    player: playerName === undefined ? undefined : players.profiles[playerName],
                    characterName,
                    playerName,
                };
            });

            return Promise.resolve({
                profileData,
                characterProfileStructure: characters.structure,
                playerProfileStructure: players.structure
            });
        };
    }

    callback2(profileViewAPI);
})(api => (typeof exports === 'undefined' ? (this.profileViewAPI = api) : (module.exports = api)));
