const getChecks = {
    baseAPI:
    [{
        func: 'getMetaInfo',
        args: {},
    }, {
        func: 'getDatabase',
        args: {},
    }],
    briefingExportAPI:
    [{
        func: 'getBriefingData',
        args: {selCharacters: null, selStories: null, exportOnlyFinishedStories: false}
    }],
    consistencyCheckAPI:
    [{
        func: 'getConsistencyCheckResult',
        args: {},
    }],
    entityAPI:
    [{
        func: 'getEntityNamesArray',
        args: {type: 'character'},
    }],
    groupsAPI:
    [{
        func: 'getGroupNamesArray',
        args: {},
    },
    {
        func: 'getAllCharacterGroupTexts',
        args: {},
    },
    {
        func: 'getProfileFilterInfo',
        args: {},
    },
    {
        func: 'getGroupCharacterSets',
        args: {},
    },
    {
        func: 'getGroup',
        args: {groupName: 'Эльфы'},
    },
    {
        func: 'getCharacterGroupTexts',
        args: {characterName:'Арагорн'},
    }],
    groupSchemaAPI:
    [{
        func: 'getGroupSchemas',
        args: {},
    }],
    logAPI:
    [{
        func: 'getLog',
        args: {pageNumber:0, filter: {}},
    }],
    profileBindingAPI:
    [{
        func: 'getProfileBindings',
        args: {},
    },
    {
        func: 'getExtendedProfileBindings',
        args: {},
    },
    {
        func: 'getProfileBinding',
        args: {type:'character', name:'Арагорн'},
    }],
    profileConfigurerAPI:
    [{
        func: 'getProfileStructure',
        args: {type: 'character'},
    }],
    profilesAPI:
    [{
        func: 'getProfileNamesArray',
        args: {type: 'character'},
    },
    {
        func: 'getProfile',
        args: {type:'character',name: 'Арагорн'},
    },
    {
        func: 'getAllProfiles',
        args: {type: 'character'},
    }],
    profileViewAPI:
    [{
        func: 'getRoleGridInfo',
        args: {},
    }],
    relationsAPI:
    [{
        func: 'getRelationsSummary',
        args: {characterName:'Арагорн'},
    },
    {
        func: 'getRelations',
        args: {},
    }],
    statisticsAPI:
    [{
        func: 'getStatistics',
        args: {},
    }],
    storyAdaptationsAPI:
    [{
        func: 'getFilteredStoryNames',
        args: {showOnlyUnfinishedStories: true},
    },
    {
        func: 'getStory',
        args: {storyName: 'Начало пути'},
    }],
    storyBaseAPI:
    [{
        func: 'getStoryNamesArray',
        args: {},
    },
    {
        func: 'getAllStories',
        args: {},
    },
    {
        func: 'getWriterStory',
        args: {storyName: 'Начало пути'},
    }],
    storyCharactersAPI:
    [{
        func: 'getStoryCharacterNamesArray',
        args: {storyName: 'Начало пути'},
    },
    {
        func: 'getStoryCharacters',
        args: {storyName:'Начало пути'},
    }],
    storyEventsAPI:
    [{
        func: 'getStoryEvents',
        args: {storyName: 'Начало пути'},
    }],
    storyViewAPI:
    [{
        func: 'getAllInventoryLists',
        args: {characterName: 'Арагорн'},
    },
    {
        func: 'getCharacterEventGroupsByStory',
        args: {characterName: 'Арагорн'},
    },
    {
        func: 'getCharacterEventsByTime',
        args: {characterName: 'Арагорн'},
    },
    {
        func: 'getEventsTimeInfo',
        args: {},
    },
    {
        func: 'getCharactersSummary',
        args: {},
    },
    {
        func: 'getCharacterReport',
        args: {characterName: 'Арагорн'},
    }],
    textSearchAPI:
    [{
        func: 'getTexts',
        args: {searchStr: 'Арагорн', textTypes: ['characterProfiles', 'playerProfiles', 'groups', 'relations', 'writerStory', 'eventOrigins',
            'eventAdaptations'], caseSensitive: false},
    }],
    gearsAPI:
    [{
        func: 'getAllGearsData',
        args: {},
    }],
    slidersAPI:
    [{
        func: 'getSliderData',
        args: {},
    }],
};

