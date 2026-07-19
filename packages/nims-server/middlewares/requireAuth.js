'use strict';

/** Reject unauthenticated access to /api/* */
module.exports = function requireAuth(req, res, next) {
    if (req.user && req.user.name) {
        next();
        return;
    }
    res.status(401).json({ error: 'Unauthorized', message: 'Требуется вход в систему' });
};
