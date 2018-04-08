if (MODE === 'NIMS_Server') {
    describe('serverSmokeTest', () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        let getChecks = [
            // accessManagerAPI
            {
                func: 'getManagementInfo',
                args: [],
            }, {
                func: 'getPlayerLoginsArray',
                args: [],
            }, {
                func: 'getWelcomeText',
                args: [],
            }, {
                func: 'getPlayersOptions',
                args: [],
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

        // requires player login so it is not checked
        //      182: LocalDBMS.prototype.getPlayerProfileInfo = function (callback) {
        //      186: LocalDBMS.prototype.createCharacterByPlayer = function (characterName, callback) {
        // not checked
        //      39: LocalDBMS.prototype.assignAdmin = function (name, callback) {
        //      166: LocalDBMS.prototype.publishPermissionsUpdate = function (callback) {

        let setChecks = [
            // accessManagerAPI
            {
                func: 'assignEditor',
                args: ['admin'],
            },
            {
                func: 'removeEditor',
                args: [],
            },
            {
                func: 'changeAdaptationRightsMode',
                args: ['ByCharacter'],
            },
            {
                func: 'createPlayer',
                args: ['testPlayer1', '2233'],
            },
            {
                func: 'createProfile',
                args: ['player', 'testPlayer2'],
            },
            {
                func: 'createPlayerLogin',
                args: ['testPlayer2', '3322'],
            },
            {
                func: 'changePlayerPassword',
                args: ['testPlayer2', '33224455'],
            },
            {
                func: 'createMaster',
                args: ['master1', '654654'],
            },
            {
                func: 'changeMasterPassword',
                args: ['master1', '987987'],
            },
            {
                func: 'assignPermission',
                args: ['master1', {
                    characters: [], stories: [], groups: [], players: ['testPlayer1']
                }],
            },
            {
                func: 'removePermission',
                args: ['master1', {
                    characters: [], stories: [], groups: [], players: ['testPlayer1']
                }],
            },
            {
                func: 'assignPermission',
                args: ['admin', {
                    characters: [], stories: [], groups: [], players: ['testPlayer1']
                }],
            },
            {
                func: 'removeMaster',
                args: ['master1'],
            },
            {
                func: 'removePlayerLogin',
                args: ['testPlayer2'],
            },
            {
                func: 'removeProfile',
                args: ['player', 'testPlayer2'],
            },
            {
                func: 'removeProfile',
                args: ['player', 'testPlayer1'],
            },
            {
                func: 'setWelcomeText',
                args: ['78787658765'],
            },
            {
                func: 'setPlayerOption',
                args: ['allowCharacterCreation', true]
            },
            {
                func: 'setPlayerOption',
                args: ['allowCharacterCreation', false]
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
                    DBMS.getConsistencyCheckResult((err2, checkResult) => {
                        expect(err2).toBeNull();
                        expect(checkResult.errors.length > 0).toBe(false);
                    });
                    done();
                }));
            });
        });

        /* assignAdmin is not tested because if I test it will change admin and then I need to reconnect,
        restore admin than connect back... So it is too hard for simple smoke test.
        publishPermissionsUpdate is a function for server side. It is used to notify all current server users about
        entity management changes.
        createCharacterByPlayer and getPlayerProfileInfo are for player login so similar problem with open/close
        session in assignAdmin case.
        */
        const customIgnore = ['assignAdmin', 'publishPermissionsUpdate', 'createCharacterByPlayer', 'getPlayerProfileInfo'];

        it('Core smoke test coverage check', () => {
            const funcArr = R.uniq(R.concat(getChecks.map(R.prop('func')), setChecks.map(R.prop('func'))));
            const { serverSpecificFunctions, commonIgnoreList } = Constants;

            const sum = [funcArr, commonIgnoreList, customIgnore].reduce((acc, el) => {
                acc = R.concat(acc, el);
                return acc;
            }, []);
            const diff = R.difference(serverSpecificFunctions, sum);
            if (diff.length > 0) {
                console.log(diff);
            }
            expect(diff.length).toBe(0);
        });
    });
}
