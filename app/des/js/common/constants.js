/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
   limitations under the License. */

/*
 */
"use strict";

(function(exports){
    
    exports.themeList = ['nims-theme', 'des-light-theme', 'des-dark-theme'];
    
    exports.assetTypes = ["local","global"];
    
    exports.shopDataTypes = ["corporation","sellerLogin","sellerPassword"];
    
    exports.ownedEntityTypes = ['shop','asset'];

    exports.assetProfileStructure = [{
        name: "displayString",
        type: "string",
    },{
        name: "isPhysical",
        type: "checkbox",
    },{
        name: "resourceCost",
        type: "number",
    },{
        name: "apiKey",
        type: "string",
    },{
        name: "description",
        type: "text",
    }];
    
    exports.assetEditableItems = ['displayString','isPhysical','resourceCost','apiKey','description'];
    exports.localAssetEditableItems = ['displayString','description'];
    
    exports.localAssetProfileStructure = [{
        name: "displayString",
        type: "string",
    },{
        name: "description",
        type: "text",
    }];
    
    exports.httpTimeout = 5000;
    
})(typeof exports === 'undefined'? this['Constants']={}: exports);

