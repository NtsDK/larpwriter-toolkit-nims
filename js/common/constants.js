/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

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

    exports.profileFieldTypes = {
		"text" : {
		    name : "text",
			value : ""
		},
		"string" : {
		    name : "string",
			value : ""
		},
		"enum" : {
		    name : "enum",
			value : "_"
		},
		"number" : {
		    name : "number",
			value : 0
		},
		"checkbox" : {
		    name : "checkbox",
			value : false
		}
    };
    
    exports.objectSubsets = [
        "allObjects",
        "selectedCharacters",
        "selectedStories",
    ];
    
    exports.networks = [
//        "simpleNetwork"            ,
        "socialRelations"          ,
        "characterPresenceInStory" ,
        "characterActivityInStory" ,
    ];
    
    exports.noGroup = "noGroup";
    
    exports.characterActivityTypes = [
        "active",
        "follower",
        "defensive",
        "passive",
    ];

    exports.numberFilter = [
        "ignore" ,
        "greater",
        "equal"  ,
        "lesser" ,
    ];
    
    exports.finishedText   = "finishedText"  ;
    exports.finishedSuffix = "finishedSuffix";
    exports.emptySuffix    = "emptySuffix"   ;
    
    exports[true] = "yes";
    exports[false] = "no";
    
    exports.yesNo = [exports[true], exports[false]];
    
    exports.briefingNumber = [1,5,10,20];
    
    exports.colorPalette = [
      //{color: {border: "#2B7CE9", background: "#97C2FC", highlight: {border: "#2B7CE9", background: "#D2E5FF"}, hover: {border: "#2B7CE9", background: "#D2E5FF"}}}, // 0: blue
      //{color: {border: "#FFA500", background: "#FFFF00", highlight: {border: "#FFA500", background: "#FFFFA3"}, hover: {border: "#FFA500", background: "#FFFFA3"}}}, // 1: yellow
      {color: {border: "#FA0A10", background: "#FB7E81", highlight: {border: "#FA0A10", background: "#FFAFB1"}, hover: {border: "#FA0A10", background: "#FFAFB1"}}}, // 2: red
      {color: {border: "#41A906", background: "#7BE141", highlight: {border: "#41A906", background: "#A1EC76"}, hover: {border: "#41A906", background: "#A1EC76"}}}, // 3: green
      {color: {border: "#E129F0", background: "#EB7DF4", highlight: {border: "#E129F0", background: "#F0B3F5"}, hover: {border: "#E129F0", background: "#F0B3F5"}}}, // 4: magenta
      {color: {border: "#7C29F0", background: "#AD85E4", highlight: {border: "#7C29F0", background: "#D3BDF0"}, hover: {border: "#7C29F0", background: "#D3BDF0"}}}, // 5: purple
      {color: {border: "#C37F00", background: "#FFA807", highlight: {border: "#C37F00", background: "#FFCA66"}, hover: {border: "#C37F00", background: "#FFCA66"}}}, // 6: orange
      {color: {border: "#4220FB", background: "#6E6EFD", highlight: {border: "#4220FB", background: "#9B9BFD"}, hover: {border: "#4220FB", background: "#9B9BFD"}}}, // 7: darkblue
      {color: {border: "#FD5A77", background: "#FFC0CB", highlight: {border: "#FD5A77", background: "#FFD1D9"}, hover: {border: "#FD5A77", background: "#FFD1D9"}}}, // 8: pink
      {color: {border: "#4AD63A", background: "#C2FABC", highlight: {border: "#4AD63A", background: "#E6FFE3"}, hover: {border: "#4AD63A", background: "#E6FFE3"}}}, // 9: mint
      
      {color: {border: "#990000", background: "#EE0000", highlight: {border: "#BB0000", background: "#FF3333"}, hover: {border: "#BB0000", background: "#FF3333"}}}, // 10:bright red
      
      {color: {border: "#FF6000", background: "#FF6000", highlight: {border: "#FF6000", background: "#FF6000"}, hover: {border: "#FF6000", background: "#FF6000"}}}, // 12: real orange
      {color: {border: "#97C2FC", background: "#2B7CE9", highlight: {border: "#D2E5FF", background: "#2B7CE9"}, hover: {border: "#D2E5FF", background: "#2B7CE9"}}}, // 13: blue
      {color: {border: "#399605", background: "#255C03", highlight: {border: "#399605", background: "#255C03"}, hover: {border: "#399605", background: "#255C03"}}}, // 14: green
      {color: {border: "#B70054", background: "#FF007E", highlight: {border: "#B70054", background: "#FF007E"}, hover: {border: "#B70054", background: "#FF007E"}}}, // 15: magenta
      {color: {border: "#AD85E4", background: "#7C29F0", highlight: {border: "#D3BDF0", background: "#7C29F0"}, hover: {border: "#D3BDF0", background: "#7C29F0"}}}, // 16: purple
      {color: {border: "#4557FA", background: "#000EA1", highlight: {border: "#6E6EFD", background: "#000EA1"}, hover: {border: "#6E6EFD", background: "#000EA1"}}}, // 17: darkblue
      {color: {border: "#FFC0CB", background: "#FD5A77", highlight: {border: "#FFD1D9", background: "#FD5A77"}, hover: {border: "#FFD1D9", background: "#FD5A77"}}}, // 18: pink
      {color: {border: "#C2FABC", background: "#74D66A", highlight: {border: "#E6FFE3", background: "#74D66A"}, hover: {border: "#E6FFE3", background: "#74D66A"}}}, // 19: mint
      
      {color: {border: "#EE0000", background: "#990000", highlight: {border: "#FF3333", background: "#BB0000"}, hover: {border: "#FF3333", background: "#BB0000"}}} // 20:bright red
    ];

    
})(typeof exports === 'undefined'? this['Constants']={}: exports);

