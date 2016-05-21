jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

describe("Issue #9 - Saving base doesn't work after creating new base", function(){
    it("Save base after creating new base", function(done){
        DBMS.setDatabase(EmptyBase.data, function(){
            DBMS.getDatabase(function(err, database){
                expect(true).toBe(true);
                done();
            });
        });
    });
});

describe("Issue #3 - Base corruption 'extra field displayName' in Characters and Stories", function(){
    it("will not create 'displayName' in character", function(done){
        DBMS.setDatabase(EmptyBase.data, function(){
            DBMS.createCharacter('char1', function(){
                document.querySelector('#socialNetworkButton').click();
                setTimeout(function() {
                    DBMS.getProfile('char1', function(err, profile){
                        expect(profile.displayName).not.toBeDefined();
                        done();
                    });
                }, 100);
            });
        });
    });
    it("will not create 'displayName' in story", function(done){
        DBMS.setDatabase(EmptyBase.data, function(){
            DBMS.createStory('story1', function(){
                document.querySelector('#socialNetworkButton').click();
                setTimeout(function() {
                    DBMS.getAllStories(function(err, stories){
                        expect(stories.story1.displayName).not.toBeDefined();
                        done();
                    });
                }, 100);
            });
        });
    });
});