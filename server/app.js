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

const config = require('./config');
const log = require('./libs/log')(module);
const { HttpError } = require('./error');
require('./autosave');

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

require('./boot')(app);
require('./middlewares')(app);
require('./routes')(app);

app.use(express.static(config.get('frontendPath')));

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
