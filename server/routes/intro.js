module.exports = function (app) {
    app.get('*', (req, res, next) => {
        if (!req.user && (req.originalUrl === '/nims.html' || req.originalUrl === '/player.html')) {
            res.redirect('index.html');
        } else {
            next();
        }
    });
};