const setChecks = {
    baseAPI:
    [
    {
        func: 'setMetaInfoString',
        args: {name: 'name', value: '123'},
    },
    {
        func: 'setMetaInfoDate',
        args: {name: 'preGameDate', value: "3018/01/14 00:00"},
    }],
    groupsAPI:
    [{
        func: 'createGroup',
        args: {groupName: 'testGroup'},
        forInconsistency: true,
    },
    {
        func: 'renameGroup',
        args: {fromName: 'testGroup', toName: 'testGroup2'},
        forInconsistency: true,
    },
    {
        func: 'saveFilterToGroup',
        args: {groupName: 'testGroup2', filterModel: []},
    },
    {
        "func": "updateGroupField",
        "args": {
            "groupName": "testGroup2",
            "fieldName": "masterDescription",
            "value": "654654654"
        }
    },
    {
        "func": "doExportGroup",
        "args": {
            "groupName": "testGroup2",
            "value": true
        }
    },
    {
        "func": "removeGroup",
        "args": {
            "groupName": "testGroup2"
        },
        forInconsistency: true,
    },
    {
        "func": "createGroup",
        "args": {
            "groupName": "testGroup"
        }
    },
    {
        "func": "createProfileItem",
        "args": {
            "type": "character",
            "name": "testProfileItem",
            "itemType": "enum",
            "selectedIndex": 0
        }
    },
    {
        "func": "saveFilterToGroup",
        "args": {
            "groupName": "testGroup",
            "filterModel": [
                {
                    "type": "enum",
                    "name": "profile-testProfileItem",
                    "selectedOptions": {}
                }
            ]
        },
        forInconsistency: true,
    },
    {
        "func": "updateDefaultValue",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem",
            "value": "test1,test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "renameProfileItem",
        "args": {
            "type": "character",
            "newName": "testProfileItem2",
            "oldName": "testProfileItem"
        },
        forInconsistency: true,
    },
    {
        "func": "saveFilterToGroup",
        "args": {
            "groupName": "testGroup",
            "filterModel": [
                {
                    "type": "enum",
                    "name": "profile-testProfileItem2",
                    "selectedOptions": {
                        "test1": true
                    }
                }
            ]
        },
        forInconsistency: true,
    },
    {
        "func": "changeProfileItemType",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "newType": "multiEnum"
        },
        forInconsistency: true,
    },
    {
        "func": "updateDefaultValue",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "test1,test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "saveFilterToGroup",
        "args": {
            "groupName": "testGroup",
            "filterModel": [
                {
                    "type": "multiEnum",
                    "name": "profile-testProfileItem2",
                    "condition": "every",
                    "selectedOptions": {
                        "test2": true
                    }
                }
            ]
        },
        forInconsistency: true,
    },
    {
        "func": "updateDefaultValue",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfileItem",
        "args": {
            "type": "character",
            "index": 0,
            "profileItemName": "testProfileItem2"
        },
        forInconsistency: true,
    },
    {
        "func": "removeGroup",
        "args": {
            "groupName": "testGroup"
        }
    },


    ],
    profileBindingAPI:
    [
    {
        "func": "createProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        },
        forInconsistency: true,
    },
    {
        "func": "createProfile",
        "args": {
            "type": "player",
            "characterName": "testPlayer"
        }
    },
    {
        "func": "createBinding",
        "args": {
            "characterName": "testCharacter",
            "playerName": "testPlayer"
        },
        forInconsistency: true,
    },
    {
        "func": "removeBinding",
        "args": {
            "characterName": "testCharacter",
            "playerName": "testPlayer"
        }
    },
    {
        "func": "createBinding",
        "args": {
            "characterName": "testCharacter",
            "playerName": "testPlayer"
        }
    },
    {
        "func": "renameProfile",
        "args": {
            "type": "character",
            "fromName": "testCharacter",
            "toName": "testCharacter3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfile",
        "args": {
            "type": "player",
            "characterName": "testPlayer"
        }
    },

    ],
    profileConfigurerAPI:
    [
    {
        "func": "createProfileItem",
        "args": {
            "type": "character",
            "name": "testProfileItem",
            "itemType": "text",
            "selectedIndex": 0
        }
    },
    {
        "func": "moveProfileItem",
        "args": {
            "type": "character",
            "index": 0,
            "newIndex": 1
        }
    },
    {
        "func": "changeProfileItemType",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem",
            "newType": "string"
        },
        forInconsistency: true,
    },
    {
        "func": "changeProfileItemPlayerAccess",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem",
            "playerAccessType": "readonly"
        }
    },
    {
        "func": "renameProfileItem",
        "args": {
            "type": "character",
            "newName": "testProfileItem2",
            "oldName": "testProfileItem"
        },
        forInconsistency: true,
    },
    {
        "func": "doExportProfileItemChange",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "checked": false
        }
    },
    {
        "func": "showInRoleGridProfileItemChange",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "checked": false
        }
    },
    {
        "func": "updateDefaultValue",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "223322"
        }
    },
    {
        "func": "removeProfileItem",
        "args": {
            "type": "character",
            "index": 0,
            "profileItemName": "testProfileItem2"
        }
    },
    {
        "func": "createProfileItem",
        "args": {
            "type": "character",
            "name": "testProfileItem",
            "itemType": "enum",
            "selectedIndex": 0
        },
        forInconsistency: true,
    },
    {
        "func": "renameEnumValue",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem",
            "fromValue": "_",
            "toValue": "testRename"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfileItem",
        "args": {
            "type": "character",
            "index": 0,
            "profileItemName": "testProfileItem"
        }
    },

    ],


    profilesAPI:
    [
    {
        "func": "createProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "createProfileItem",
        "args": {
            "type": "character",
            "name": "testProfileItem",
            "itemType": "text",
            "selectedIndex": 0
        },
        forInconsistency: true,
    },
    {
        "func": "updateProfileField",
        "args": {
            "type": "character",
            "characterName": "testCharacter",
            "fieldName": "testProfileItem",
            "itemType": "text",
            "value": "test updateProfileField"
        }
    },
    {
        "func": "renameProfileItem",
        "args": {
            "type": "character",
            "newName": "testProfileItem2",
            "oldName": "testProfileItem"
        },
        forInconsistency: true,
    },
    {
        "func": "changeProfileItemType",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "newType": "enum"
        },
        forInconsistency: true,
    },
    {
        "func": "updateDefaultValue",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "test1,test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "changeProfileItemType",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "newType": "multiEnum"
        },
        forInconsistency: true,
    },
    {
        "func": "updateDefaultValue",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "test1,test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "updateProfileField",
        "args": {
            "type": "character",
            "characterName": "testCharacter",
            "fieldName": "testProfileItem2",
            "itemType": "multiEnum",
            "value": "test1"
        }
    },
    {
        "func": "updateDefaultValue",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfileItem",
        "args": {
            "type": "character",
            "index": 0,
            "profileItemName": "testProfileItem2"
        },
        forInconsistency: true,
    },
    {
        "func": "renameProfile",
        "args": {
            "type": "character",
            "fromName": "testCharacter",
            "toName": "testCharacter2"
        }
    },
    {
        "func": "removeProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter2"
        }
    },


    ],
    relationsAPI:
    [
    {
        "func": "createProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "createProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter2"
        }
    },
    {
        "func": "createCharacterRelation",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2"
        },
        forInconsistency: true,
    },
    {
        "func": "getCharacterRelation",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2"
        }
    },
    {
        "func": "getCharacterRelation",
        "args": {
            "fromCharacter": "testCharacter2",
            "toCharacter": "testCharacter"
        }
    },
    {
        "func": "setCharacterRelationText",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2",
            "character": "testCharacter",
            "text": "setCharacterRelationText check"
        }
    },
    {
        "func": "setCharacterRelationText",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2",
            "character": "testCharacter2",
            "text": "setCharacterRelationText check 2"
        }
    },
    {
        "func": "setRelationReadyStatus",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2",
            "character": "testCharacter",
            "ready": true
        }
    },
    {
        "func": "setRelationReadyStatus",
        "args": {
            "fromCharacter": "testCharacter2",
            "toCharacter": "testCharacter",
            "character": "testCharacter2",
            "ready": true
        }
    },
    {
        "func": "setRelationEssenceStatus",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2",
            "essence": "allies",
            "flag": true
        }
    },
    {
        "func": "setOriginRelationText",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2",
            "text": "setOriginRelationText check"
        }
    },
    {
        "func": "setOriginRelationText",
        "args": {
            "fromCharacter": "testCharacter2",
            "toCharacter": "testCharacter",
            "text": "setOriginRelationText check 2"
        }
    },
    {
        "func": "removeCharacterRelation",
        "args": {
            "fromCharacter": "testCharacter2",
            "toCharacter": "testCharacter"
        }
    },
    {
        "func": "createCharacterRelation",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2"
        }
    },
    {
        "func": "renameProfile",
        "args": {
            "type": "character",
            "fromName": "testCharacter",
            "toName": "testCharacter3"
        },
        forInconsistency: true,
    },
    {
        "func": "renameProfile",
        "args": {
            "type": "character",
            "fromName": "testCharacter2",
            "toName": "testCharacter4"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter4"
        },
        forInconsistency: true,
    },

    ],

    storyAdaptationsAPI:
    [
    {
        "func": "createStory",
        "args": {
            "storyName": "testStory"
        }
    },
    {
        "func": "createProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "addStoryCharacter",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "createEvent",
        "args": {
            "storyName": "testStory",
            "eventName": "testEventName",
            "selectedIndex": 0
        }
    },
    {
        "func": "addCharacterToEvent",
        "args": {
            "storyName": "testStory",
            "eventIndex": 0,
            "characterName": "testCharacter"
        }
    },
    {
        "func": "setEventAdaptationProperty",
        "args": {
            "storyName": "testStory",
            "eventIndex": 0,
            "characterName": "testCharacter",
            "type": "text",
            "value": "test setEventAdaptationProperty"
        }
    },
    {
        "func": "removeProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "removeStory",
        "args": {
            "storyName": "testStory"
        }
    },

    ],

    storyBaseAPI:
    [
    {
        "func": "createStory",
        "args": {
            "storyName": "testStory"
        }
    },
    {
        "func": "renameStory",
        "args": {
            "fromName": "testStory",
            "toName": "testStory2"
        }
    },
    {
        "func": "setWriterStory",
        "args": {
            "storyName": "testStory2",
            "value": "setWriterStory test"
        }
    },
    {
        "func": "removeStory",
        "args": {
            "storyName": "testStory2"
        }
    },

    ],

    storyCharactersAPI:
    [
    {
        "func": "createStory",
        "args": {
            "storyName": "testStory"
        }
    },
    {
        "func": "createProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "createProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter2"
        }
    },
    {
        "func": "addStoryCharacter",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "switchStoryCharacters",
        "args": {
            "storyName": "testStory",
            "fromName": "testCharacter",
            "toName": "testCharacter2"
        }
    },
    {
        "func": "updateCharacterInventory",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter2",
            "inventory": "updateCharacterInventory test"
        }
    },
    {
        "func": "createEvent",
        "args": {
            "storyName": "testStory",
            "eventName": "testEventName",
            "selectedIndex": 0
        }
    },
    {
        "func": "addStoryCharacter",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "addCharacterToEvent",
        "args": {
            "storyName": "testStory",
            "eventIndex": 0,
            "characterName": "testCharacter"
        }
    },
    {
        "func": "addCharacterToEvent",
        "args": {
            "storyName": "testStory",
            "eventIndex": 0,
            "characterName": "testCharacter2"
        }
    },
    {
        "func": "renameProfile",
        "args": {
            "type": "character",
            "fromName": "testCharacter2",
            "toName": "testCharacter3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeCharacterFromEvent",
        "args": {
            "storyName": "testStory",
            "eventIndex": 0,
            "characterName": "testCharacter3"
        }
    },
    {
        "func": "onChangeCharacterActivity",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter3",
            "activityType": "active",
            "checked": true
        }
    },
    {
        "func": "removeStoryCharacter",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter3"
        }
    },
    {
        "func": "removeProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfile",
        "args": {
            "type": "character",
            "characterName": "testCharacter3"
        }
    },
    {
        "func": "removeStory",
        "args": {
            "storyName": "testStory"
        }
    },


    ],

    storyEventsAPI:
    [
    {
        "func": "createStory",
        "args": {
            "storyName": "testStory"
        }
    },
    {
        "func": "createEvent",
        "args": {
            "storyName": "testStory",
            "eventName": "testEventName",
            "selectedIndex": 0
        }
    },
    {
        "func": "createEvent",
        "args": {
            "storyName": "testStory",
            "eventName": "testEventName2",
            "selectedIndex": 1
        }
    },
    {
        "func": "moveEvent",
        "args": {
            "storyName": "testStory",
            "index": 0,
            "newIndex": 2
        }
    },
    {
        "func": "cloneEvent",
        "args": {
            "storyName": "testStory",
            "index": 0
        }
    },
    {
        "func": "mergeEvents",
        "args": {
            "storyName": "testStory",
            "index": 0
        }
    },
    {
        "func": "removeEvent",
        "args": {
            "storyName": "testStory",
            "index": 0
        }
    },
    {
        "func": "setEventOriginProperty",
        "args": {
            "storyName": "testStory",
            "index": 0,
            "property": "name",
            "value": "test setEventOriginProperty"
        }
    },
    {
        "func": "removeStory",
        "args": {
            "storyName": "testStory"
        }
    },

    ],
    gearsAPI:
    [


    {
        "func": "setGearsPhysicsEnabled",
        "args": {
            "enabled": true
        }
    },
    {
        "func": "setGearsShowNotesEnabled",
        "args": {
            "enabled": true
        }
    },
    {
        "func": "setGearsData",
        "args": {
            "data": {
                "nodes": [
                    {
                        "id": "e5c1e43e-79c1-4aef-88b9-61e622e3eb6d",
                        "x": 85,
                        "y": -20,
                        "label": "123\n\n2",
                        "name": "123",
                        "group": "1",
                        "notes": "2",
                        "shape": "box"
                    },
                    {
                        "id": "698903f4-ac21-4fd1-abeb-de688cf8b463",
                        "x": -353,
                        "y": -7,
                        "label": "234\n\n345",
                        "name": "234",
                        "group": "2",
                        "notes": "345",
                        "shape": "box"
                    }
                ],
                "edges": [
                    {
                        "from": "698903f4-ac21-4fd1-abeb-de688cf8b463",
                        "to": "e5c1e43e-79c1-4aef-88b9-61e622e3eb6d",
                        "arrows": "to",
                        "id": "4be956c5-0d6b-4e7e-8be8-9e23dc0fe0fb",
                        "label": "2233"
                    }
                ]
            }
        }
    },


    ],
    slidersAPI:
    [
    {
        "func": "createSlider",
        "args": {
            "name": "name1",
            "top": "top1",
            "bottom": "bottom1"
        }
    },
    {
        "func": "createSlider",
        "args": {
            "name": "name1",
            "top": "top1",
            "bottom": "bottom1"
        }
    },
    {
        "func": "updateSliderNaming",
        "args": {
            "index": 2,
            "name": "name3",
            "top": "top3",
            "bottom": "bottom3"
        }
    },
    {
        "func": "updateSliderValue",
        "args": {
            "index": 2,
            "value": 5
        }
    },
    {
        "func": "updateSliderValue",
        "args": {
            "index": 2,
            "value": 10
        }
    },
    {
        "func": "updateSliderValue",
        "args": {
            "index": 2,
            "value": -10
        }
    },
    {
        "func": "updateSliderValue",
        "args": {
            "index": 2,
            "value": 0
        }
    },
    {
        "func": "moveSlider",
        "args": {
            "index": 2,
            "pos": 3
        }
    },
    {
        "func": "removeSlider",
        "args": {
            "index": 2
        }
    },
    {
        "func": "removeSlider",
        "args": {
            "index": 2
        }
    }
    ],
};

