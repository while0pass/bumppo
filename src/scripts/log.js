import debug from 'debug';
const log = debug('bumppo:log');

if (ENV !== 'production') {
  debug.enable('bumppo:*');
  log('Logging is enabled!');
} else {
  debug.disable();
}

export default log;
