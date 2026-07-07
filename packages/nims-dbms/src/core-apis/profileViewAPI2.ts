import * as R from "ramda";
import { Database, ILocalDBMS, Profiles, ProfileStructure } from "../domain";
import { ProfileTypes } from "../nimsConstants";

// ((callback2) => {
//     function profileViewAPI(LocalDBMS, opts) {
//         const {
//             R, CU, Constants, Errors
//         } = opts;

function getProfiles(database: Database, type: ProfileTypes): Profiles {
  if (type === "character") {
    return database.Characters;
  }
  if (type === "player") {
    return database.Players;
  }
  throw new Error("unexpected type " + type);
}
function getProfileStructure(database: Database, type: ProfileTypes): ProfileStructure {
  if (type === "character") {
    return database.CharacterProfileStructure;
  }
  if (type === "player") {
    return database.PlayerProfileStructure;
  }
  throw new Error("unexpected type " + type);
}


const getProfileInfo = (type: ProfileTypes, database: Database) => {
  // var structure = R.path(getStructurePath(type), database).filter(el => el.showInRoleGrid === true);
  const structure = getProfileStructure(database, type);
  const profiles = getProfiles(database, type);
  return {
    structure,
    profiles: R.mapObjIndexed(R.pick(structure.map(R.prop("name"))), profiles),
  };
};

export function getRoleGridInfo(this: ILocalDBMS) {
  const characters = getProfileInfo("character", this.database);
  const players = getProfileInfo("player", this.database);

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
    playerProfileStructure: players.structure,
  });
}
//     }

//     callback2(profileViewAPI);
// })(api => (typeof exports === 'undefined' ? (this.profileViewAPI = api) : (module.exports = api)));
