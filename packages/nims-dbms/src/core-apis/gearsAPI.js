/* eslint-disable func-names */

((callback2) => {
  function gearsAPI(LocalDBMS, opts) {
    const { R } = opts;

    // DBMS.gears.get()
    LocalDBMS.prototype.getAllGearsData = function () {
      return Promise.resolve(R.clone(this.database.Gears));
    };
    // DBMS.gears.set()
    LocalDBMS.prototype.setGearsData = function ({ data } = {}) {
      return new Promise((resolve, reject) => {
        this.database.Gears.nodes = data.nodes;
        this.database.Gears.edges = data.edges;
        resolve();
      });
    };

    // DBMS.gears.physics.set({enabled})
    LocalDBMS.prototype.setGearsPhysicsEnabled = function ({ enabled } = {}) {
      this.database.Gears.settings.physicsEnabled = enabled;
      return Promise.resolve();
    };

    // DBMS.gears.showNotes.set({enabled})
    LocalDBMS.prototype.setGearsShowNotesEnabled = function ({ enabled } = {}) {
      this.database.Gears.settings.showNotes = enabled;
      return Promise.resolve();
    };
  }

  callback2(gearsAPI);
})((api) => (typeof exports === "undefined" ? (this.gearsAPI = api) : (module.exports = api)));
