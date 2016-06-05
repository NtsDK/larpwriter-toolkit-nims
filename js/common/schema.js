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

/*global
 // Utils
 */

"use strict";

(function(exports) {
    
    exports.getSchema = function(base) {
        var schema = {
            "$schema": "http://json-schema.org/draft-04/schema#",
            "title": "SMTK NIMS base",
            "description": "SMTK NIMS base schema.",
            "type": "object"
        };

        var Meta =  getMetaSchema();
        var ProfileSettings =  getProfileSettingsSchema();
        var Log =  getLogSchema();
        var Characters =  getCharactersSchema(base.ProfileSettings);
        var Stories =  getStoriesSchema(base.Characters);
        var ManagementInfo = {};
        if(base.ManagementInfo){
            ManagementInfo =  getManagementInfoSchema(base.ManagementInfo, base.Characters, base.Stories);
        }

        schema.properties = {
            Meta : Meta,
            ProfileSettings : ProfileSettings,
            Characters : Characters,
            Stories : Stories,
            Version : {
                "type" : "string"
            },
            Log : Log,
            Settings: {},
            ManagementInfo: ManagementInfo
        };

        schema.required = ["Meta", "ProfileSettings","Version", "Characters", "Stories", "Log"];
        schema.additionalProperties = false;
        
        return schema;
    };
    
    function getMetaSchema() {
        return {
            "title": "Meta",
            "description": "Contains meta data for game: name, description, dates and saving time.",
            "type": "object",
            "properties": {
                "name" : {
                    "type":"string",
                    "description":"Game name"
                },
                "date" : {
                    "type":"string",
                    "description":"Time of starting game in game universe."
                },
                "preGameDate" : {
                    "type":"string",
                    "description":"Time of starting pregame events in game universe."
                },
                "description" : {
                    "type":"string",
                    "description":"Description text for game."
                },
                "saveTime" : {
                    "type":"string",
                    "description":"Stringified date of last database saving."
                }
            },
            "required": ["name","date","preGameDate","description","saveTime"],
            "additionalProperties": false
        };
    };
    
    function getProfileSettingsSchema() {
        return {
            "title": "ProfileSettings",
            "description": "Describes character profile settings.",
            "type": "array",
            "items": {
                "type" : "object",
                "properties": {
                    "name" : {
                        "type":"string"
                    },
                    "type" : {
                        "type":"string",
                        "enum": ["string", "number", "text", "checkbox", "enum"]
                    },
                    "value" : {
                        "type":["string","number","boolean"]
                    },
                    "doExport" : {
                        "type":"boolean"
                    }
                },
                "required": ["name","type","value","doExport"],
                "additionalProperties": false
            }
        };
    };
    
    function getLogSchema(){
        return {
            "type" : "array",
            "items" : {
                "type" : "array",
                "items" : {
                    "type" : "string",
                },
                "minItems" : 4,
                "maxItems": 4
            }
        };
    };
    
    function getCharactersSchema(profileSettings) {
        var characterProperties = {
            "name" : {
                "type" : "string"
            }
        };
        var value;
        profileSettings.forEach(function(item){
            switch(item.type){
            case "text":
            case "string":
                value = {
                    "type":"string"
                };
                break;
            case "checkbox":
                value = {
                    "type":"boolean"
                };
                break;
            case "number":
                value = {
                    "type":"number"
                };
                break;
            case "enum":
                value = {
                    "type":"string",
                    "enum": item.value.split(",").map(function(item){
                        return item.trim();
                    })
                };
                break;
            }
            characterProperties[item.name] = value;
        });
        
//        console.log(characterProperties);
        
        var schema = {
            "type" : "object",
            "additionalProperties": { 
                "type": "object",
                "properties": characterProperties,
                "required":Object.keys(characterProperties),
                "additionalProperties": false
            }
        };
        return schema;
    };
    
    function getStoriesSchema(characters) {
        var charNames = Object.keys(characters);
        
        var eventCharacter = {
                "type" : "object",
                "properties": {
                    "text":{
                        "type":"string"
                    },
                    "ready":{
                        "type":"boolean"
                    }
                },
                "required":["text"],
                "additionalProperties" : false
        };
        
        var eventSchema = {
            "type" : "object",
            "properties" : {
                "name":{
                    "type":"string"
                },
                "text":{
                    "type":"string"
                },
                "time":{
                    "type":"string"
                },
                "characters":{
                    "type" : "object",
                    // depends on story but for simplicity we check charNames only
                    "properties": charNames.reduce(function(obj, char){
                        obj[char] = eventCharacter;
                        return obj;
                    }, {}),
                    "additionalProperties" : false
                }
            },
            "required":["name","text","time","characters"],
            "additionalProperties" : false
        };
        
        
        var storyCharacterSchema = {
            "type" : "object",
            "properties" : {
                "name":{
                    "type":"string",
                    "enum": charNames
                },
                "inventory":{
                    "type":"string"
                },
                "activity":{
                    "type":"object",
                    "properties":{
                        "active":{
                            "type":"boolean"
                        },
                        "follower":{
                            "type":"boolean"
                        },
                        "defensive":{
                            "type":"boolean"
                        },
                        "passive":{
                            "type":"boolean"
                        },
                    },
                    "additionalProperties" : false
                },
            },
            "required":["name","inventory","activity"],
            "additionalProperties" : false
        };
        
        var storySchema = {
            "type" : "object",
            "properties" : {
                "name":{
                    "type":"string"
                },
                "story":{
                    "type":"string"
                },
                "characters": {
                    "type" : "object",
                    "properties": charNames.reduce(function(obj, char){
                        obj[char] = storyCharacterSchema;
                        return obj;
                    }, {}),
                    "additionalProperties" : false
                },
                "events":{
                    "type" : "array",
                    "items" : eventSchema
                }
            },
            "required":["name","story","characters","events"],
            "additionalProperties" : false
        }
        

        var storiesSchema = {
            "type" : "object",
            "additionalProperties" : storySchema
        };
        
        return storiesSchema;
    };
    
    
    function getManagementInfoSchema(managementInfo, characters, stories) {
        var charNames = Object.keys(characters);
        var storyNames = Object.keys(stories);
        var userNames = Object.keys(managementInfo.UsersInfo);
        
        var userSchema = {
            "type" : "object",
            "properties" : {
                "name" : {
                    "type" : "string"
                },
                "stories" : {
                    "type" : "array",
                    "items" : {
                        "type" : "string",
                        // enum can't be empty, ask about it here 
                        // http://stackoverflow.com/questions/37635675/how-to-validate-empty-array-of-strings-with-ajv
                        "enum" : storyNames.concat("123")
                    },
                    "minItems" : 0
                },
                "characters" : {
                    "type" : "array",
                    "items" : {
                        "type" : "string",
                        "enum" : charNames.concat("123")
                    }
                },
                "salt" : {
                    "type" : "string"
                },
                "hashedPassword" : {
                    "type" : "string"
                },
            },
            "required" : [ "name", "stories", "characters", "salt", "hashedPassword" ],
            "additionalProperties" : false
        };
        
        var managementInfoSchema = {
            "type" : "object",
            "properties" :{
                "UsersInfo": {
                    "type":"object",
                    "additionalProperties" : userSchema
                },
                "admin": {
                    "type":"string",
                    "enum": userNames
                },
                "editor": {
                    "type": [ "string", "null" ],
                    "enum": userNames.concat(null)
                },
                "adaptationRights": {
                    "type":"string",
                    "enum": ["ByStory", "ByCharacter"]
                }
            },
            "required":["UsersInfo","admin","editor","adaptationRights"],
            "additionalProperties" : false
        };
        
        return managementInfoSchema;
    };
    
})(typeof exports === 'undefined' ? this['Schema'] = {} : exports);