R.keys(getChecks).forEach((apiName) => {
    const checks = getChecks[apiName].map((el) => {
        const args = JSON.stringify(el.args);
        el.name = `${el.func}(${args.substring(1, args.length - 1)}) -> ok`;
        return el;
    });

    describe(`${apiName} getter tests`, () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        checks.forEach((check) => {
            it(check.name, (done) => {
                DBMS[check.func](check.args).then( res => {
                    // expect(res).toBeNull();
                    expect(res).not.toBeNull();
                    done();
                }).catch(err => {
                    if (err) console.error(err);
                    expect(err).toBeNull();
                    done();
                });
            });
        });
    });
});


R.keys(setChecks).forEach((apiName) => {
    const checks = setChecks[apiName].map((el) => {
        const args = JSON.stringify(el.args);
        el.name = `${el.func}(${args.substring(1, args.length - 1)}) -> ok`;
        return el;
    });

    describe(`${apiName} setter tests`, () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        checks.forEach((check) => {
            it(check.name, (done) => {
                DBMS[check.func](check.args).then( res => {
                    // expect(res).toBeNull();
                    // if (check.gettable === true) {
                    //     expect(err).toBeNull();
                    // } else {
                    //     expect(err).toBeUndefined();
                    // }
                    if (check.gettable === true) {
                        expect(res).not.toBeNull();
                    } else {
                        // expect(err).toBeUndefined();
                        // if we are here then function is okay
                        expect({k:2}).not.toBeNull()
                    }
                    if (check.forInconsistency === true) {
                    // if (true) {
                        DBMS.getConsistencyCheckResult().then(checkResult => {
                            // expect(err2).toBeNull();
                            if (checkResult.errors.length > 0) {
                                console.error(check.name);
                                checkResult.errors.forEach(console.error);
                            }
                            expect(checkResult.errors.length > 0).toBe(false);
                            done();
                        }).catch(err2 => {
                            expect(err2).toBeNull();
                            done();
                        });
                    } else {
                        done();
                    }
                    // expect(res).not.toBeNull();
                }).catch(err => {
                    if (err) console.error(err);
                    expect(err).toBeNull();
                    done();
                });
            });
        });
    });
});

