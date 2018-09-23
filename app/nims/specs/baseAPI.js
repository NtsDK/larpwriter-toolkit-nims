describe('baseAPI', () => {
    let oldBase;

    beforeAll((done) => {
        DBMS.getDatabase().then(data => {
            oldBase = data;
            DBMS.setDatabase(CommonUtils.clone(EmptyBase.data), (err2, data2) => {
                if (err2) { throw err2; }
                //                PageManager.refresh();
                done();
            });
        }).catch(err => {
            throw err;
        });
    });

    afterAll((done) => {
        DBMS.setDatabase(oldBase, (err, data) => {
            if (err) { throw err; }
            //            PageManager.refresh();
            done();
        });
    });

    const funcs = [ 'getMetaInfo'];

    funcs.forEach((func) => {
        it(func, (done) => {
            DBMS[func]((err, data) => {
                expect(err).toBeNull();
                expect(data).not.toBeNull();
                done();
            });
        });
    });
    const funcs2 = ['getDatabase'];

    funcs2.forEach((func) => {
        it(func, (done) => {
            DBMS[func]().then(data => {
                expect(data).not.toBeNull();
                done();
            }).catch(err => {
                expect(err).toBeNull();
                done();
            });
        });
    });

    it('setDatabase(emptyBase) -> ok', (done) => {
        DBMS.setDatabase(CommonUtils.clone(EmptyBase.data), (err) => {
            expect(err).toBeUndefined();
            done();
        });
    });
    it('setDatabase({}) -> err', (done) => {
        DBMS.setDatabase({}, (err) => {
            expect(err).not.toBeNull();
            done();
        });
    });

    //  'name', 'date', 'preGameDate', 'description'
    const setChecks = [{
        func: 'setMetaInfoString',
        args: ['name', '123'],
        getter: 'getMetaInfo',
        getterArgs: [],
        getterCheck: (data, done) => {
            expect(data.name).toEqual('123');
            done();
        }
    }, {
        func: 'setMetaInfoDate',
        args: ['date', '123'],
        getter: 'getMetaInfo',
        getterArgs: [],
        getterCheck: (data, done) => {
            expect(data.date).toEqual('123');
            done();
        }
    }, {
        func: 'setMetaInfoDate',
        args: ['preGameDate', '123'],
        getter: 'getMetaInfo',
        getterArgs: [],
        getterCheck: (data, done) => {
            expect(data.preGameDate).toEqual('123');
            done();
        }
    }, {
        func: 'setMetaInfoString',
        args: ['description', '123'],
        getter: 'getMetaInfo',
        getterArgs: [],
        getterCheck: (data, done) => {
            expect(data.description).toEqual('123');
            done();
        }
    }, {
        func: 'setMetaInfoString',
        args: [654, '123'],
        errMessageId: 'errors-argument-is-not-a-string',
        errParameters: [654]
    }, {
        func: 'setMetaInfoString',
        args: ['65465654', '123'],
        errMessageId: 'errors-unsupported-type-in-list',
        errParameters: ['65465654']
    }, {
        func: 'setMetaInfoString',
        args: ['description', 123],
        errMessageId: 'errors-argument-is-not-a-string',
        errParameters: [123]
    }];

    const checks = R.groupBy(el => (el.errMessageId !== undefined ? 'errChecks' : 'okChecks'), setChecks);

    checks.okChecks = checks.okChecks.map((el) => {
        const args = JSON.stringify(el.args);
        el.name = `${el.func}(${args.substring(1, args.length - 1)}) -> ok`;
        return el;
    });

    checks.errChecks = checks.errChecks.map((el) => {
        const args = JSON.stringify(el.args);
        el.name = `${el.func}(${args.substring(1, args.length - 1)}) -> `;
        el.name += `${el.errMessageId}, ${JSON.stringify(el.errParameters)}`;
        return el;
    });

    checks.okChecks.forEach((check) => {
        it(check.name, (done) => {
            DBMS[check.func](...check.args.concat((err) => {
                expect(err).toBeUndefined();
                DBMS[check.getter](...check.getterArgs.concat((err2, data) => {
                    expect(err2).toBeNull();
                    check.getterCheck(data, done);
                    //                    done();
                }));
            }));
        });
    });

    checks.errChecks.forEach((check) => {
        it(check.name, (done) => {
            DBMS[check.func](...check.args.concat((err) => {
                expect(err).not.toBeUndefined();
                expect(err.messageId).toEqual(check.errMessageId);
                expect(err.parameters).toEqual(check.errParameters);
                done();
            }));
        });
    });
});


