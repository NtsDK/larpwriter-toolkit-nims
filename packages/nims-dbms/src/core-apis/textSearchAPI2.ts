import * as R from 'ramda';
import * as Constants from "../nimsConstants";
import { PC } from "nims-dbms-core";
import { ILocalDBMS } from './ILocalDBMS';

// ((callback2) => {
//     function textSearchAPI(LocalDBMS, opts) {
//         const {
//             R, Constants, Errors, CU, PC
//         } = opts;

const searchers = {};

//        LocalDBMS.prototype.getTextsTest = function(searchStr, textTypes, caseSensitive, callback){
//            var errPrint = function(err){
//                console.log(err);
//            };
//            var okPrint = function(){
//                console.log('OK');
//            };
//            this.getTexts(123, null, null, errPrint, okPrint);
//            this.getTexts('23', true, null, errPrint, okPrint);
//            this.getTexts('23', ['window'], null, errPrint, okPrint);
//            this.getTexts('23', [], '123', errPrint, okPrint);
//            callback('test result');
//        };

//  [
//      {
//          name: 'searchStr',
//          check: [{
//              type: 'isString'
//          }]
//      },
//      {
//          name: 'textTypes',
//          check: [{
//              type: 'isArray',
//              subtype: 'string'
//          }, {
//              type: 'elementsFromEnum',
//              arr: (searchers) => R.keys(searchers)
//          }]
//      },
//      {
//          name: 'caseSensitive',
//          check: [{
//              type: 'isBoolean'
//          }]
//      },
//  ]
// eslint-disable-next-line func-names
export function getTexts(this: ILocalDBMS, { searchStr, textTypes, caseSensitive }: any = {}) {
    return new Promise((resolve, reject) => {
        const textTypesPrecondition = PC.elementsFromEnum(R.__, R.keys(searchers));
        const check = PC.chainCheck([PC.isString(searchStr), PC.isArray(textTypes),
            textTypesPrecondition(textTypes), PC.isBoolean(caseSensitive)]);
        PC.precondition(check, reject, () => {
            let test;
            if (caseSensitive) {
                test = text => (text.indexOf(searchStr) !== -1);
            } else {
                searchStr = searchStr.toLowerCase();
                test = text => (text.toLowerCase().indexOf(searchStr) !== -1);
            }
            resolve(textTypes.map(textType => ({
                textType,
                result: searchers[textType](textType, test, this.database)
            })));
        });
    });
};

const format = (name, type, text) => ({
    name,
    type,
    text
});

// @ts-ignore
searchers.writerStory = (textType, test, database) => R.values(database.Stories)
    .filter(story => test(story.story))
    .map(story => format(story.name, 'text', story.story));

// @ts-ignore
searchers.eventOrigins = (textType, test, database) => R.flatten(R.values(database.Stories)
    .map(story => story.events
        .filter(event => test(event.text))
        .map(event => format(`${story.name}/${event.name}`, 'text', event.text))));
// @ts-ignore
searchers.eventAdaptations = (textType, test, database) => R.flatten(R.values(database.Stories)
    .map(story => story.events
        .map(event => R.keys(event.characters)
            .filter(char => test(event.characters[char].text))
            .map(char => format(
              // @ts-ignore
                `${story.name}/${event.name}/${char}`, 'text',
                event.characters[char].text
            )))));

const profileSearch = R.curry((profiles, structure, textType, test, database) => {
    const items = database[structure].filter(item => item.type === 'string' || item.type === 'text');
    return R.flatten(R.values(database[profiles])
        .map(profile => items.filter(item => test(profile[item.name]))
            .map(item => format(`${profile.name}/${item.name}`, item.type, profile[item.name]))));
});
// @ts-ignore
searchers.characterProfiles = profileSearch('Characters', 'CharacterProfileStructure');
// @ts-ignore
searchers.playerProfiles = profileSearch('Players', 'PlayerProfileStructure');
// @ts-ignore
searchers.relations = (textType, test, database) => {
    let relations = R.clone(database.Relations);
    relations = relations.map(R.omit(R.difference(Constants.relationFields, ['origin']))).map((rel) => {
        R.difference(R.keys(rel), ['origin']).forEach((key, i) => {
            rel[`char${i}`] = key;
        });
        return rel;
    });
    return R.flatten(relations.map(rel => [
        format(`${rel.char0}/${rel.char1}`, 'text', rel[rel.char0]),
        format(`${rel.char0} ? ${rel.char1}`, 'text', rel.origin),
        format(`${rel.char1}/${rel.char0}`, 'text', rel[rel.char1]),
    ])).filter(obj => test(obj.text));
};
// @ts-ignore
searchers.groups = (textType, test, database) => {
    const groups = database.Groups;
    return R.flatten(R.values(groups).map((group) => {
        const arr = [];
        if (test(group.masterDescription)) {
          // @ts-ignore
            arr.push(format(`${group.name}/writer`, 'text', group.masterDescription));
        }
        if (test(group.characterDescription)) {
          // @ts-ignore
            arr.push(format(`${group.name}/character`, 'text', group.characterDescription));
        }
        return arr;
    }));
};

//     }
//     callback2(textSearchAPI);
// })(api => (typeof exports === 'undefined' ? (this.textSearchAPI = api) : (module.exports = api)));
