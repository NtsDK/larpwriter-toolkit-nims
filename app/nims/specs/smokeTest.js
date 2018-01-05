describe('smokeTest', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    let getChecks = [
    // baseAPI
        {
            func: 'getMetaInfo',
            args: [],
        }, {
            func: 'getDatabase',
            args: [],
        },
        // briefingExportAPI
        {
            func: 'getBriefingData',
            args: [null, null, false],
        },
        // consistencyCheckAPI
        {
            func: 'getConsistencyCheckResult',
            args: [],
        },
        // entityAPI
        {
            func: 'getEntityNamesArray',
            args: ['character'],
        },
        // groupsAPI
        {
            func: 'getGroupNamesArray',
            args: [],
        },
        {
            func: 'getAllCharacterGroupTexts',
            args: [],
        },
        {
            func: 'getProfileFilterInfo',
            args: [],
        },
        {
            func: 'getGroupCharacterSets',
            args: [],
        },
        {
            func: 'getGroup',
            args: ['Эльфы'],
        },
        {
            func: 'getCharacterGroupTexts',
            args: ['Арагорн'],
        },
        // groupSchemaAPI
        {
            func: 'getGroupSchemas',
            args: [],
        },
        // investigationBoardAPI
        {
            func: 'getInvestigationBoardData',
            args: [],
        },
        // logAPI
        {
            func: 'getLog',
            args: [0, {}],
        },
        // profileBindingAPI
        {
            func: 'getProfileBindings',
            args: [],
        },
        {
            func: 'getExtendedProfileBindings',
            args: [],
        },
        {
            func: 'getProfileBinding',
            args: ['character', 'Арагорн'],
        },
        // profileConfigurerAPI
        {
            func: 'getProfileStructure',
            args: ['character'],
        },
        // profilesAPI
        {
            func: 'getProfileNamesArray',
            args: ['character'],
        },
        {
            func: 'getProfile',
            args: ['character', 'Арагорн'],
        },
        {
            func: 'getAllProfiles',
            args: ['character'],
        },
        // relationsAPI
        {
            func: 'getRelationsSummary',
            args: ['Арагорн'],
        },
        // statisticsAPI
        {
            func: 'getStatistics',
            args: [],
        },
        // storyAdaptationsAPI
        {
            func: 'getFilteredStoryNames',
            args: [true],
        },
        {
            func: 'getStory',
            args: ['Начало пути'],
        },
        // storyBaseAPI
        {
            func: 'getStoryNamesArray',
            args: [],
        },
        {
            func: 'getAllStories',
            args: [],
        },
        {
            func: 'getMasterStory',
            args: ['Начало пути'],
        },
        // storyCharactersAPI
        {
            func: 'getStoryCharacterNamesArray',
            args: ['Начало пути'],
        },
        {
            func: 'getStoryCharacters',
            args: ['Начало пути'],
        },
        // storyEventsAPI
        {
            func: 'getStoryEvents',
            args: ['Начало пути'],
        },
        // storyViewAPI
        {
            func: 'getAllInventoryLists',
            args: ['Арагорн'],
        },
        {
            func: 'getCharacterEventGroupsByStory',
            args: ['Арагорн'],
        },
        {
            func: 'getCharacterEventsByTime',
            args: ['Арагорн'],
        },
        {
            func: 'getEventsTimeInfo',
            args: [],
        },
        {
            func: 'getCharactersSummary',
            args: [],
        },
        {
            func: 'getCharacterReport',
            args: ['Арагорн'],
        },
        // textSearchAPI
        {
            func: 'getTexts',
            args: ['Арагорн', ['masterStory'], false],
        },
    ];

    getChecks = getChecks.map((el) => {
        const args = JSON.stringify(el.args);
        el.name = `${el.func}(${args.substring(1, args.length - 1)}) -> ok`;
        return el;
    });

    getChecks.forEach((check) => {
        it(check.name, (done) => {
            DBMS[check.func](...check.args.concat((err) => {
                expect(err).toBeNull();
                done();
            }));
        });
    });

    let setChecks = [
        // baseAPI
        {
            func: 'setMetaInfo',
            args: ['name', '123'],
        },
        // groupsAPI
        {
            func: 'createGroup',
            args: ['testGroup'],
        },
        {
            func: 'renameGroup',
            args: ['testGroup', 'testGroup2'],
        },
        {
            func: 'saveFilterToGroup',
            args: ['testGroup2', []],
        },
        {
            func: 'updateGroupField',
            args: ['testGroup2', 'masterDescription', '654654654'],
        },
        {
            func: 'removeGroup',
            args: ['testGroup2'],
        },
        // investigationBoardAPI
        {
            func: 'createGroup',
            args: ['testGroup'],
        },
        {
            func: 'createGroup',
            args: ['testGroup2'],
        },
        {
            func: 'addBoardGroup',
            args: ['testGroup'],
        },
        {
            func: 'switchGroups',
            args: ['testGroup', 'testGroup2'],
        },
        {
            func: 'addBoardGroup',
            args: ['testGroup'],
        },
        {
            func: 'setGroupNotes',
            args: ['testGroup2', '223322'],
        },
        {
            func: 'createResource',
            args: ['testResource'],
        },
        {
            func: 'renameResource',
            args: ['testResource', 'testResource2'],
        },
        {
            func: 'addEdge',
            args: ['group-testGroup2', 'resource-testResource2'],
        },
        {
            func: 'addEdge',
            args: ['group-testGroup2', 'group-testGroup'],
        },
        {
            func: 'setEdgeLabel',
            args: ['group-testGroup2', 'resource-testResource2', '223322'],
        },
        {
            func: 'removeEdge',
            args: ['group-testGroup2', 'resource-testResource2'],
        },
        {
            func: 'removeResource',
            args: ['testResource2'],
        },
        {
            func: 'removeBoardGroup',
            args: ['testGroup2'],
        },
        {
            func: 'removeGroup',
            args: ['testGroup'],
        },
        {
            func: 'removeGroup',
            args: ['testGroup2'],
        },
        // profileBindingAPI
        {
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
            func: 'removeProfile',
            args: ['character', 'testCharacter'],
        },
        {
            func: 'removeProfile',
            args: ['player', 'testPlayer'],
        },
        // profileConfigurerAPI
        {
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
            func: 'updateDefaultValue',
            args: ['character', 'testProfileItem2', '223322'],
        },
        {
            func: 'removeProfileItem',
            args: ['character', 0, 'testProfileItem2'],
        },
        // profilesAPI
        {
            func: 'createProfile',
            args: ['character', 'testCharacter'],
        },
        {
            func: 'createProfileItem',
            args: ['character', 'testProfileItem', 'text', 0],
        },
        {
            func: 'updateProfileField',
            args: ['character', 'testCharacter', 'testProfileItem', 'text', 'test updateProfileField'],
        },
        {
            func: 'removeProfileItem',
            args: ['character', 0, 'testProfileItem'],
        },
        {
            func: 'renameProfile',
            args: ['character', 'testCharacter', 'testCharacter2'],
        },
        {
            func: 'removeProfile',
            args: ['character', 'testCharacter2'],
        },
        // relationsAPI
        {
            func: 'createProfile',
            args: ['character', 'testCharacter'],
        },
        {
            func: 'createProfile',
            args: ['character', 'testCharacter2'],
        },
        {
            func: 'setCharacterRelation',
            args: ['testCharacter', 'testCharacter2', 'testCharacterRelation'],
        },
        {
            func: 'setCharacterRelation',
            args: ['testCharacter', 'testCharacter2', ''],
        },
        {
            func: 'removeProfile',
            args: ['character', 'testCharacter'],
        },
        {
            func: 'removeProfile',
            args: ['character', 'testCharacter2'],
        },

        // storyAdaptationsAPI
        {
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
            args: ['testStory', 'testEventName', 'testEventText', 0],
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
        },

        // storyBaseAPI
        {
            func: 'createStory',
            args: ['testStory'],
        },
        {
            func: 'renameStory',
            args: ['testStory', 'testStory2'],
        },
        {
            func: 'setMasterStory',
            args: ['testStory2', 'setMasterStory test'],
        },
        {
            func: 'removeStory',
            args: ['testStory2'],
        },

        // storyEventsAPI
        {
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
            args: ['testStory', 'testEventName', 'testEventText', 0],
        },
        {
            func: 'addCharacterToEvent',
            args: ['testStory', 0, 'testCharacter2'],
        },
        {
            func: 'removeCharacterFromEvent',
            args: ['testStory', 0, 'testCharacter2'],
        },
        {
            func: 'onChangeCharacterActivity',
            args: ['testStory', 'testCharacter2', 'active', true],
        },
        {
            func: 'removeStoryCharacter',
            args: ['testStory', 'testCharacter2'],
        },
        {
            func: 'removeProfile',
            args: ['character', 'testCharacter'],
        },
        {
            func: 'removeProfile',
            args: ['character', 'testCharacter2'],
        },
        {
            func: 'removeStory',
            args: ['testStory'],
        },

        // storyEventsAPI
        {
            func: 'createStory',
            args: ['testStory'],
        },
        {
            func: 'createEvent',
            args: ['testStory', 'testEventName', 'testEventText', 0],
        },
        {
            func: 'createEvent',
            args: ['testStory', 'testEventName2', 'testEventText2', 1],
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
        },

    ];

    setChecks = setChecks.map((el) => {
        const args = JSON.stringify(el.args);
        el.name = `${el.func}(${args.substring(1, args.length - 1)}) -> ok`;
        return el;
    });

    setChecks.forEach((check) => {
        it(check.name, (done) => {
            DBMS[check.func](...check.args.concat((err) => {
                expect(err).toBeUndefined();
                //                DBMS.getConsistencyCheckResult((err, consistencyErrors) => {
                //                    expect(err).toBeNull();
                //                    expect(consistencyErrors.length > 0).toBe(false);
                //                });
                done();
            }));
        });
    });
});
