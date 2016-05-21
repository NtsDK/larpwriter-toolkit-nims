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