//describe("LocalDBMS", function(){
//    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
//    it("обновит мета информацию об игре", function(done){
//        DBMS.setMetaInfo("name", "Разные сказки3", function(){
//            DBMS.getMetaInfo(function(err, info){
//                expect(info.name).toEqual("Разные сказки3");
//                done();
//            });
//        });
//    });
//
//    it("вернет profiles-profile-item-name-is-not-specified если имя поля досье пусто", function(done){
//        var type = "text";
//        DBMS.createProfileItem("", type, Constants.profileFieldTypes[type].value, true, -1, function(err, message){
//            expect(err.messageId).toEqual("profiles-profile-item-name-is-not-specified");
//            done();
//        });
//    });
//
//    it("вернет profiles-such-name-already-used если имя поля досье уже занято", function(done){
//        var type = "text";
//        DBMS.createProfileItem("Игрок", type, Constants.profileFieldTypes[type].value, true, -1,
//function(err, message){
//            expect(err.messageId).toEqual("profiles-such-name-already-used");
//            done();
//        });
//    });
//
//    it("вернет profiles-profile-item-name-cant-be-name если имя поля досье равно name", function(done){
//        var type = "text";
//        DBMS.createProfileItem("name", type, Constants.profileFieldTypes[type].value, true, -1,
//function(err, message){
//            expect(err.messageId).toEqual("profiles-profile-item-name-cant-be-name");
//            done();
//        });
//    });
//
//    it("вернет profiles-such-name-already-used если имя поля досье уже занято", function(done){
//        DBMS.renameProfileItem('Пол', "Игрок", function(err, message){
//            expect(err.messageId).toEqual("profiles-such-name-already-used");
//            done();
//        });
//    });
//
//    it("вернет profiles-not-a-number при попытке ввода не числа в числовое поле", function(done){
//        DBMS.updateDefaultValue('Возраст', "Игрок", function(err, message){
//            expect(err.messageId).toEqual("profiles-not-a-number");
//            done();
//        });
//    });
//    it("вернет profiles-enum-item-cant-be-empty при попытке очистки перечислимого поля", function(done){
//        DBMS.updateDefaultValue('Пол', "", function(err, message){
//            expect(err.messageId).toEqual("profiles-enum-item-cant-be-empty");
//            done();
//        });
//    });
//    it("вернет stories-story-name-is-not-specified при попытке создания истории без имени", function(done){
//        DBMS.createStory('', function(err, message){
//            expect(err.messageId).toEqual("stories-story-name-is-not-specified");
//            done();
//        });
//    });
//    it("вернет stories-story-name-already-used при попытке создания истории с занятым именем", function(done){
//        DBMS.createStory('Репка', function(err, message){
//            expect(err.messageId).toEqual("stories-story-name-already-used");
//            expect(err.parameters[0]).toEqual("Репка");
//            done();
//        });
//    });
//    it("вернет stories-story-name-is-not-specified при попытке переименования в историю с пустым именем",
//function(done){
//        DBMS.renameStory('Репка', '', function(err, message){
//            expect(err.messageId).toEqual("stories-story-name-is-not-specified");
//            done();
//        });
//    });
//    it("вернет stories-names-are-the-same когда имена историй при переименовании совпадают", function(done){
//        DBMS.renameStory('Репка', 'Репка', function(err, message){
//            expect(err.messageId).toEqual("stories-names-are-the-same");
//            done();
//        });
//    });
//    it("вернет stories-story-name-already-used когда новое имя истории для переименования занято", function(done){
//        DBMS.renameStory('Репка', 'Колобок', function(err, message){
//            expect(err.messageId).toEqual("stories-story-name-already-used");
//            expect(err.parameters[0]).toEqual("Колобок");
//            done();
//        });
//    });
//
//    it("вернет stories-character-name-is-not-specified когда в историю добавляется персонаж без имени",
//function(done){
//        DBMS.addStoryCharacter('Репка', '', function(err, message){
//            expect(err.messageId).toEqual("stories-character-name-is-not-specified");
//            done();
//        });
//    });
//    it(
//"вернет stories-one-of-switch-characters-is-not-specified когда при замене персонажа в истории имя первого не указано"
//, function(done){
//        DBMS.switchStoryCharacters('Репка', '', 'Колобок', function(err, message){
//            expect(err.messageId).toEqual("stories-one-of-switch-characters-is-not-specified");
//            done();
//        });
//    });
//    it(
//"вернет stories-one-of-switch-characters-is-not-specified когда при замене персонажа в истории имя второго не указано"
//, function(done){
//        DBMS.switchStoryCharacters('Репка', 'Колобок', '', function(err, message){
//            expect(err.messageId).toEqual("stories-one-of-switch-characters-is-not-specified");
//            done();
//        });
//    });
//    it("вернет stories-character-name-is-not-specified когда не указано имя персонажа для удаления из истории",
//function(done){
//        DBMS.removeStoryCharacter('Репка', '', function(err, message){
//            expect(err.messageId).toEqual("stories-character-name-is-not-specified");
//            done();
//        });
//    });
//    it("вернет stories-event-name-is-not-specified когда не указано название события при добавлении в историю",
//function(done){
//        DBMS.createEvent('Репка', '', '123', true, -1, function(err, message){
//            expect(err.messageId).toEqual("stories-event-name-is-not-specified");
//            done();
//        });
//    });
//    it("вернет stories-event-text-is-empty когда не указан текст события при добавлении в историю", function(done){
//        DBMS.createEvent('Репка', '123', '', true, -1, function(err, message){
//            expect(err.messageId).toEqual("stories-event-text-is-empty");
//            done();
//        });
//    });
//    it("вернет stories-cant-merge-last-event при попытке мерджа последнего события", function(done){
//        DBMS.mergeEvents('Репка', 11, function(err, message){
//            expect(err.messageId).toEqual("stories-cant-merge-last-event");
//            done();
//        });
//    });
//    it("вернет stories-event-name-is-not-specified при попытке удаления названия события", function(done){
//        DBMS.setEventOriginProperty('Репка', 0, 'name', '', function(err, message){
//            expect(err.messageId).toEqual("stories-event-name-is-not-specified");
//            done();
//        });
//    });
//    it("вернет stories-event-text-is-empty при попытке удаления текста события", function(done){
//        DBMS.setEventOriginProperty('Репка', 0, 'text', '', function(err, message){
//            expect(err.messageId).toEqual("stories-event-text-is-empty");
//            done();
//        });
//    });
//
//    it("получит данные для выгрузки только для одного персонажа", function(done){
//        DBMS.getBriefingData({'Колобок': true}, function(err, data){
//            expect(data.briefings.length).toEqual(1);
//            done();
//        });
//    });

//});
