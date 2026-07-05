import * as R from "ramda";
import { CU } from "nims-dbms-core";
import { Database } from "../domain";

export function _getProfileBinding(type: "character" | "player", name: string, db: Database): [string, string] {
  let arr: [string, string];
  if (type === "character") {
    const bindings = db.ProfileBindings;
    arr = [name, bindings[name] || ""];
  } else {
    const bindings = R.invertObj(db.ProfileBindings);
    arr = [bindings[name] || "", name];
  }
  return arr;
}

const rel2RelKey = R.pipe(R.props(["starter", "ender"]), R.sort(CU.charOrdA), JSON.stringify);
export const _rel2RelKey = rel2RelKey;
const arr2RelKey = R.pipe(R.sort(CU.charOrdA), JSON.stringify);
export const _arr2RelKey = arr2RelKey;

export function _getKnownCharacters(database: Database, characterName: string) {
  const stories = database.Stories;
  // const knownCharacters: Record<string, Record<string, boolean>> = {};
  const knownCharacters: Record<string, any> = {};
  R.values(stories).forEach((story) => {
    // @ts-ignore
    const filter = R.compose(R.not, R.isNil, R.prop(characterName), R.prop("characters"));
    story.events.filter(filter).forEach((event) => {
      R.keys(event.characters).forEach((charName) => {
        knownCharacters[charName] = knownCharacters[charName] || {};
        knownCharacters[charName][story.name] = true;
      });
    });
  });
  delete knownCharacters[characterName];
  return knownCharacters;
}

export const _isStoryEmpty = (database: Database, storyName: string) => database.Stories[storyName].events.length === 0;

export const _isStoryFinished = (database: Database, storyName: string) =>
  database.Stories[storyName].events.every(
    (event) => !R.isEmpty(event.characters) && R.values(event.characters).every((adaptation) => adaptation.ready)
  );
