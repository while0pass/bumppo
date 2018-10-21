import debug from 'debug';
const log = debug('bumppo:log');

// eslint-disable-next-line no-undef
if (BUMPPO_ENV !== 'production') {
  debug.enable('bumppo:*');
  log('Logging is enabled!');
} else {
  debug.disable();
}

export default log;
