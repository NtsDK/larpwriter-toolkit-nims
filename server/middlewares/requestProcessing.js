const url = require('url');
const { HttpError } = require('../error');
// const { db, apiDb } = require('../dbms');
const log = require('../libs/log')(module);

function stringify(jsonObj) {
    return JSON.stringify(jsonObj, null, '  ');
}

function setHeader(res) {
    res.set('Content-Type', 'application/json; charset=utf-8');
}

function startsWith(str1, str2) {
    return str1.substring(0, str2.length) === str2;
}

module.exports = ({ db, preparedDb } = {}) => {
    function onGet(req, res, next) {
        const urlParsed = url.parse(req.url, true);
        const command = urlParsed.pathname.substring(1);
        const params = urlParsed.query.params ? JSON.parse(urlParsed.query.params) : [];
        log.info(`Command: ${command}, params: ${params}`);
        params.push(req.user);
        preparedDb[command](...params).then((result) => {
            setHeader(res);
            res.end(stringify(result));
        }, next);
    }

    function onPut(req, res, next) {
        const urlParsed = url.parse(req.url, true);
        let command = urlParsed.pathname;
        const params = req.body;
        log.info(`Command: ${command}, params: ${params}`);
        command = command.substring(1);
        params.push(req.user);
        preparedDb[command](...params).then((result) => {
            setHeader(res);
            res.end();
        }, next);
    }

    return function (req, res, next) {
        const urlParsed = url.parse(req.url, true);
        const command = urlParsed.pathname.substring(1);
        log.info(`Method: ${req.method}, command: ${command}`);
        if (command === 'subscribeOnPermissionsUpdate' || command === 'getPermissionsSummary') {
            db[command](req, res, next);
            return;
        }

        switch (req.method) {
        case 'GET':
            onGet(req, res, next);
            break;
        case 'PUT':
            onPut(req, res, next);
            break;
        default:
            next();
        }
    };
};
