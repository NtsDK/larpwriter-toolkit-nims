/* eslint-disable global-require */
module.exports = function (app, dbms) {
    app.use(require('./echoAuth'));
    app.use(require('./sendHttpError'));
    app.use(require('./sendValidationError'));
    app.use('/api', require('./requestProcessing')(dbms));
};
