import * as R from 'ramda';
import * as Constants from "../nimsConstants";
import { PC, CU } from "nims-dbms-core";
import { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//     function storyCharactersAPI(LocalDBMS, opts) {
//         const {
//             R, Errors, addListener, Constants, CU, PC
//         } = opts;

//event presence
export function getStoryCharacterNamesArray(this: ILocalDBMS, { storyName }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), reject, () => {
            const localCharacters = this.database.Stories[storyName].characters;
            resolve(Object.keys(localCharacters).sort(CU.charOrdA));
        });
    });
};

//story characters
export function getStoryCharacters(this: ILocalDBMS, { storyName }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), reject, () => {
            resolve(R.clone(this.database.Stories[storyName].characters));
        });
    });
};

//story characters
export function addStoryCharacter(
  this: ILocalDBMS, 
  { storyName, characterName }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        const chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)),
            PC.entityExistsCheck(characterName, R.keys(this.database.Characters))];
        PC.precondition(PC.chainCheck(chain), reject, () => {
            const story = this.database.Stories[storyName];
            PC.precondition(PC.entityIsNotUsed(characterName, R.keys(story.characters)), reject, () => {
                story.characters[characterName] = {
                    name: characterName,
                    inventory: '',
                    activity: {}
                };

                resolve();
            });
        });
    });
};

//story characters
export function switchStoryCharacters(
  this: ILocalDBMS, 
  { storyName, fromName, toName }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        let cond = PC.entityExistsCheck(storyName, R.keys(this.database.Stories));
        PC.precondition(cond, reject, () => {
            const story = this.database.Stories[storyName];
            cond = PC.switchEntityCheck(
                fromName, toName, R.keys(this.database.Characters),
                R.keys(story.characters)
            );
            PC.precondition(cond, reject, () => {
                story.characters[toName] = story.characters[fromName];
                story.characters[toName].name = toName;
                delete story.characters[fromName];

                story.events.forEach((event) => {
                    if (event.characters[fromName]) {
                        event.characters[toName] = event.characters[fromName];
                        delete event.characters[fromName];
                    }
                });

                resolve();
            });
        });
    });
};

//story characters
export function removeStoryCharacter(
  this: ILocalDBMS, 
  { storyName, characterName }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        const cond = PC.entityExistsCheck(storyName, R.keys(this.database.Stories));
        PC.precondition(cond, reject, () => {
            const story = this.database.Stories[storyName];
            PC.precondition(PC.entityExistsCheck(characterName, R.keys(story.characters)), reject, () => {
                delete story.characters[characterName];
                story.events.forEach((event) => {
                    delete event.characters[characterName];
                });
                resolve();
            });
        });
    });
};

// story characters
export function updateCharacterInventory(
  this: ILocalDBMS, 
  { storyName, characterName, inventory }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        const chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isString(inventory)];
        PC.precondition(PC.chainCheck(chain), reject, () => {
            const story = this.database.Stories[storyName];
            PC.precondition(PC.entityExistsCheck(characterName, R.keys(story.characters)), reject, () => {
                story.characters[characterName].inventory = inventory;
                resolve();
            });
        });
    });
};

//story characters
export function onChangeCharacterActivity(
  this: ILocalDBMS, 
    {
        storyName, characterName, activityType, checked
    }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        const chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isString(activityType),
            PC.elementFromEnum(activityType, Constants.characterActivityTypes), PC.isBoolean(checked)];
        PC.precondition(PC.chainCheck(chain), reject, () => {
            const story = this.database.Stories[storyName];
            PC.precondition(PC.entityExistsCheck(characterName, R.keys(story.characters)), reject, () => {
                const character = story.characters[characterName];
                if (checked) {
                    character.activity[activityType] = true;
                } else {
                    delete character.activity[activityType];
                }
                resolve();
            });
        });
    });
};

//event presence
export function addCharacterToEvent(
  this: ILocalDBMS, 
  { storyName, eventIndex, characterName }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        let chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(eventIndex)];
        PC.precondition(PC.chainCheck(chain), reject, () => {
            const story = this.database.Stories[storyName];
            chain = [PC.entityExistsCheck(characterName, R.keys(story.characters)),
                PC.isInRange(eventIndex, 0, story.events.length - 1)];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                const event = story.events[eventIndex];
                PC.precondition(PC.entityIsNotUsed(characterName, R.keys(event.characters)), reject, () => {
                    event.characters[characterName] = {
                        text: '',
                        time: ''
                    };
                    resolve();
                });
            });
        });
    });
};

// event presence
export function removeCharacterFromEvent(
  this: ILocalDBMS, 
  { storyName, eventIndex, characterName }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        let chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isNumber(eventIndex)];
        PC.precondition(PC.chainCheck(chain), reject, () => {
            const story = this.database.Stories[storyName];
            chain = [PC.entityExistsCheck(characterName, R.keys(story.characters)),
                PC.isInRange(eventIndex, 0, story.events.length - 1)];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                const event = story.events[eventIndex];
                PC.precondition(PC.entityExists(characterName, R.keys(event.characters)), reject, () => {
                    delete this.database.Stories[storyName].events[eventIndex].characters[characterName];
                    resolve();
                });
            });
        });
    });
};

function _renameCharacterInStories(this: ILocalDBMS, [{ type, fromName, toName }] = []) {
    if (type === 'player') return;
    const renameEventCharacter = (event) => {
        if (event.characters[fromName]) {
            const data = event.characters[fromName];
            event.characters[toName] = data;
            delete event.characters[fromName];
        }
    };

    R.values(this.database.Stories).filter(story => story.characters[fromName] !== undefined)
        .forEach((story) => {
            const data = story.characters[fromName];
            data.name = toName;
            story.characters[toName] = data;
            delete story.characters[fromName];
            story.events.forEach(renameEventCharacter);
        });
}

// addListener('renameProfile', _renameCharacterInStories);

function _removeCharacterFromStories(this: ILocalDBMS, [{ type, characterName }] = []) {
    if (type === 'player') return;
    const cleanEvent = (event) => {
        if (event.characters[characterName]) {
            delete event.characters[characterName];
        }
    };

    R.values(this.database.Stories).forEach((story) => {
        if (story.characters[characterName]) {
            delete story.characters[characterName];
            story.events.forEach(cleanEvent);
        }
    });
}

// addListener('removeProfile', _removeCharacterFromStories);
//     }
//     callback2(storyCharactersAPI);
// })(api => (typeof exports === 'undefined' ? (this.storyCharactersAPI = api) : (module.exports = api)));

export const listeners = {
  renameProfile: _renameCharacterInStories,
  removeProfile: _removeCharacterFromStories,
};