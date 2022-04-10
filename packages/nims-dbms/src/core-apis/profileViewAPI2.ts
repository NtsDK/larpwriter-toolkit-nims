import * as R from 'ramda';
import { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//     function profileViewAPI(LocalDBMS, opts) {
//         const {
//             R, CU, Constants, Errors
//         } = opts;

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
    // @ts-ignore
    const structure = R.path(getStructurePath(type), database);
    return {
      structure,
      // @ts-ignore
        profiles: R.mapObjIndexed(R.pick(structure.map(R.prop('name'))), R.path(getPath(type), database))
    };
};

export function getRoleGridInfo(this: ILocalDBMS) {
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
//     }

//     callback2(profileViewAPI);
// })(api => (typeof exports === 'undefined' ? (this.profileViewAPI = api) : (module.exports = api)));