describe('Core smoke test coverage check', () => {
    const customIgnore = ['setDatabase'];

    it('Core smoke test coverage check', () => {
        const funcArr = R.uniq(R.concat(R.flatten(R.values(getChecks)).map(R.prop('func')), R.flatten(R.values(setChecks)).map(R.prop('func'))));

        const { serverSpecificFunctions } = Constants;
        const intersection = R.intersection(serverSpecificFunctions, funcArr);
        if (intersection.length > 0) {
            console.log(intersection);
        }
        expect(intersection.length).toBe(0);

        const { commonIgnoreList } = Constants;
        const intersection2 = R.intersection(commonIgnoreList, funcArr);
        if (intersection2.length > 0) {
            console.log(intersection2);
        }
        expect(intersection2.length).toBe(0);

        // const allFuncs = Object.keys(Object.getPrototypeOf(DBMS)).filter(R.pipe(R.endsWith('New')));
        const allFuncs = Object.keys(Object.getPrototypeOf(DBMS));
        // const allFuncs = Object.keys(Object.getPrototypeOf(DBMS)).filter(R.pipe(R.endsWith('Pm'), R.not));
        const sum = [funcArr, serverSpecificFunctions, commonIgnoreList, customIgnore].reduce((acc, el) => {
            acc = R.concat(acc, el);
            return acc;
        }, []);
        const diff = R.difference(allFuncs, sum);
        if (diff.length > 0) {
            console.log(diff);
        }
        expect(diff.length).toBe(0);
    });
});
