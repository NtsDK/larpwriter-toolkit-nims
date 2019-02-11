module.exports = function (app) {
    require('./intro')(app);
    require('./home')(app);
    require('./auth')(app);
};
