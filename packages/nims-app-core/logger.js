import loglevel from 'loglevel';
import prefix from 'loglevel-plugin-prefix';

prefix.reg(loglevel);
prefix.apply(loglevel);


export default function (namespace, initialLevel = 'warn') {
  // if (typeof namespace === 'object') {
  //   namespace = namespace.filename.split('\\').slice(-2).join('\\');
  // }

  prefix.apply(loglevel.getLogger(namespace), {
    format(level, name, timestamp) {
      return `${(`[${timestamp}]`)} ${(level)} ${(`${name}:`)}`;
    },
  });
  const log = loglevel.getLogger(namespace);
  log.setLevel(initialLevel);

  return log;
  // return loglevel.getLogger('InBrowserBackuper');

  // const log = loglevel.getLogger('InBrowserBackuper');
}


// log.warn('Yohoho!');
// // log.enableAll();
// // log.setLevel('warn');

// log.trace('trace');
// log.debug('debug');
// log.info('Something significant happened');
// log.log('log');
// log.info('info');
// log.warn('warn');
// log.error('error');
