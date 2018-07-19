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
    
// // This works on all devices/browsers, and uses IndexedDBShim as a final fallback 
//    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
//
//    // Open (or create) the database
//    var open = indexedDB.open("MyDatabase", 1);
//
//    // Create the schema
//    open.onupgradeneeded = function() {
//        var db = open.result;
//        var store = db.createObjectStore("MyObjectStore", {keyPath: "id"});
//        var index = store.createIndex("NameIndex", ["name.last", "name.first"]);
//    };
//
//    open.onsuccess = function() {
//        // Start a new transaction
//        var db = open.result;
//        var tx = db.transaction("MyObjectStore", "readwrite");
//        var store = tx.objectStore("MyObjectStore");
//        var index = store.index("NameIndex");
//
//        // Add some data
//        store.put({id: 12345, name: {first: "John", last: "Doe"}, age: 42});
//        store.put({id: 67890, name: {first: "Bob", last: "Smith"}, age: 35});
//        
//        // Query the data
//        var getJohn = store.get(12345);
//        var getBob = index.get(["Smith", "Bob"]);
//
//        getJohn.onsuccess = function() {
//            console.log(getJohn.result.name.first);  // => "John"
//        };
//
//        getBob.onsuccess = function() {
//            console.log(getBob.result.name.first);   // => "Bob"
//        };
//
//        // Close the db when the transaction is done
//        tx.oncomplete = function() {
//            db.close();
//        };
//    }
    
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