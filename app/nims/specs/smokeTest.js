const getChecks = {
    baseAPI:
    [{
        func: 'getMetaInfoNew',
        args: {},
    }, {
        func: 'getDatabaseNew',
        args: {},
    }],
    briefingExportAPI:
    [{
        func: 'getBriefingDataNew',
        args: {selCharacters: null, selStories: null, exportOnlyFinishedStories: false}
    }],
    consistencyCheckAPI:
    [{
        func: 'getConsistencyCheckResultNew',
        args: {},
    }],
    entityAPI:
    [{
        func: 'getEntityNamesArrayNew',
        args: {type: 'character'},
    }],
    groupsAPI:
    [{
        func: 'getGroupNamesArrayNew',
        args: {},
    },
    {
        func: 'getAllCharacterGroupTextsNew',
        args: {},
    },
    {
        func: 'getProfileFilterInfoNew',
        args: {},
    },
    {
        func: 'getGroupCharacterSetsNew',
        args: {},
    },
    {
        func: 'getGroupNew',
        args: {groupName: 'Эльфы'},
    },
    {
        func: 'getCharacterGroupTextsNew',
        args: {characterName:'Арагорн'},
    }],
    groupSchemaAPI:
    [{
        func: 'getGroupSchemasNew',
        args: {},
    }],
    logAPI:
    [{
        func: 'getLogNew',
        args: {pageNumber:0, filter: {}},
    }],
    profileBindingAPI:
    [{
        func: 'getProfileBindingsNew',
        args: {},
    },
    {
        func: 'getExtendedProfileBindingsNew',
        args: {},
    },
    {
        func: 'getProfileBindingNew',
        args: {type:'character', name:'Арагорн'},
    }],
    profileConfigurerAPI:
    [{
        func: 'getProfileStructureNew',
        args: {type: 'character'},
    }],
    profilesAPI:
    [{
        func: 'getProfileNamesArrayNew',
        args: {type: 'character'},
    },
    {
        func: 'getProfileNew',
        args: {type:'character',name: 'Арагорн'},
    },
    {
        func: 'getAllProfilesNew',
        args: {type: 'character'},
    }],
    profileViewAPI:
    [{
        func: 'getRoleGridInfoNew',
        args: {},
    }],
    relationsAPI:
    [{
        func: 'getRelationsSummaryNew',
        args: {characterName:'Арагорн'},
    }],
    statisticsAPI:
    [{
        func: 'getStatisticsNew',
        args: {},
    },
    {
        func: 'getRelationsNew',
        args: {},
    }],
    storyAdaptationsAPI:
    [{
        func: 'getFilteredStoryNamesNew',
        args: {showOnlyUnfinishedStories: true},
    },
    {
        func: 'getStoryNew',
        args: {storyName: 'Начало пути'},
    }],
    storyBaseAPI:
    [{
        func: 'getStoryNamesArrayNew',
        args: {},
    },
    {
        func: 'getAllStoriesNew',
        args: {},
    },
    {
        func: 'getWriterStoryNew',
        args: {storyName: 'Начало пути'},
    }],
    storyCharactersAPI:
    [{
        func: 'getStoryCharacterNamesArrayNew',
        args: {storyName: 'Начало пути'},
    },
    {
        func: 'getStoryCharactersNew',
        args: {storyName:'Начало пути'},
    }],
    storyEventsAPI:
    [{
        func: 'getStoryEventsNew',
        args: {storyName: 'Начало пути'},
    }],
    storyViewAPI:
    [{
        func: 'getAllInventoryListsNew',
        args: {characterName: 'Арагорн'},
    },
    {
        func: 'getCharacterEventGroupsByStoryNew',
        args: {characterName: 'Арагорн'},
    },
    {
        func: 'getCharacterEventsByTimeNew',
        args: {characterName: 'Арагорн'},
    },
    {
        func: 'getEventsTimeInfoNew',
        args: {},
    },
    {
        func: 'getCharactersSummaryNew',
        args: {},
    },
    {
        func: 'getCharacterReportNew',
        args: {characterName: 'Арагорн'},
    }],
    textSearchAPI:
    [{
        func: 'getTextsNew',
        args: {searchStr: 'Арагорн', textTypes: ['characterProfiles', 'playerProfiles', 'groups', 'relations', 'writerStory', 'eventOrigins',
            'eventAdaptations'], caseSensitive: false},
    }],
    gearsAPI:
    [{
        func: 'getAllGearsDataNew',
        args: {},
    }],
    slidersAPI:
    [{
        func: 'getSliderDataNew',
        args: {},
    }],
};

