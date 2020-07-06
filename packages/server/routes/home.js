const log = require('../libs/log')(module);

module.exports = function (app) {
    app.get('/page.html', (req, res) => {
        if (!req.user) {
            res.redirect('index.html');
            return;
        }
        log.info(`Redirecting user ${req.user.name}`);
        if (req.user.role === 'organizer') {
            res.redirect('nims.html');
        } else if (req.user.role === 'player') {
            res.redirect('player.html');
        } else {
            res.redirect('index.html');
        }
    });
};
