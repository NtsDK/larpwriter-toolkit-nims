const config = require('nconf');
const passport = require('passport');
const AuthLocalStrategy = require('passport-local').Strategy;

const log = require('../libs/log')(module);

async function resolveSessionUser(userStorage, parsed) {
    if (!parsed || !parsed.name) return null;
    const name = parsed.name;
    const org = await userStorage.getUser({ username: name, type: 'organizer' });
    if (org) return { name: org.name || name, role: 'organizer' };
    const player = await userStorage.getUser({ username: name, type: 'player' });
    if (player) return { name: player.name || name, role: 'player' };
    return null;
}

module.exports = function (app, dbms) {
    const userStorage = dbms.db;

    passport.use('local', new AuthLocalStrategy(function (username, password, callback) {
        this.login({ username, password })
            .then((user) => callback(null, user))
            .catch(() => callback(null, false, { message: 'Неверный логин или пароль' }));
    }.bind(userStorage)));

    passport.serializeUser((user, done) => {
        log.info(`user ${JSON.stringify(user)}`);
        done(null, JSON.stringify({ name: user.name, role: user.role }));
    });

    // Re-resolve role from DB on each request (promote/demote without waiting for logout).
    passport.deserializeUser((data, done) => {
        let parsed;
        try {
            parsed = JSON.parse(data);
        } catch (err) {
            log.info(`err ${err}`);
            done(err);
            return;
        }
        resolveSessionUser(userStorage, parsed)
            .then((user) => {
                if (!user) {
                    done(null, false);
                    return;
                }
                log.info(`user ${JSON.stringify(user)}`);
                done(null, user);
            })
            .catch((err) => done(err));
    });
};
