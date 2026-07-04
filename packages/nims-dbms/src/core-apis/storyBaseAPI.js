/* eslint-disable func-names,prefer-rest-params */

((callback2) => {
  function storyBaseAPI(LocalDBMS, opts) {
    const { R, Errors, CU, PC } = opts;

    // stories, timeline
    LocalDBMS.prototype.getStoryNamesArray = function () {
      return Promise.resolve(Object.keys(this.database.Stories).sort(CU.charOrdA));
    };
    // social network
    LocalDBMS.prototype.getAllStories = function () {
      return Promise.resolve(R.clone(this.database.Stories));
    };

    //stories
    LocalDBMS.prototype.getWriterStory = function ({ storyName } = {}) {
      return new Promise((resolve, reject) => {
        PC.precondition(PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), reject, () => {
          resolve(this.database.Stories[storyName].story);
        });
      });
    };
    //stories
    LocalDBMS.prototype.setWriterStory = function ({ storyName, value } = {}) {
      return new Promise((resolve, reject) => {
        const chain = [PC.entityExistsCheck(storyName, R.keys(this.database.Stories)), PC.isString(value)];
        PC.precondition(PC.chainCheck(chain), reject, () => {
          this.database.Stories[storyName].story = value;
          resolve();
        });
      });
    };

    // stories
    LocalDBMS.prototype.createStory = function ({ storyName } = {}) {
      return new Promise((resolve, reject) => {
        PC.precondition(
          PC.createEntityCheck2(storyName, R.keys(this.database.Stories), "entity-lifeless-name", "entity-of-story"),
          reject,
          () => {
            this.database.Stories[storyName] = {
              name: storyName,
              story: "",
              characters: {},
              events: [],
            };
            this.ee.emit("createStory", arguments);
            resolve();
          }
        );
      });
    };
    // stories
    LocalDBMS.prototype.renameStory = function ({ fromName, toName } = {}) {
      return new Promise((resolve, reject) => {
        PC.precondition(PC.renameEntityCheck(fromName, toName, R.keys(this.database.Stories)), reject, () => {
          const data = this.database.Stories[fromName];
          data.name = toName;
          this.database.Stories[toName] = data;
          delete this.database.Stories[fromName];
          this.ee.emit("renameStory", arguments);
          resolve();
        });
      });
    };

    // stories
    LocalDBMS.prototype.removeStory = function ({ storyName } = {}) {
      return new Promise((resolve, reject) => {
        PC.precondition(PC.removeEntityCheck(storyName, R.keys(this.database.Stories)), reject, () => {
          delete this.database.Stories[storyName];
          this.ee.emit("removeStory", arguments);
          resolve();
        });
      });
    };
  }
  callback2(storyBaseAPI);
})((api) => (typeof exports === "undefined" ? (this.storyBaseAPI = api) : (module.exports = api)));
