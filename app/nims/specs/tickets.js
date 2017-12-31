//
//describe("Ticket testing", function(){
//    
//    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
//    describe("Issue #9 - Saving base doesn't work after creating new base", function(){
//        it("Save base after creating new base", function(done){
//            DBMS.setDatabase(EmptyBase.data, function(){
//                DBMS.getDatabase(function(err, database){
//                    expect(true).toBe(true);
//                    done();
//                });
//            });
//        });
//    });
//    
//    describe("Issue #8 - New base is not empty after second creation", function(){
//        it("is empty after second base creation", function(done){
//            DBMS.setDatabase(CommonUtils.clone(EmptyBase.data), function() {
//                DBMS.createProfile('char1', function(){
//                    DBMS.setDatabase(CommonUtils.clone(EmptyBase.data), function() {
//                        setTimeout(function() {
//                            DBMS.getAllProfiles('character', function(err, profiles){
//                                expect(Object.keys(profiles).length).toEqual(0);
//                                done();
//                            });
//                        });
//                    });
//                });
//            });
//        });
//    });
//    
//    describe("Issue #3 - Base corruption 'extra field displayName' in Characters and Stories", function(){
//        it("will not create 'displayName' in character", function(done){
//            DBMS.setDatabase(EmptyBase.data, function(){
//                DBMS.createProfile('char1', function(){
//                    document.querySelector('#socialNetworkButton').click();
//                    setTimeout(function() {
//                        DBMS.getProfile('character', 'char1', function(err, profile){
//                            expect(profile.displayName).not.toBeDefined();
//                            done();
//                        });
//                    }, 100);
//                });
//            });
//        });
//        it("will not create 'displayName' in story", function(done){
//            DBMS.setDatabase(EmptyBase.data, function(){
//                DBMS.createStory('story1', function(){
//                    document.querySelector('#socialNetworkButton').click();
//                    setTimeout(function() {
//                        DBMS.getAllStories(function(err, stories){
//                            expect(stories.story1.displayName).not.toBeDefined();
//                            done();
//                        });
//                    }, 100);
//                });
//            });
//        });
//    });
//});
