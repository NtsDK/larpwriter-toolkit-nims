// ((exports) => {
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
const IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
const baseName = 'filesBase';
const storeName = 'filesStore';

export const test = () => {
//        console.log('2323223');
//        exports.put('base1', {
//            'sd':12,
//        }, logerr2);
//        exports.put('base2', {
//            'ssdsdd':1654654,
//        }, logerr2);
//        exports.get('base1', (err, base) => {
//            if(err) {console.log(err); return;}
//            console.log(base);
//        });
//        exports.get('base3', (err, base) => {
//            if(err) {console.log(err); return;}
//            console.log(base);
//        });
};

function logerr(err) {
  console.log(err);
}

const logerr2 = (err) => {
  if (err) { console.log(err); }
};

function connectDB(callback) {
  const request = indexedDB.open(baseName, 1);
  request.onerror = callback;
  request.onsuccess = function () {
    callback(null, request.result);
  };
  request.onupgradeneeded = function (e) {
    e.currentTarget.result.createObjectStore(storeName, { keyPath: 'id' });
    connectDB(callback);
  };
}

export const get = (id) => new Promise(((resolve, reject) => {
  connectDB((err, db) => {
    if (err) { reject(err); return; }
    const request = db.transaction([storeName], 'readonly').objectStore(storeName).get(id);
    request.onerror = reject;
    request.onsuccess = function () {
      resolve(request.result ? request.result : null);
    };
  });
}));

export const put = (id, obj) => new Promise(((resolve, reject) => {
  connectDB((err, db) => {
    if (err) { reject(err); return; }
    const request = db.transaction([storeName], 'readwrite').objectStore(storeName).put({ id, obj });
    request.onerror = reject;
    request.onsuccess = function () {
      resolve(request.result);
    };
  });
}));
// })(window.LocalBaseAPI = {});
