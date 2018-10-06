/*Copyright 2018 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

'use strict';

((exports) => {
    const indexedDB     = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    const IDBTransaction  = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    const baseName      = "filesBase";
    const storeName     = "filesStore";

    exports.test = () => {
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

    function logerr(err){
        console.log(err);
    }

    var logerr2 = (err) => {
        if(err) {console.log(err); return;}
    };

    function connectDB(callback){
        var request = indexedDB.open(baseName, 1);
        request.onerror = callback;
        request.onsuccess = function(){
            callback(null, request.result);
        }
        request.onupgradeneeded = function(e){
            e.currentTarget.result.createObjectStore(storeName, { keyPath: "id" });
            connectDB(callback);
        }
    }

    exports.get = (id) => {
        return new Promise(function(resolve, reject) {
            connectDB(function(err, db){
                if(err) {reject(err); return;}
                var request = db.transaction([storeName], "readonly").objectStore(storeName).get(id);
                request.onerror = reject;
                request.onsuccess = function(){
                    resolve(request.result ? request.result : null);
                }
            });
        });
    }

    exports.put = (id, obj) => {
        return new Promise(function(resolve, reject) {
            connectDB(function(err, db){
                if(err) {reject(err); return;}
                var request = db.transaction([storeName], "readwrite").objectStore(storeName).put({id, obj});
                request.onerror = reject;
                request.onsuccess = function(){
                    resolve(request.result);
                }
            });
        });
    }
})(this.LocalBaseAPI = {});
