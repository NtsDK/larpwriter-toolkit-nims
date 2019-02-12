/* eslint-disable global-require */
module.exports = function (app, dbms) {
    require('./intro')(app);
    require('./home')(app);
    require('./auth')(app, dbms);
};
