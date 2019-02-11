const { createLogger, format, transports } = require('winston');
const dateFormat = require('dateformat');

const {
    combine, timestamp, label, printf
} = format;

const myFormat = printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`);

const ENV = process.env.NODE_ENV;

// can be much more flexible than that O_o
function getLogger(module) {
//  var path = module.filename.split('/').slice(-2).join('/');
    const path = module.filename.split('\\').slice(-2).join('\\');

    return createLogger({
        format: combine(
            //            format.colorize(),
            //            label({ label: 'right meow!' }),
            label({ label: path }),
            timestamp({
                format: 'YYYY-mm-dd HH:MM:ss.SSS'
            }),
            //            timestamp('yyyy-mm-dd HH:MM:ss.l'),
            myFormat
        ),
        transports: [
            new transports.Console({
                //                timestamp() {
                //                    //          return Date.now();
                //                    return dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss.l');
                //                },
                //                formatter(options) {
                //                    // Return string will be passed to logger.
                //                    return `[${options.timestamp()}] ${options.level.toUpperCase()}: ${options.message}`;
                //                },
                //                colorize: true,
                //                //        level: (ENV == 'development') ? 'debug' : 'error',
                //                level: 'debug',
                //                label: path
            })
        ]
    });
}

module.exports = getLogger;
