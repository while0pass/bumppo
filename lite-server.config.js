'use strict';

const BUMPPO_REMOTE_SERVER = {
  origin: 'https://multidiscourse.ru',
  path: '/perform_search_sql/'
};

let proxy = require('http-proxy-middleware'),
    proxyOpts = {
      changeOrigin: true,
      target: BUMPPO_REMOTE_SERVER.origin
    };

module.exports = {
  port: 3000,
  server: {
    baseDir: 'build',
    middleware: { 1: proxy(BUMPPO_REMOTE_SERVER.path, proxyOpts) }
  },
  files: [
    'build/index.html',
    'build/bumppo.css',
    'build/js/**/*.js}'
  ],
  injectChanges: false,
  reloadThrottle: 0,
  reloadDelay: 500,
  reloadDebounce: 500,
  logLevel: 'silent',
  browser: ['google-chrome'],

  BUMPPO: { REMOTE_SERVER: BUMPPO_REMOTE_SERVER }
};
