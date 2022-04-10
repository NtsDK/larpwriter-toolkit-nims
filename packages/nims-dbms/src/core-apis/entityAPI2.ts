
import { PC, Errors } from "nims-dbms-core";
import * as Constants from "../nimsConstants";
import { ILocalDBMS } from "./ILocalDBMS";

// ((callback2) => {
//     function entityAPI(LocalDBMS, opts) {
//         const {
//             R, Constants, Errors, CU, PC
//         } = opts;

// DBMS.groups.names.get()
export function getEntityNamesArray(this: ILocalDBMS, { type }: any = {}) {
    return new Promise((resolve, reject) => {
        const chain = PC.chainCheck([PC.isString(type), PC.elementFromEnum(type, Constants.ownedEntityTypes)]);
        // const callback = (err, result) => {
        //     if(err){
        //         reject(err);
        //     } else {
        //         resolve(result);
        //     }
        // }
        PC.precondition(chain, reject, () => {
            switch (type) {
            case 'character':
            case 'player':
                // this.getProfileNamesArray(type, callback);
                // @ts-ignore
                this.getProfileNamesArray({ type }).then(resolve).catch(reject);
                break;
            case 'group':
                // this.getGroupNamesArray(callback);
                // @ts-ignore
                this.getGroupNamesArray().then(resolve).catch(reject);
                break;
            case 'story':
                // this.getStoryNamesArray(callback);
                // @ts-ignore
                this.getStoryNamesArray().then(resolve).catch(reject);
                break;
            default:
                reject(new Errors.InternalError('errors-unexpected-switch-argument', [type]));
            }
        });
    });
};
//     }
//     callback2(entityAPI);
// })(api => (typeof exports === 'undefined' ? (this.entityAPI = api) : (module.exports = api)));
