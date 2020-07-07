const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const errorHandler = require('errorhandler');
const compression = require('compression');
const cors = require('cors');
const serverErrors = require('./error');

const config = require('./config');
const logModule = require('./libs/log');

const log = logModule(module);
const { HttpError } = require('./error');

const loader = require('./autosave/databaseLoader');

const lastDb = loader.loadLastDatabase();
const emptyBase = require(config.get('inits:emptyBaseModule'));

// eslint-disable-next-line import/no-dynamic-require
const apis = require(config.get('inits:apiModule'));

// const dbms = require('../dbms/core/serverDbmsFactory')({
const dbms = require('dbms-core/serverDbmsFactory')({
    projectName: config.get('inits:projectName'),
    serverSpecific: {
        enabledLogOverrides: config.get('logOverrides:enabled'),
        logOverridesObject: config.get('logOverrides:overrides'),
        enabledPlayerAccess: config.get('playerAccess:enabled'),
        adminLogin: config.get('inits:adminLogin'),
        adminPass: config.get('inits:adminPass'),
        createOrganizer: config.get('inits:createOrganizer'),
        serverErrors,
    },
    logModule,
    // lastDb,
    apis,
    isServer: true,
    proxies: [apis.permissionProxy]
});

function onSetDatabaseFinished() {
    dbms.db.getConsistencyCheckResult().then((checkResult) => {
        const consoleLog = (str) => console.error(str);
        checkResult.errors.forEach(consoleLog);
        if (checkResult.errors.length > 0) {
            log.info('overview-consistency-problem-detected');
        } else {
            log.info('Consistency check didn\'t find errors');
        }
    }, log.error);
}

if (lastDb !== null) {
    // projectAPIs.populateDatabase(lastDb);
    dbms.db.setDatabase({ database: lastDb }).then(onSetDatabaseFinished);
} else {
    log.info('init from default base');
    console.log(emptyBase.data);
    // projectAPIs.populateDatabase(emptyBase.data);
    dbms.db.setDatabase({ database: emptyBase.data }).then(onSetDatabaseFinished);
}

require('./autosave')(dbms.db);

const app = express();

const sessionOptions = config.get('session');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev', {
    immediate: true,
    format: 'dev'
}));
app.use(logger('dev', {
    format: 'dev'
}));

if (config.get('api:enabled')) {
    const corsOpts = {
        origin: true,
        credentials: true
    };

    app.use(cors(corsOpts));
    app.options('*', cors());
}
log.info(`api enabled: ${config.get('api:enabled')}`);
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

if (config.get('compression:enabled')) {
    app.use(compression());
}
log.info(`compression enabled: ${config.get('compression:enabled')}`);

require('./boot')(app, dbms);
require('./middlewares')(app, dbms);
require('./routes')(app, dbms);

// app.use(express.static(config.get('frontendPath')));
// console.log(config.get('frontendPath'));
// throw new Error(path.resolve(__dirname, config.get('frontendPath')));
app.use(express.static(path.resolve(__dirname, config.get('frontendPath'))));

app.use((err, req, res, next) => {
    console.error(`${new Date().toString()} ${err}`);
    if (typeof err === 'number') { // next(404);
        err = new HttpError(err);
    }

    if (err instanceof HttpError) {
        res.sendHttpError(err);
        //  } else if (err instanceof Errors.ValidationError) {
    } else if (err.name === 'ValidationError') {
        res.sendValidationError(err);
    } else if (app.get('env') === 'development') {
        errorHandler()(err, req, res, next);
    } else {
        log.error(err);
        err = new HttpError(500);
        res.sendHttpError(err);
    }
});

process.on('unhandledRejection', (error, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'error:', error, 'stack', error ? error.stack : error);
});

module.exports = app;