const setChecks = {
    baseAPI:
    [
    {
        func: 'setMetaInfoStringNew',
        args: {name: 'name', value: '123'},
    },
    {
        func: 'setMetaInfoDateNew',
        args: {name: 'preGameDate', value: "3018/01/14 00:00"},
    }],
    groupsAPI:
    [{
        func: 'createGroupNew',
        args: {groupName: 'testGroup'},
        forInconsistency: true,
    },
    {
        func: 'renameGroupNew',
        args: {fromName: 'testGroup', toName: 'testGroup2'},
        forInconsistency: true,
    },
    {
        func: 'saveFilterToGroupNew',
        args: {groupName: 'testGroup2', filterModel: []},
    },
    {
        "func": "updateGroupFieldNew",
        "args": {
            "groupName": "testGroup2",
            "fieldName": "masterDescription",
            "value": "654654654"
        }
    },
    {
        "func": "doExportGroupNew",
        "args": {
            "groupName": "testGroup2",
            "value": true
        }
    },
    {
        "func": "removeGroupNew",
        "args": {
            "groupName": "testGroup2"
        },
        forInconsistency: true,
    },
    {
        "func": "createGroupNew",
        "args": {
            "groupName": "testGroup"
        }
    },
    {
        "func": "createProfileItemNew",
        "args": {
            "type": "character",
            "name": "testProfileItem",
            "itemType": "enum",
            "selectedIndex": 0
        }
    },
    {
        "func": "saveFilterToGroupNew",
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
        "func": "updateDefaultValueNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem",
            "value": "test1,test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "renameProfileItemNew",
        "args": {
            "type": "character",
            "newName": "testProfileItem2",
            "oldName": "testProfileItem"
        },
        forInconsistency: true,
    },
    {
        "func": "saveFilterToGroupNew",
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
        "func": "changeProfileItemTypeNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "newType": "multiEnum"
        },
        forInconsistency: true,
    },
    {
        "func": "updateDefaultValueNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "test1,test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "saveFilterToGroupNew",
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
        "func": "updateDefaultValueNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfileItemNew",
        "args": {
            "type": "character",
            "index": 0,
            "profileItemName": "testProfileItem2"
        },
        forInconsistency: true,
    },
    {
        "func": "removeGroupNew",
        "args": {
            "groupName": "testGroup"
        }
    },


    ],
    profileBindingAPI:
    [
    {
        "func": "createProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        },
        forInconsistency: true,
    },
    {
        "func": "createProfileNew",
        "args": {
            "type": "player",
            "characterName": "testPlayer"
        }
    },
    {
        "func": "createBindingNew",
        "args": {
            "characterName": "testCharacter",
            "playerName": "testPlayer"
        },
        forInconsistency: true,
    },
    {
        "func": "removeBindingNew",
        "args": {
            "characterName": "testCharacter",
            "playerName": "testPlayer"
        }
    },
    {
        "func": "createBindingNew",
        "args": {
            "characterName": "testCharacter",
            "playerName": "testPlayer"
        }
    },
    {
        "func": "renameProfileNew",
        "args": {
            "type": "character",
            "fromName": "testCharacter",
            "toName": "testCharacter3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfileNew",
        "args": {
            "type": "player",
            "characterName": "testPlayer"
        }
    },

    ],
    profileConfigurerAPI:
    [
    {
        "func": "createProfileItemNew",
        "args": {
            "type": "character",
            "name": "testProfileItem",
            "itemType": "text",
            "selectedIndex": 0
        }
    },
    {
        "func": "moveProfileItemNew",
        "args": {
            "type": "character",
            "index": 0,
            "newIndex": 1
        }
    },
    {
        "func": "changeProfileItemTypeNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem",
            "newType": "string"
        },
        forInconsistency: true,
    },
    {
        "func": "changeProfileItemPlayerAccessNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem",
            "playerAccessType": "readonly"
        }
    },
    {
        "func": "renameProfileItemNew",
        "args": {
            "type": "character",
            "newName": "testProfileItem2",
            "oldName": "testProfileItem"
        },
        forInconsistency: true,
    },
    {
        "func": "doExportProfileItemChangeNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "checked": false
        }
    },
    {
        "func": "showInRoleGridProfileItemChangeNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "checked": false
        }
    },
    {
        "func": "updateDefaultValueNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "223322"
        }
    },
    {
        "func": "removeProfileItemNew",
        "args": {
            "type": "character",
            "index": 0,
            "profileItemName": "testProfileItem2"
        }
    },
    {
        "func": "createProfileItemNew",
        "args": {
            "type": "character",
            "name": "testProfileItem",
            "itemType": "enum",
            "selectedIndex": 0
        },
        forInconsistency: true,
    },
    {
        "func": "renameEnumValueNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem",
            "fromValue": "_",
            "toValue": "testRename"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfileItemNew",
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
        "func": "createProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "createProfileItemNew",
        "args": {
            "type": "character",
            "name": "testProfileItem",
            "itemType": "text",
            "selectedIndex": 0
        },
        forInconsistency: true,
    },
    {
        "func": "updateProfileFieldNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter",
            "fieldName": "testProfileItem",
            "itemType": "text",
            "value": "test updateProfileField"
        }
    },
    {
        "func": "renameProfileItemNew",
        "args": {
            "type": "character",
            "newName": "testProfileItem2",
            "oldName": "testProfileItem"
        },
        forInconsistency: true,
    },
    {
        "func": "changeProfileItemTypeNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "newType": "enum"
        },
        forInconsistency: true,
    },
    {
        "func": "updateDefaultValueNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "test1,test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "changeProfileItemTypeNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "newType": "multiEnum"
        },
        forInconsistency: true,
    },
    {
        "func": "updateDefaultValueNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "test1,test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "updateProfileFieldNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter",
            "fieldName": "testProfileItem2",
            "itemType": "multiEnum",
            "value": "test1"
        }
    },
    {
        "func": "updateDefaultValueNew",
        "args": {
            "type": "character",
            "profileItemName": "testProfileItem2",
            "value": "test2,test3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfileItemNew",
        "args": {
            "type": "character",
            "index": 0,
            "profileItemName": "testProfileItem2"
        },
        forInconsistency: true,
    },
    {
        "func": "renameProfileNew",
        "args": {
            "type": "character",
            "fromName": "testCharacter",
            "toName": "testCharacter2"
        }
    },
    {
        "func": "removeProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter2"
        }
    },


    ],
    relationsAPI:
    [
    {
        "func": "createProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "createProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter2"
        }
    },
    {
        "func": "createCharacterRelationNew",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2"
        },
        forInconsistency: true,
    },
    {
        "func": "getCharacterRelationNew",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2"
        }
    },
    {
        "func": "getCharacterRelationNew",
        "args": {
            "fromCharacter": "testCharacter2",
            "toCharacter": "testCharacter"
        }
    },
    {
        "func": "setCharacterRelationTextNew",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2",
            "character": "testCharacter",
            "text": "setCharacterRelationText check"
        }
    },
    {
        "func": "setCharacterRelationTextNew",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2",
            "character": "testCharacter2",
            "text": "setCharacterRelationText check 2"
        }
    },
    {
        "func": "setRelationReadyStatusNew",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2",
            "character": "testCharacter",
            "ready": true
        }
    },
    {
        "func": "setRelationReadyStatusNew",
        "args": {
            "fromCharacter": "testCharacter2",
            "toCharacter": "testCharacter",
            "character": "testCharacter2",
            "ready": true
        }
    },
    {
        "func": "setRelationEssenceStatusNew",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2",
            "essence": "allies",
            "flag": true
        }
    },
    {
        "func": "setOriginRelationTextNew",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2",
            "text": "setOriginRelationText check"
        }
    },
    {
        "func": "setOriginRelationTextNew",
        "args": {
            "fromCharacter": "testCharacter2",
            "toCharacter": "testCharacter",
            "text": "setOriginRelationText check 2"
        }
    },
    {
        "func": "removeCharacterRelationNew",
        "args": {
            "fromCharacter": "testCharacter2",
            "toCharacter": "testCharacter"
        }
    },
    {
        "func": "createCharacterRelationNew",
        "args": {
            "fromCharacter": "testCharacter",
            "toCharacter": "testCharacter2"
        }
    },
    {
        "func": "renameProfileNew",
        "args": {
            "type": "character",
            "fromName": "testCharacter",
            "toName": "testCharacter3"
        },
        forInconsistency: true,
    },
    {
        "func": "renameProfileNew",
        "args": {
            "type": "character",
            "fromName": "testCharacter2",
            "toName": "testCharacter4"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfileNew",
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
        "func": "createStoryNew",
        "args": {
            "storyName": "testStory"
        }
    },
    {
        "func": "createProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "addStoryCharacterNew",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "createEventNew",
        "args": {
            "storyName": "testStory",
            "eventName": "testEventName",
            "selectedIndex": 0
        }
    },
    {
        "func": "addCharacterToEventNew",
        "args": {
            "storyName": "testStory",
            "eventIndex": 0,
            "characterName": "testCharacter"
        }
    },
    {
        "func": "setEventAdaptationPropertyNew",
        "args": {
            "storyName": "testStory",
            "eventIndex": 0,
            "characterName": "testCharacter",
            "type": "text",
            "value": "test setEventAdaptationProperty"
        }
    },
    {
        "func": "removeProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "removeStoryNew",
        "args": {
            "storyName": "testStory"
        }
    },

    ],

    storyBaseAPI:
    [
    {
        "func": "createStoryNew",
        "args": {
            "storyName": "testStory"
        }
    },
    {
        "func": "renameStoryNew",
        "args": {
            "fromName": "testStory",
            "toName": "testStory2"
        }
    },
    {
        "func": "setWriterStoryNew",
        "args": {
            "storyName": "testStory2",
            "value": "setWriterStory test"
        }
    },
    {
        "func": "removeStoryNew",
        "args": {
            "storyName": "testStory2"
        }
    },

    ],

    storyCharactersAPI:
    [
    {
        "func": "createStoryNew",
        "args": {
            "storyName": "testStory"
        }
    },
    {
        "func": "createProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "createProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter2"
        }
    },
    {
        "func": "addStoryCharacterNew",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "switchStoryCharactersNew",
        "args": {
            "storyName": "testStory",
            "fromName": "testCharacter",
            "toName": "testCharacter2"
        }
    },
    {
        "func": "updateCharacterInventoryNew",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter2",
            "inventory": "updateCharacterInventory test"
        }
    },
    {
        "func": "createEventNew",
        "args": {
            "storyName": "testStory",
            "eventName": "testEventName",
            "selectedIndex": 0
        }
    },
    {
        "func": "addStoryCharacterNew",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter"
        }
    },
    {
        "func": "addCharacterToEventNew",
        "args": {
            "storyName": "testStory",
            "eventIndex": 0,
            "characterName": "testCharacter"
        }
    },
    {
        "func": "addCharacterToEventNew",
        "args": {
            "storyName": "testStory",
            "eventIndex": 0,
            "characterName": "testCharacter2"
        }
    },
    {
        "func": "renameProfileNew",
        "args": {
            "type": "character",
            "fromName": "testCharacter2",
            "toName": "testCharacter3"
        },
        forInconsistency: true,
    },
    {
        "func": "removeCharacterFromEventNew",
        "args": {
            "storyName": "testStory",
            "eventIndex": 0,
            "characterName": "testCharacter3"
        }
    },
    {
        "func": "onChangeCharacterActivityNew",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter3",
            "activityType": "active",
            "checked": true
        }
    },
    {
        "func": "removeStoryCharacterNew",
        "args": {
            "storyName": "testStory",
            "characterName": "testCharacter3"
        }
    },
    {
        "func": "removeProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter"
        },
        forInconsistency: true,
    },
    {
        "func": "removeProfileNew",
        "args": {
            "type": "character",
            "characterName": "testCharacter3"
        }
    },
    {
        "func": "removeStoryNew",
        "args": {
            "storyName": "testStory"
        }
    },


    ],

    storyEventsAPI:
    [
    {
        "func": "createStoryNew",
        "args": {
            "storyName": "testStory"
        }
    },
    {
        "func": "createEventNew",
        "args": {
            "storyName": "testStory",
            "eventName": "testEventName",
            "selectedIndex": 0
        }
    },
    {
        "func": "createEventNew",
        "args": {
            "storyName": "testStory",
            "eventName": "testEventName2",
            "selectedIndex": 1
        }
    },
    {
        "func": "moveEventNew",
        "args": {
            "storyName": "testStory",
            "index": 0,
            "newIndex": 2
        }
    },
    {
        "func": "cloneEventNew",
        "args": {
            "storyName": "testStory",
            "index": 0
        }
    },
    {
        "func": "mergeEventsNew",
        "args": {
            "storyName": "testStory",
            "index": 0
        }
    },
    {
        "func": "removeEventNew",
        "args": {
            "storyName": "testStory",
            "index": 0
        }
    },
    {
        "func": "setEventOriginPropertyNew",
        "args": {
            "storyName": "testStory",
            "index": 0,
            "property": "name",
            "value": "test setEventOriginProperty"
        }
    },
    {
        "func": "removeStoryNew",
        "args": {
            "storyName": "testStory"
        }
    },

    ],
    gearsAPI:
    [


    {
        "func": "setGearsPhysicsEnabledNew",
        "args": {
            "enabled": true
        }
    },
    {
        "func": "setGearsShowNotesEnabledNew",
        "args": {
            "enabled": true
        }
    },
    {
        "func": "setGearsDataNew",
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
        "func": "createSliderNew",
        "args": {
            "name": "name1",
            "top": "top1",
            "bottom": "bottom1"
        }
    },
    {
        "func": "createSliderNew",
        "args": {
            "name": "name1",
            "top": "top1",
            "bottom": "bottom1"
        }
    },
    {
        "func": "updateSliderNamingNew",
        "args": {
            "index": 2,
            "name": "name3",
            "top": "top3",
            "bottom": "bottom3"
        }
    },
    {
        "func": "updateSliderValueNew",
        "args": {
            "index": 2,
            "value": 5
        }
    },
    {
        "func": "updateSliderValueNew",
        "args": {
            "index": 2,
            "value": 10
        }
    },
    {
        "func": "updateSliderValueNew",
        "args": {
            "index": 2,
            "value": -10
        }
    },
    {
        "func": "updateSliderValueNew",
        "args": {
            "index": 2,
            "value": 0
        }
    },
    {
        "func": "moveSliderNew",
        "args": {
            "index": 2,
            "pos": 3
        }
    },
    {
        "func": "removeSliderNew",
        "args": {
            "index": 2
        }
    },
    {
        "func": "removeSliderNew",
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
                        DBMS.getConsistencyCheckResultNew().then(checkResult => {
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
    const customIgnore = ['setDatabaseNew'];

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

        const allFuncs = Object.keys(Object.getPrototypeOf(DBMS)).filter(R.pipe(R.endsWith('New')));
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
