import * as R from 'ramda';
import * as Constants from "../nimsConstants";
import { PC, CU } from "nims-dbms-core";
import * as dbmsUtils from "./dbmsUtils";
import { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//     function storyAdaptationsAPI(LocalDBMS, opts) {
//         const {
//             R, dbmsUtils, Constants, CU, PC
//         } = opts;

// let _isStoryEmpty, _isStoryFinished;

//events
export function getFilteredStoryNames(this: ILocalDBMS, { showOnlyUnfinishedStories }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(PC.isBoolean(showOnlyUnfinishedStories), reject, () => {
            let storyArray = Object.keys(this.database.Stories).sort(CU.charOrdA);
            const that = this;
            // @ts-ignore
            storyArray = storyArray.map(elem => ({
              storyName: elem,
              isFinished: dbmsUtils._isStoryFinished(that.database, elem),
              isEmpty: dbmsUtils._isStoryEmpty(that.database, elem)
            }));
            
            if (showOnlyUnfinishedStories) {
              // @ts-ignore
                storyArray = storyArray.filter(elem => !elem.isFinished || elem.isEmpty);
            }
            resolve(storyArray);
        });
    });
};

// _isStoryEmpty = (database, storyName) => database.Stories[storyName].events.length === 0;

// dbmsUtils._isStoryEmpty = _isStoryEmpty;

// _isStoryFinished = (database, storyName) => database.Stories[storyName].events.every(event => !R.isEmpty(event.characters) && R.values(event.characters).every(adaptation => adaptation.ready));

// dbmsUtils._isStoryFinished = _isStoryFinished;

//adaptations
export function getStory(this: ILocalDBMS, { storyName }: any = {}) {
    return new Promise((resolve, reject) => {
        const chain = [PC.isString(storyName), PC.entityExists(storyName, R.keys(this.database.Stories))];
        PC.precondition(PC.chainCheck(chain), reject, () => {
            resolve(R.clone(this.database.Stories[storyName]));
        });
    });
};

const getValueCheck = function (type, value) {
    switch (type) {
    case 'text':
    case 'time':
        return PC.isString(value);
    case 'ready':
        return PC.isBoolean(value);
    default:
        throw new Error(`Unexpected type ${type}`);
    }
};

// preview, events
export function setEventAdaptationProperty(
  this: ILocalDBMS, 
    {
        storyName, eventIndex, characterName, type, value
    }: any = {}
): Promise<void> {
    return new Promise((resolve, reject) => {
        let chain = [PC.isString(storyName), PC.entityExists(storyName, R.keys(this.database.Stories)),
            PC.isNumber(eventIndex), PC.isString(type), PC.elementFromEnum(type, Constants.adaptationProperties),
            PC.isString(characterName)];
        PC.precondition(PC.chainCheck(chain), reject, () => {
            const story = this.database.Stories[storyName];
            // @ts-ignore
            chain = [PC.entityExists(characterName, R.keys(story.characters)),
              // @ts-ignore
                PC.isInRange(eventIndex, 0, story.events.length - 1), getValueCheck(type, value)];
            PC.precondition(PC.chainCheck(chain), reject, () => {
                const event = story.events[eventIndex];
                PC.precondition(PC.entityExists(characterName, R.keys(event.characters)), reject, () => {
                    event.characters[characterName][type] = value;
                    resolve();
                });
            });
        });
    });
};
//     }
//     callback2(storyAdaptationsAPI);
// })(api => (typeof exports === 'undefined' ? (this.storyAdaptationsAPI = api) : (module.exports = api)));
