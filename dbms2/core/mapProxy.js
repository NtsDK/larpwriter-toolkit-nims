const toAsyncProxy = dbms => new Proxy(dbms, {
  get(target, prop) {
    return new Proxy(target[prop], {
      apply(target2, thisArg, argumentsList) {
      }
    });
  }
});

export default toAsyncProxy;

// const proxy = new Proxy(dbms, {
//     get(target, prop) {
//         let func;
//         if (R.startsWith('get', prop) || R.startsWith('is', prop)) {
//             func = RemoteDBMS._simpleGet;
//         } else {
//             func = RemoteDBMS._simplePut;
//         }
//         return new Proxy(func, {
//             apply(target2, thisArg, argumentsList) {
//                 const arr = [];
//                 for (let i = 0; i < argumentsList.length; i++) {
//                     arr.push(argumentsList[i]);
//                 }
//                 return target2.apply(thisArg, [prop, arr]);
//             }
//         });
//     },
// });
