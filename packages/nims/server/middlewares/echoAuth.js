const { HttpError } = require('../error');
//var log = require('../libs/log')(module);

module.exports = function (req, res, next) {
//    log.info('req.user: ' + JSON.stringify(req.user));
    if (req.user) {
        req.session.username = req.user.name;
    }

    next();
};
