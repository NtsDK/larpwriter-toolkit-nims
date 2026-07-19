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

const { createServerDbms } = require('nims-dbms');
const { wrapWithPermissions } = require('./permissions');

const emptyDatabase = emptyBase.data;
const shouldEnsureAdmin = !!(
    config.get('inits:ensureAdmin')
    && config.get('inits:adminLogin')
    && config.get('inits:adminPass')
);
const db = createServerDbms(
    emptyDatabase,
    shouldEnsureAdmin
        ? {
            adminLogin: config.get('inits:adminLogin'),
            adminPass: config.get('inits:adminPass'),
        }
        : undefined,
);
const preparedDb = wrapWithPermissions(db);
const dbms = { db, rawDb: db, preparedDb };

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

function afterDatabaseReady() {
    // Only bootstrap/repair missing admin credentials when explicitly enabled.
    // Never overwrite an existing admin password from config defaults.
    if (shouldEnsureAdmin) {
        dbms.db.ensureAdminExists(config.get('inits:adminLogin'), config.get('inits:adminPass'));
    }
    onSetDatabaseFinished();
}

if (lastDb !== null) {
    // Merge ManagementInfo: keep bootstrap admin, add users from autosaved file.
    dbms.db.setDatabase({ database: lastDb, preserveManagementInfo: true }).then(afterDatabaseReady);
} else {
    log.info('init from default base');
    console.log(emptyBase.data);
    dbms.db.setDatabase({ database: emptyBase.data, preserveManagementInfo: true }).then(afterDatabaseReady);
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
    const allowlist = config.get('api:corsOrigins');
    const origins = Array.isArray(allowlist) ? allowlist.filter(Boolean) : [];
    const corsOpts = {
        origin: origins.length > 0
            ? (origin, cb) => {
                if (!origin || origins.includes(origin)) cb(null, true);
                else cb(new Error('CORS origin denied'));
            }
            : false,
        credentials: true,
    };
    app.use(cors(corsOpts));
    app.options('*', cors(corsOpts));
}
log.info(`api enabled: ${config.get('api:enabled')}`);
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Trust proxy so secure cookies work behind HTTPS terminators.
app.set('trust proxy', 1);
const sessionOpts = { ...sessionOptions };
const cookieOpts = { ...(sessionOpts.cookie || {}) };
if (config.get('session:cookie:secure') || process.env.NIMS_COOKIE_SECURE === '1') {
    cookieOpts.secure = true;
}
if (cookieOpts.sameSite == null) cookieOpts.sameSite = 'lax';
if (cookieOpts.httpOnly == null) cookieOpts.httpOnly = true;
sessionOpts.cookie = cookieOpts;
app.use(session(sessionOpts));
app.use(passport.initialize());
app.use(passport.session());

if (config.get('compression:enabled')) {
    app.use(compression());
}
log.info(`compression enabled: ${config.get('compression:enabled')}`);

require('./boot')(app, dbms);
require('./middlewares')(app, dbms);
require('./mcp')(app, dbms);
require('./routes')(app, dbms);

const frontendDir = path.resolve(__dirname, config.get('frontendPath'));
app.use(express.static(frontendDir));
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/mcp')) return next();
    const indexPath = path.join(frontendDir, 'index.html');
    res.sendFile(indexPath, (err) => { if (err) next(); });
});

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
