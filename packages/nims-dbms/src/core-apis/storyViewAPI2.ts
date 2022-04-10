import * as R from 'ramda';
import { PC, CU } from "nims-dbms-core";
import { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//     function storyViewAPI(LocalDBMS, opts) {
//         const {
//             R, dateFormat, CU, PC
//         } = opts;

const characterCheck = (characterName, database) => PC.chainCheck([PC.isString(characterName),
    PC.entityExists(characterName, R.keys(database.Characters))]);

// preview
export function getAllInventoryLists(this: ILocalDBMS, { characterName }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(characterCheck(characterName, this.database), reject, () => {
            const array = R.values(this.database.Stories)
                .filter(story => story.characters[characterName] !== undefined
                    && story.characters[characterName].inventory !== '')
                .map(story => ({
                    storyName: story.name,
                    inventory: story.characters[characterName].inventory
                }));
            resolve(array);
        });
    });
};

// preview
export function getCharacterEventGroupsByStory(this: ILocalDBMS, { characterName }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(characterCheck(characterName, this.database), reject, () => {
            const eventGroups = [];

            let events;

            const that = this;
            Object.keys(this.database.Stories).filter(storyName => that.database.Stories[storyName].characters[characterName]).forEach((storyName) => {
                events = [];

                const tmpEvents = R.clone(that.database.Stories[storyName].events);
                tmpEvents.map((elem, i) => {
                    elem.index = i;
                    elem.storyName = storyName;
                    elem.isTimeEmpty = elem.time === '';
                    elem.time = elem.isTimeEmpty ? that.database.Meta.date : elem.time;
                    return elem;
                }).filter(event => event.characters[characterName]).forEach((event) => {
                    events.push(event);
                });

                eventGroups.push({
                  // @ts-ignore
                  storyName,
                  // @ts-ignore
                    events
                });
            });
            eventGroups.sort(CU.charOrdAFactory(R.prop('storyName')));
            resolve(eventGroups);
        });
    });
};

// preview
export function getCharacterEventsByTime(this: ILocalDBMS, { characterName }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(characterCheck(characterName, this.database), reject, () => {
            let allEvents = [];

            const that = this;
            Object.keys(this.database.Stories).filter(storyName => that.database.Stories[storyName].characters[characterName]).forEach((storyName) => {
                const events = R.clone(that.database.Stories[storyName].events);
                allEvents = allEvents.concat(events.map((elem, i) => {
                    elem.index = i;
                    elem.storyName = storyName;
                    elem.isTimeEmpty = elem.time === '';
                    elem.time = elem.isTimeEmpty ? that.database.Meta.date : elem.time;
                    return elem;
                }).filter(event => event.characters[characterName]));
            });

            allEvents.sort(CU.eventsByTime);
            resolve(allEvents);
        });
    });
};

// timeline
export function getEventsTimeInfo(this: ILocalDBMS, callback) {
    const result = R.flatten(R.values(R.clone(this.database.Stories)).map(story => story.events.map((event, index) => R.merge(R.pick(['name', 'time'], event), {
        characters: R.keys(event.characters),
        storyName: story.name,
        index
    }))));

    return Promise.resolve(result);
};

// character filter
export function getCharactersSummary(this: ILocalDBMS, ) {
    const characters = R.keys(this.database.Characters);
    const charactersInfo = {};
    characters.forEach((character) => {
        charactersInfo[character] = {
            active: 0,
            follower: 0,
            defensive: 0,
            passive: 0,
            totalAdaptations: 0,
            finishedAdaptations: 0,
            totalStories: 0
        };
    });

    R.values(this.database.Stories).forEach((story) => {
        R.values(story.characters).forEach((storyCharacter) => {
            const characterInfo = charactersInfo[storyCharacter.name];
            characterInfo.totalStories++;
            R.toPairs(storyCharacter.activity).forEach((activity) => {
                if (activity[1] === true) {
                    characterInfo[activity[0]]++;
                }
            });
        });
        story.events.forEach((event) => {
            R.toPairs(event.characters).forEach((eventCharacter) => {
                const characterInfo = charactersInfo[eventCharacter[0]];
                characterInfo.totalAdaptations++;
                if (eventCharacter[1].ready) {
                    characterInfo.finishedAdaptations++;
                }
            });
        });
    });
    R.values(charactersInfo).forEach((characterInfo) => {
      //@ts-ignore
      characterInfo.completeness = Math.round((characterInfo.finishedAdaptations * 100)
      //@ts-ignore
            / (characterInfo.totalAdaptations !== 0 ? characterInfo.totalAdaptations : 1));
    });
    return Promise.resolve(charactersInfo);
};

// character profile
export function getCharacterReport(this: ILocalDBMS, { characterName }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(characterCheck(characterName, this.database), reject, () => {
            const characterReport = R.values(this.database.Stories)
                .filter(story => story.characters[characterName] !== undefined)
                .map((story) => {
                    const charEvents = story.events.filter(event => event.characters[characterName] !== undefined);

                    const finishedAdaptations = charEvents
                        .filter(event => event.characters[characterName].ready === true).length;

                    let meets = {};
                    charEvents.forEach((event) => {
                        const chars = R.keys(event.characters);
                        // @ts-ignore
                        meets = R.merge(meets, R.zipObj(chars, R.repeat(true, chars.length)));
                    });

                    delete meets[characterName];
                    meets = R.keys(meets).sort(CU.charOrdA);


                    return {
                        storyName: story.name,
                        inventory: story.characters[characterName].inventory,
                        activity: story.characters[characterName].activity,
                        meets,
                        totalAdaptations: charEvents.length,
                        finishedAdaptations
                    };
                });
            characterReport.sort(CU.charOrdAFactory(R.prop('storyName')));

            resolve(characterReport);
        });
    });
};
//     }
//     callback2(storyViewAPI);
// })(api => (typeof exports === 'undefined' ? (this.storyViewAPI = api) : (module.exports = api)));
