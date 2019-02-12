const passport = require('passport');
// const userStorage = require('../dbms').db;
const log = require('../libs/log')(module);

module.exports = function (app, dbms) {
    const userStorage = dbms.db;
    app.post('/login', passport.authenticate('local'), (req, res) => {
        res.redirect('page.html');
    });

    app.post('/logout', (req, res) => {
        log.info(`logout${req.user.name}`);
        req.logout();
        req.session.destroy();
        res.redirect('page.html');
    });

    app.post('/signUp', (req, res, next) => {
        userStorage.signUp({
            userName: req.body.username,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        }).then(() => res.end(), next);
    });
};
