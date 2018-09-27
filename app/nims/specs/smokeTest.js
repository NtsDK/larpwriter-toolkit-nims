const getChecks = {
    baseAPI:
    [{
        func: 'getMetaInfo',
        args: [],
    }, {
        func: 'getMetaInfoNew',
        args: {},
    }, {
        func: 'getDatabase',
        args: {},
    }],
    briefingExportAPI:
    [{
        func: 'getBriefingData',
        args: [null, null, false],
    }, {
        func: 'getBriefingDataNew',
        args: {selCharacters: null, selStories: null, exportOnlyFinishedStories: false}
    }],
    consistencyCheckAPI:
    [{
        func: 'getConsistencyCheckResult',
        args: [],
    },{
        func: 'getConsistencyCheckResultNew',
        args: {},
    }],
    entityAPI:
    [{
        func: 'getEntityNamesArray',
        args: ['character'],
    },{
        func: 'getEntityNamesArrayNew',
        args: {type: 'character'},
    }],
    groupsAPI:
    [{
        func: 'getGroupNamesArray',
        args: [],
    },
    {
        func: 'getGroupNamesArrayNew',
        args: {},
    },
    {
        func: 'getAllCharacterGroupTexts',
        args: [],
    },
    {
        func: 'getAllCharacterGroupTextsNew',
        args: {},
    },
    {
        func: 'getProfileFilterInfo',
        args: [],
    },
    {
        func: 'getProfileFilterInfoNew',
        args: {},
    },
    {
        func: 'getGroupCharacterSets',
        args: [],
    },
    {
        func: 'getGroupCharacterSetsNew',
        args: {},
    },
    {
        func: 'getGroup',
        args: ['Эльфы'],
    },
    {
        func: 'getGroupNew',
        args: {groupName: 'Эльфы'},
    },
    {
        func: 'getCharacterGroupTexts',
        args: ['Арагорн'],
    },{
        func: 'getCharacterGroupTextsNew',
        args: {characterName:'Арагорн'},
    }],
    groupSchemaAPI:
    [{
        func: 'getGroupSchemas',
        args: [],
    },{
        func: 'getGroupSchemasNew',
        args: {},
    }],
    logAPI:
    [{
        func: 'getLog',
        args: [0, {}],
    },{
        func: 'getLogNew',
        args: {pageNumber:0, filter: {}},
    }],
    profileBindingAPI:
    [{
        func: 'getProfileBindings',
        args: [],
    },
    {
        func: 'getProfileBindingsNew',
        args: {},
    },
    {
        func: 'getExtendedProfileBindings',
        args: [],
    },
    {
        func: 'getExtendedProfileBindingsNew',
        args: {},
    },
    {
        func: 'getProfileBinding',
        args: ['character', 'Арагорн'],
    },{
        func: 'getProfileBindingNew',
        args: {type:'character', name:'Арагорн'},
    }],
    profileConfigurerAPI:
    [{
        func: 'getProfileStructure',
        args: ['character'],
    },{
        func: 'getProfileStructureNew',
        args: {type: 'character'},
    }],
    profilesAPI:
    [{
        func: 'getProfileNamesArray',
        args: ['character'],
    },{
        func: 'getProfileNamesArrayNew',
        args: {type: 'character'},
    },
    {
        func: 'getProfile',
        args: ['character', 'Арагорн'],
    },
    {
        func: 'getProfileNew',
        args: {type:'character',name: 'Арагорн'},
    },
    {
        func: 'getAllProfiles',
        args: ['character'],
    },{
        func: 'getAllProfilesNew',
        args: {type: 'character'},
    }],
    profileViewAPI:
    [{
        func: 'getRoleGridInfo',
        args: [],
    },{
        func: 'getRoleGridInfoNew',
        args: {},
    }],
    relationsAPI:
    [{
        func: 'getRelationsSummary',
        args: ['Арагорн'],
    },{
        func: 'getRelationsSummaryNew',
        args: {characterName:'Арагорн'},
    }],
    statisticsAPI:
    [{
        func: 'getStatistics',
        args: [],
    },{
        func: 'getStatisticsNew',
        args: {},
    },
    {
        func: 'getRelations',
        args: [],
    },{
        func: 'getRelationsNew',
        args: {},
    }],
    storyAdaptationsAPI:
    [{
        func: 'getFilteredStoryNames',
        args: [true],
    },{
        func: 'getFilteredStoryNamesNew',
        args: {showOnlyUnfinishedStories: true},
    },
    {
        func: 'getStory',
        args: ['Начало пути'],
    },
    {
        func: 'getStoryNew',
        args: {storyName: 'Начало пути'},
    }],
    storyBaseAPI:
    [{
        func: 'getStoryNamesArray',
        args: [],
    },{
        func: 'getStoryNamesArrayNew',
        args: {},
    },
    {
        func: 'getAllStories',
        args: [],
    },
    {
        func: 'getAllStoriesNew',
        args: {},
    },
    {
        func: 'getWriterStory',
        args: ['Начало пути'],
    },
    {
        func: 'getWriterStoryNew',
        args: {storyName: 'Начало пути'},
    }],
    storyCharactersAPI:
    [{
        func: 'getStoryCharacterNamesArray',
        args: ['Начало пути'],
    },{
        func: 'getStoryCharacterNamesArrayNew',
        args: {storyName: 'Начало пути'},
    },
    {
        func: 'getStoryCharacters',
        args: ['Начало пути'],
    },
    {
        func: 'getStoryCharactersNew',
        args: {storyName:'Начало пути'},
    }],
    storyEventsAPI:
    [{
        func: 'getStoryEvents',
        args: ['Начало пути'],
    },{
        func: 'getStoryEventsNew',
        args: {storyName: 'Начало пути'},
    }],
    storyViewAPI:
    [{
        func: 'getAllInventoryLists',
        args: ['Арагорн'],
    },{
        func: 'getAllInventoryListsNew',
        args: {characterName: 'Арагорн'},
    },
    {
        func: 'getCharacterEventGroupsByStory',
        args: ['Арагорн'],
    },
    {
        func: 'getCharacterEventGroupsByStoryNew',
        args: {characterName: 'Арагорн'},
    },
    {
        func: 'getCharacterEventsByTime',
        args: ['Арагорн'],
    },
    {
        func: 'getCharacterEventsByTimeNew',
        args: {characterName: 'Арагорн'},
    },
    {
        func: 'getEventsTimeInfo',
        args: [],
    },
    {
        func: 'getEventsTimeInfoNew',
        args: {},
    },
    {
        func: 'getCharactersSummary',
        args: [],
    },
    {
        func: 'getCharactersSummaryNew',
        args: {},
    },
    {
        func: 'getCharacterReport',
        args: ['Арагорн'],
    }, {
        func: 'getCharacterReportNew',
        args: {characterName: 'Арагорн'},
    }],
    textSearchAPI:
    [{
        func: 'getTexts',
        args: ['Арагорн', ['characterProfiles', 'playerProfiles', 'groups', 'relations', 'writerStory', 'eventOrigins',
            'eventAdaptations'], false],
    },{
        func: 'getTextsNew',
        args: {searchStr: 'Арагорн', textTypes: ['characterProfiles', 'playerProfiles', 'groups', 'relations', 'writerStory', 'eventOrigins',
            'eventAdaptations'], caseSensitive: false},
    }],
    gearsAPI:
    [{
        func: 'getAllGearsData',
        args: [],
    },{
        func: 'getAllGearsDataNew',
        args: {},
    }],
    slidersAPI:
    [{
        func: 'getSliderData',
        args: [],
    },{
        func: 'getSliderDataNew',
        args: {},
    }],
};

