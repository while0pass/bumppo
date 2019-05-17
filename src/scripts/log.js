import debug from 'debug';
const log = debug('bumppo:log');

// eslint-disable-next-line no-undef
if (!$_CONFIG.BUMPPO_ENV_IS_PRODUCTION) {
  debug.enable('bumppo:*');
  log('Logging is enabled!');
} else {
  debug.disable();
}

export default log;
