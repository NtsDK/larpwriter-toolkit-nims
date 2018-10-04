if (MODE === 'NIMS_Server') {
    describe('serverSmokeTest', () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        let getChecks = [
            // accessManagerAPI
            {
                func: 'getManagementInfoNew',
                args: {},
            }, {
                func: 'getPlayerLoginsArrayNew',
                args: {},
            }, {
                func: 'getWelcomeTextNew',
                args: {},
            }, {
                func: 'getPlayersOptionsNew',
                args: {},
            },
        ];

        // getChecks = getChecks.map((el) => {
        //     const args = JSON.stringify(el.args);
        //     el.name = `${el.func}(${args.substring(1, args.length - 1)}) -> ok`;
        //     return el;
        // });

        // getChecks.forEach((check) => {
        //     it(check.name, (done) => {
        //         DBMS[check.func](...check.args.concat((err) => {
        //             expect(err).toBeNull();
        //             done();
        //         }));
        //     });
        // });

        const checks = getChecks.map((el) => {
            const args = JSON.stringify(el.args);
            el.name = `${el.func}(${args.substring(1, args.length - 1)}) -> ok`;
            return el;
        });

        // describe(`${apiName} getter tests`, () => {
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
        // });

        // requires player login so it is not checked
        //      182: LocalDBMS.prototype.getPlayerProfileInfo = function (callback) {
        //      186: LocalDBMS.prototype.createCharacterByPlayer = function (characterName, callback) {
        // not checked
        //      39: LocalDBMS.prototype.assignAdmin = function (name, callback) {
        //      166: LocalDBMS.prototype.publishPermissionsUpdate = function (callback) {

        let setChecks = [
            // accessManagerAPI
            {
                func: 'assignEditorNew',
                args: {name:'admin'},
            },
            {
                func: 'removeEditorNew',
                args: {},
            },
            {
                func: 'changeAdaptationRightsModeNew',
                args: {mode:'ByCharacter'},
            },
            {
                func: 'createPlayerNew',
                args: {userName: 'testPlayer1', password:'2233'},
            },
            {
                func: 'createProfileNew',
                args: {type: 'player', characterName: 'testPlayer2'},
            },
            {
                func: 'createPlayerLoginNew',
                args: {userName: 'testPlayer2', password: '3322'},
            },
            {
                func: 'changePlayerPasswordNew',
                args: {userName: 'testPlayer2', newPassword: '33224455'},
            },
            {
                func: 'createOrganizerNew',
                args: {name: 'Organizer1', password: '654654'},
            },
            {
                func: 'changeOrganizerPasswordNew',
                args: {userName: 'Organizer1', newPassword: '987987'},
            },
            {
                func: 'assignPermissionNew',
                args: {userName: 'Organizer1', names: {
                    characters: [], stories: [], groups: [], players: ['testPlayer1']
                }},
            },
            {
                func: 'removePermissionNew',
                args: {userName: 'Organizer1', names: {
                    characters: [], stories: [], groups: [], players: ['testPlayer1']
                }},
            },
            {
                func: 'assignPermissionNew',
                args: {userName: 'admin',names: {
                    characters: [], stories: [], groups: [], players: ['testPlayer1']
                }},
            },
            {
                func: 'removeOrganizerNew',
                args: {name: 'Organizer1'},
            },
            {
                func: 'removePlayerLoginNew',
                args: {userName: 'testPlayer2'},
            },
            {
                func: 'removeProfileNew',
                args: {type: 'player', characterName: 'testPlayer2'},
            },
            {
                func: 'removeProfileNew',
                args: {type:'player', characterName: 'testPlayer1'},
            },
            {
                func: 'setWelcomeTextNew',
                args: {text: '78787658765'},
            },
            {
                func: 'setPlayerOptionNew',
                args: {name: 'allowCharacterCreation', value: true}
            },
            {
                func: 'setPlayerOptionNew',
                args: {name: 'allowCharacterCreation', value:  false}
            },
        ];

        // setChecks = setChecks.map((el) => {
        //     const args = JSON.stringify(el.args);
        //     el.name = `${el.func}(${args.substring(1, args.length - 1)}) -> ok`;
        //     return el;
        // });

        // setChecks.forEach((check) => {
        //     it(check.name, (done) => {
        //         DBMS[check.func](...check.args.concat((err) => {
        //             expect(err).toBeUndefined();
        //             DBMS.getConsistencyCheckResult((err2, checkResult) => {
        //                 expect(err2).toBeNull();
        //                 expect(checkResult.errors.length > 0).toBe(false);
        //             });
        //             done();
        //         }));
        //     });
        // });

        const checks2 = setChecks.map((el) => {
            const args = JSON.stringify(el.args);
            el.name = `${el.func}(${args.substring(1, args.length - 1)}) -> ok`;
            return el;
        });

        // describe(`${apiName} setter tests`, () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        checks2.forEach((check) => {
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
                    // if (check.forInconsistency === true) {
                    if (true) {
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
        // });

        // /* assignAdmin is not tested because if I test it will change admin and then I need to reconnect,
        // restore admin than connect back... So it is too hard for simple smoke test.
        // publishPermissionsUpdate is a function for server side. It is used to notify all current server users about
        // entity management changes.
        // createCharacterByPlayer and getPlayerProfileInfo are for player login so similar problem with open/close
        // session in assignAdmin case.
        // */
        // const customIgnore = ['assignAdmin', 'publishPermissionsUpdate', 'createCharacterByPlayer', 'getPlayerProfileInfo'];

        // it('Core smoke test coverage check', () => {
        //     const funcArr = R.uniq(R.concat(getChecks.map(R.prop('func')), setChecks.map(R.prop('func'))));
        //     const { serverSpecificFunctions, commonIgnoreList } = Constants;

        //     const sum = [funcArr, commonIgnoreList, customIgnore].reduce((acc, el) => {
        //         acc = R.concat(acc, el);
        //         return acc;
        //     }, []);
        //     const diff = R.difference(serverSpecificFunctions, sum);
        //     if (diff.length > 0) {
        //         console.log(diff);
        //     }
        //     expect(diff.length).toBe(0);
        // });
    });
}