const setChecks = {
    baseAPI:
    [{
    //     func: 'setMetaInfoString',
    //     args: ['name', '123'],
    // },{
        func: 'setMetaInfoStringNew',
        args: {name: 'name', value: '123'},
    },
    // {
    //     func: 'setMetaInfoDate',
    //     args: ['preGameDate', "3018/01/14 00:00"],
    // },
    {
        func: 'setMetaInfoDateNew',
        args: {name: 'preGameDate', value: "3018/01/14 00:00"},
    }],
    groupsAPI:
    [{
    //     func: 'createGroup',
    //     args: ['testGroup'],
    // },{
        func: 'createGroupNew',
        args: {groupName: 'testGroup'},
    },
    // {
    //     func: 'renameGroup',
    //     args: ['testGroup', 'testGroup2'],
    // },
    {
        func: 'renameGroupNew',
        args: {fromName: 'testGroup', toName: 'testGroup2'},
    },
    // {
    //     func: 'saveFilterToGroup',
    //     args: ['testGroup2', []],
    // },
    {
        func: 'saveFilterToGroupNew',
        args: {groupName: 'testGroup2', filterModel: []},
    },
    // {
    //     func: 'updateGroupField',
    //     args: ['testGroup2', 'masterDescription', '654654654'],
    // },
    // {
    //     func: 'doExportGroup',
    //     args: ['testGroup2', true],
    // },
    // {
    //     func: 'removeGroup',
    //     args: ['testGroup2'],
    // },
    // {
    //     func: 'createGroup',
    //     args: ['testGroup'],
    // },
    // {
    //     func: 'createProfileItem',
    //     args: ['character', 'testProfileItem', 'enum', 0],
    // },
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
        }
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
        func: 'saveFilterToGroup',
        args: ['testGroup', [{ type: 'enum', name: 'profile-testProfileItem', selectedOptions: { _: true } }]],
        forInconsistency: true,
    },
    {
        func: 'updateDefaultValue',
        args: ['character', 'testProfileItem', 'test1,test2,test3'],
        forInconsistency: true,
    },
    {
        func: 'renameProfileItem',
        args: ['character', 'testProfileItem2', 'testProfileItem'],
        forInconsistency: true,
    },
    {
        func: 'saveFilterToGroup',
        args: ['testGroup', [{ type: 'enum', name: 'profile-testProfileItem2', selectedOptions: { test1: true } }]],
        forInconsistency: true,
    },
    {
        func: 'changeProfileItemType',
        args: ['character', 'testProfileItem2', 'multiEnum'],
        forInconsistency: true,
    },
    {
        func: 'updateDefaultValue',
        args: ['character', 'testProfileItem2', 'test1,test2,test3'],
        forInconsistency: true,
    },
    {
        func: 'saveFilterToGroup',
        args: ['testGroup', [{
            type: 'multiEnum', name: 'profile-testProfileItem2', condition: 'every', selectedOptions: { test1: true, test2: true }
        }]],
        forInconsistency: true,
    },
    {
        func: 'updateDefaultValue',
        args: ['character', 'testProfileItem2', 'test2,test3'],
        forInconsistency: true,
    },
    {
        func: 'removeProfileItem',
        args: ['character', 0, 'testProfileItem2'],
        forInconsistency: true,
    },
        //        {
        //            func: 'renameGroup',
        //            args: ['testGroup', 'testGroup155'],
        //        },
        //        {
        //            func: 'updateGroupField',
        //            args: ['testGroup2', 'masterDescription', '654654654'],
        //        },
    {
        func: 'removeGroup',
        args: ['testGroup'],
    }


    ],
    profileBindingAPI:
    [{
        func: 'createProfile',
        args: ['character', 'testCharacter'],
    },
    {
        func: 'createProfile',
        args: ['player', 'testPlayer'],
    },
    {
        func: 'createBinding',
        args: ['testCharacter', 'testPlayer'],
    },
    {
        func: 'removeBinding',
        args: ['testCharacter', 'testPlayer'],
    },
    {
        func: 'createBinding',
        args: ['testCharacter', 'testPlayer'],
    },
    {
        func: 'renameProfile',
        args: ['character', 'testCharacter', 'testCharacter3'],
        forInconsistency: true,
    },
    {
        func: 'removeProfile',
        args: ['character', 'testCharacter3'],
        forInconsistency: true,
    },
    {
        func: 'removeProfile',
        args: ['player', 'testPlayer'],
    }],
    profileConfigurerAPI:
    [{
        func: 'createProfileItem',
        args: ['character', 'testProfileItem', 'text', 0],
    },
    {
        func: 'moveProfileItem',
        args: ['character', 0, 1],
    },
    {
        func: 'changeProfileItemType',
        args: ['character', 'testProfileItem', 'string'],
    },
    {
        func: 'changeProfileItemPlayerAccess',
        args: ['character', 'testProfileItem', 'readonly'],
    },
    {
        func: 'renameProfileItem',
        args: ['character', 'testProfileItem2', 'testProfileItem'],
    },
    {
        func: 'doExportProfileItemChange',
        args: ['character', 'testProfileItem2', false],
    },
    {
        func: 'showInRoleGridProfileItemChange',
        args: ['character', 'testProfileItem2', false],
    },
    {
        func: 'updateDefaultValue',
        args: ['character', 'testProfileItem2', '223322'],
    },
    {
        func: 'removeProfileItem',
        args: ['character', 0, 'testProfileItem2'],
    },
    {
        func: 'createProfileItem',
        args: ['character', 'testProfileItem', 'enum', 0],
    },
    {
        func: 'renameEnumValue',
        args: ['character', 'testProfileItem', '_', 'testRename'],
    },
    {
        func: 'removeProfileItem',
        args: ['character', 0, 'testProfileItem'],
    }],
    
    
    profilesAPI:
    [{
        func: 'createProfile',
        args: ['character', 'testCharacter'],
    },
    {
        func: 'createProfileItem',
        args: ['character', 'testProfileItem', 'text', 0],
        forInconsistency: true,
    },
    {
        func: 'updateProfileField',
        args: ['character', 'testCharacter', 'testProfileItem', 'text', 'test updateProfileField'],
    },
    {
        func: 'renameProfileItem',
        args: ['character', 'testProfileItem2', 'testProfileItem'],
        forInconsistency: true,
    },
    {
        func: 'changeProfileItemType',
        args: ['character', 'testProfileItem2', 'enum'],
        forInconsistency: true,
    },
    {
        func: 'updateDefaultValue',
        args: ['character', 'testProfileItem2', 'test1,test2,test3'],
        forInconsistency: true,
    },
    {
        func: 'changeProfileItemType',
        args: ['character', 'testProfileItem2', 'multiEnum'],
        forInconsistency: true,
    },
    {
        func: 'updateDefaultValue',
        args: ['character', 'testProfileItem2', 'test1,test2,test3'],
        forInconsistency: true,
    },
    {
        func: 'updateProfileField',
        args: ['character', 'testCharacter', 'testProfileItem2', 'multiEnum', 'test1'],
    },
    {
        func: 'updateDefaultValue',
        args: ['character', 'testProfileItem2', 'test2,test3'],
        forInconsistency: true,
    },
    {
        func: 'removeProfileItem',
        args: ['character', 0, 'testProfileItem2'],
        forInconsistency: true,
    },
    {
        func: 'renameProfile',
        args: ['character', 'testCharacter', 'testCharacter2'],
    },
    {
        func: 'removeProfile',
        args: ['character', 'testCharacter2'],
    }],
    relationsAPI:
    [{
        func: 'createProfile',
        args: ['character', 'testCharacter'],
    },
    {
        func: 'createProfile',
        args: ['character', 'testCharacter2'],
    },
    {
        func: 'createCharacterRelation',
        args: ['testCharacter', 'testCharacter2'],
        forInconsistency: true,
    },
    {
        func: 'getCharacterRelation',
        args: ['testCharacter', 'testCharacter2'],
        gettable: true,
    },
    {
        func: 'getCharacterRelation',
        args: ['testCharacter2', 'testCharacter'],
        gettable: true,
    },
    {
        func: 'setCharacterRelationText',
        args: ['testCharacter', 'testCharacter2', 'testCharacter', 'setCharacterRelationText check'],
    },
    {
        func: 'setCharacterRelationText',
        args: ['testCharacter', 'testCharacter2', 'testCharacter2', 'setCharacterRelationText check 2'],
    },
    {
        func: 'setRelationReadyStatus',
        args: ['testCharacter', 'testCharacter2', 'testCharacter', true],
    },
    {
        func: 'setRelationReadyStatus',
        args: ['testCharacter2', 'testCharacter', 'testCharacter2', true],
    },
    {
        func: 'setRelationEssenceStatus',
        args: ['testCharacter', 'testCharacter2', 'allies', true],
    },
    {
        func: 'setOriginRelationText',
        args: ['testCharacter', 'testCharacter2', 'setOriginRelationText check'],
    },
    {
        func: 'setOriginRelationText',
        args: ['testCharacter2', 'testCharacter', 'setOriginRelationText check 2'],
    },
    {
        func: 'removeCharacterRelation',
        args: ['testCharacter2', 'testCharacter'],
    },
    {
        func: 'createCharacterRelation',
        args: ['testCharacter', 'testCharacter2'],
    },
    {
        func: 'renameProfile',
        args: ['character', 'testCharacter', 'testCharacter3'],
        forInconsistency: true,
    },
    {
        func: 'renameProfile',
        args: ['character', 'testCharacter2', 'testCharacter4'],
        forInconsistency: true,
    },
    {
        func: 'removeProfile',
        args: ['character', 'testCharacter3'],
        forInconsistency: true,
    },
    {
        func: 'removeProfile',
        args: ['character', 'testCharacter4'],
        forInconsistency: true,
    }],

    storyAdaptationsAPI:
    [{
        func: 'createStory',
        args: ['testStory'],
    },
    {
        func: 'createProfile',
        args: ['character', 'testCharacter'],
    },
    {
        func: 'addStoryCharacter',
        args: ['testStory', 'testCharacter'],
    },
    {
        func: 'createEvent',
        args: ['testStory', 'testEventName', 0],
    },
    {
        func: 'addCharacterToEvent',
        args: ['testStory', 0, 'testCharacter'],
    },
    {
        func: 'setEventAdaptationProperty',
        args: ['testStory', 0, 'testCharacter', 'text', 'test setEventAdaptationProperty'],
    },
    {
        func: 'removeProfile',
        args: ['character', 'testCharacter'],
    },
    {
        func: 'removeStory',
        args: ['testStory'],
    }],

    storyBaseAPI:
    [{
        func: 'createStory',
        args: ['testStory'],
    },
    {
        func: 'renameStory',
        args: ['testStory', 'testStory2'],
    },
    {
        func: 'setWriterStory',
        args: ['testStory2', 'setWriterStory test'],
    },
    {
        func: 'removeStory',
        args: ['testStory2'],
    }],

    storyCharactersAPI:
    [{
        func: 'createStory',
        args: ['testStory'],
    },
    {
        func: 'createProfile',
        args: ['character', 'testCharacter'],
    },
    {
        func: 'createProfile',
        args: ['character', 'testCharacter2'],
    },
    {
        func: 'addStoryCharacter',
        args: ['testStory', 'testCharacter'],
    },
    {
        func: 'switchStoryCharacters',
        args: ['testStory', 'testCharacter', 'testCharacter2'],
    },
    {
        func: 'updateCharacterInventory',
        args: ['testStory', 'testCharacter2', 'updateCharacterInventory test'],
    },
    {
        func: 'createEvent',
        args: ['testStory', 'testEventName', 0],
    },
    {
        func: 'addStoryCharacter',
        args: ['testStory', 'testCharacter'],
    },
    {
        func: 'addCharacterToEvent',
        args: ['testStory', 0, 'testCharacter'],
    },
    {
        func: 'addCharacterToEvent',
        args: ['testStory', 0, 'testCharacter2'],
    },
    {
        func: 'renameProfile',
        args: ['character', 'testCharacter2', 'testCharacter3'],
        forInconsistency: true,
    },
    {
        func: 'removeCharacterFromEvent',
        args: ['testStory', 0, 'testCharacter3'],
    },
    {
        func: 'onChangeCharacterActivity',
        args: ['testStory', 'testCharacter3', 'active', true],
    },
    {
        func: 'removeStoryCharacter',
        args: ['testStory', 'testCharacter3'],
    },
    {
        func: 'removeProfile',
        args: ['character', 'testCharacter'],
        forInconsistency: true,
    },
    {
        func: 'removeProfile',
        args: ['character', 'testCharacter3'],
    },
    {
        func: 'removeStory',
        args: ['testStory'],
    }],

    storyEventsAPI:
    [{
        func: 'createStory',
        args: ['testStory'],
    },
    {
        func: 'createEvent',
        args: ['testStory', 'testEventName', 0],
    },
    {
        func: 'createEvent',
        args: ['testStory', 'testEventName2', 1],
    },
    {
        func: 'moveEvent',
        args: ['testStory', 0, 2],
    },
    {
        func: 'cloneEvent',
        args: ['testStory', 0],
    },
    {
        func: 'mergeEvents',
        args: ['testStory', 0],
    },
    {
        func: 'removeEvent',
        args: ['testStory', 0],
    },
    {
        func: 'setEventOriginProperty',
        args: ['testStory', 0, 'name', 'test setEventOriginProperty'],
    },
    {
        func: 'removeStory',
        args: ['testStory'],
    }],
    gearsAPI:
    [{
        func: 'setGearsPhysicsEnabled',
        args: [true],
    },
    {
        func: 'setGearsShowNotesEnabled',
        args: [true],
    },
    {
        func: 'setGearsData',
        args: [{"nodes":[{"id":"e5c1e43e-79c1-4aef-88b9-61e622e3eb6d","x":85,"y":-20,"label":"123\n\n2","name":"123","group":"1","notes":"2","shape":"box"},{"id":"698903f4-ac21-4fd1-abeb-de688cf8b463","x":-353,"y":-7,"label":"234\n\n345","name":"234","group":"2","notes":"345","shape":"box"}],"edges":[{"from":"698903f4-ac21-4fd1-abeb-de688cf8b463","to":"e5c1e43e-79c1-4aef-88b9-61e622e3eb6d","arrows":"to","id":"4be956c5-0d6b-4e7e-8be8-9e23dc0fe0fb","label":"2233"}]}],
    }],
    slidersAPI:
    [
    //     {
    //     func: 'createSlider',
    //     args: ['name1', 'top1', 'bottom1'],
    // },
    // {
    //     func: 'createSlider',
    //     args: ['name1', 'top1', 'bottom1'],
    // },
    // {
    //     func: 'updateSliderNaming',
    //     args: [2, 'name3', 'top3', 'bottom3'],
    // },
    // {
    //     func: 'updateSliderValue',
    //     args: [2, 5],
    // },
    // {
    //     func: 'updateSliderValue',
    //     args: [2, 10],
    // },
    // {
    //     func: 'updateSliderValue',
    //     args: [2, -10],
    // },
    // {
    //     func: 'updateSliderValue',
    //     args: [2, 0],
    // },
    // {
    //     func: 'moveSlider',
    //     args: [2, 3],
    // },
    // {
    //     func: 'removeSlider',
    //     args: [2],
    // },
    // {
    //     func: 'removeSlider',
    //     args: [2],
    // }
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
            if(Array.isArray(check.args)){
                it(check.name, (done) => {
                    DBMS[check.func](...check.args.concat((err) => {
                        expect(err).toBeNull();
                        done();
                    }));
                });
            } else {
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
                    //done();
                    
                    
                    // .concat((err) => {
                    //     expect(err).toBeNull();
                    //     done();
                    // }));
                });
            }
        });
    });
    
    // describe(`${apiName} promise getter tests`, () => {
    //     jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    //     checks.forEach((check) => {
    //         it(check.name, (done) => {
    //             DBMS[check.func + 'Pm'](...check.args).then((value) => {
    //                 expect(value).not.toBeNull();
    //                 done();
    //             }).catch(function(err){
    //                 expect(err).toBeNull();
    //                 done();
    //             });
    //         });
    //     });
    // });
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
            if(Array.isArray(check.args)){
                it(check.name, (done) => {
                    DBMS[check.func](...check.args.concat((err) => {
                        if (err) console.error(err);
                        if (check.gettable === true) {
                            expect(err).toBeNull();
                        } else {
                            expect(err).toBeUndefined();
                        }
                        if (check.forInconsistency === true) {
                            DBMS.getConsistencyCheckResult((err2, checkResult) => {
                                expect(err2).toBeNull();
                                if (checkResult.errors.length > 0) {
                                    console.error(check.name);
                                    checkResult.errors.forEach(console.error);
                                }
                                expect(checkResult.errors.length > 0).toBe(false);
                            });
                        }
                        done();
                    }));
                });
            } else {
                it(check.name, (done) => {
                    DBMS[check.func](check.args).then( res => {
                        // expect(res).toBeNull();
                        // if (check.gettable === true) {
                        //     expect(err).toBeNull();
                        // } else {
                        //     expect(err).toBeUndefined();
                        // }
                        if (check.forInconsistency === true) {
                            DBMS.getConsistencyCheckResult((err2, checkResult) => {
                                expect(err2).toBeNull();
                                if (checkResult.errors.length > 0) {
                                    console.error(check.name);
                                    checkResult.errors.forEach(console.error);
                                }
                                expect(checkResult.errors.length > 0).toBe(false);
                            });
                        }
                        if (check.gettable === true) {
                            expect(res).not.toBeNull();
                        } else {
                            // expect(err).toBeUndefined();
                            // if we are here then function is okay
                            expect({k:2}).not.toBeNull()
                        }
                        // expect(res).not.toBeNull();
                        done();
                    }).catch(err => {
                        if (err) console.error(err);
                        expect(err).toBeNull();
                        done();
                    });
                    // DBMS[check.func](...check.args.concat((err) => {
                    //     if (err) console.error(err);
                        // if (check.gettable === true) {
                        //     expect(err).toBeNull();
                        // } else {
                        //     expect(err).toBeUndefined();
                        // }
                        // if (check.forInconsistency === true) {
                        //     DBMS.getConsistencyCheckResult((err2, checkResult) => {
                        //         expect(err2).toBeNull();
                        //         if (checkResult.errors.length > 0) {
                        //             console.error(check.name);
                        //             checkResult.errors.forEach(console.error);
                        //         }
                        //         expect(checkResult.errors.length > 0).toBe(false);
                        //     });
                        // }
                    //     done();
                    // }));
                });
            }
        });
    });
    
    // describe(`${apiName} promise setter tests`, () => {
    //     jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    //     checks.forEach((check) => {
    //         it(check.name, (done) => {
    //             DBMS[check.func + 'Pm'](...check.args).then((value) => {
    //                 if (check.gettable === true) {
    //                     expect(value).not.toBeNull();
    //                 } else {
    //                     expect(value).toBeUndefined();
    //                 }
    //                 done();
    //             }).catch((err) => {
    //                 if (err) console.error(err);
    //                 if (check.gettable === true) {
    //                     expect(err).toBeNull();
    //                 } else {
    //                     expect(err).toBeUndefined();
    //                 }
    //                 if (check.forInconsistency === true) {
    //                     DBMS.getConsistencyCheckResultPm.then(checkResult => {
    //                         if (checkResult.errors.length > 0) {
    //                             console.error(check.name);
    //                             checkResult.errors.forEach(console.error);
    //                         }
    //                         expect(checkResult.errors.length > 0).toBe(false);
    //                     }).catch(err2 => {
    //                         expect(err2).toBeNull();
    //                     });
    //                 }
    //                 done();
    //             });
    //         });
    //     });
    // });
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

        const allFuncs = Object.keys(Object.getPrototypeOf(DBMS)).filter(R.pipe(R.endsWith('Pm'), R.not));
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
