
module.exports = function (req, res, next) {
    res.sendValidationError = function (error) {
        res.status(400);
        if (res.req.headers['x-requested-with'] === 'XMLHttpRequest') {
            res.json(error);
        } else {
            res.send(error.message);
        }
    };

    next();
};
