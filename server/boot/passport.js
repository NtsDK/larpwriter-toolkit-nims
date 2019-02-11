const config = require('nconf');
const passport = require('passport');
const AuthLocalStrategy = require('passport-local').Strategy;

const userStorage = require('../dbms').db;
const { AuthError } = require('../error');
const log = require('../libs/log')(module);

// passport.use('local', new AuthLocalStrategy(userStorage.login.bind(userStorage)));
passport.use('local', new AuthLocalStrategy(function (username, password, callback) {
    this.login({ username, password }).then(res => callback(null, res)).catch(callback);
}.bind(userStorage)));

passport.serializeUser((user, done) => {
    log.info(`user ${JSON.stringify(user)}`);
    done(null, JSON.stringify(user));
});

passport.deserializeUser((data, done) => {
    try {
        log.info(`user ${JSON.parse(data)}`);
        done(null, JSON.parse(data));
    } catch (err) {
        log.info(`err ${err}`);
        done(err);
    }
});

module.exports = function (app) {
};
