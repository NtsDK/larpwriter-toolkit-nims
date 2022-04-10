import * as R from 'ramda';
import { PC, CU } from "nims-dbms-core";
import { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//     function storyBaseAPI(LocalDBMS, opts) {
//         const {
//             R, Errors, CU, PC
//         } = opts;

// stories, timeline
export function getStoryNamesArray(this: ILocalDBMS) {
    return Promise.resolve(Object.keys(this.database.Stories).sort(CU.charOrdA));
};
// social network
export function getAllStories(this: ILocalDBMS) {
    return Promise.resolve(R.clone(this.database.Stories));
};

//stories
export function getWriterStory(this: ILocalDBMS, { storyName }: any = {}) {
    return new Promise((resolve, reject) => {
        PC.precondition(PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), reject, () => {
            resolve(this.database.Stories[storyName].story);
        });
    });
};
//stories
export function setWriterStory(this: ILocalDBMS, { storyName, value }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isString(value)];
        PC.precondition(PC.chainCheck(chain), reject, () => {
            this.database.Stories[storyName].story = value;
            resolve();
        });
    });
};

// stories
export function createStory(this: ILocalDBMS, { storyName }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        PC.precondition(PC.createEntityCheck2(storyName, R.keys(this.database.Stories), 'entity-lifeless-name', 'entity-of-story'), reject, () => {
            this.database.Stories[storyName] = {
                name: storyName,
                story: '',
                characters: {},
                events: []
            };
            this.ee.emit('createStory', arguments);
            resolve();
        });
    });
};
// stories
export function renameStory(this: ILocalDBMS, { fromName, toName }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(this.database.Stories)), reject, () => {
            const data = this.database.Stories[fromName];
            data.name = toName;
            this.database.Stories[toName] = data;
            delete this.database.Stories[fromName];
            this.ee.emit('renameStory', arguments);
            resolve();
        });
    });
};

// stories
export function removeStory(this: ILocalDBMS, { storyName }: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        PC.precondition(PC.removeEntityCheck(storyName, R.keys(this.database.Stories)), reject, () => {
            delete this.database.Stories[storyName];
            this.ee.emit('removeStory', arguments);
            resolve();
        });
    });
};
//     }
//     callback2(storyBaseAPI);
// })(api => (typeof exports === 'undefined' ? (this.storyBaseAPI = api) : (module.exports = api)));
