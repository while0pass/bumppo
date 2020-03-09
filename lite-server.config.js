'use strict';

const BUMPPO_REMOTE_SERVER = {
  origin: 'https://multidiscourse.ru',
  resultsPath: '/perform_search_sql/',
  tiersPath: '/get_tiers/'
};

let proxy = require('http-proxy-middleware'),
    paths = [
      BUMPPO_REMOTE_SERVER.resultsPath,
      BUMPPO_REMOTE_SERVER.tiersPath,
    ],
    proxyOpts = {
      changeOrigin: true,
      target: BUMPPO_REMOTE_SERVER.origin
    };

module.exports = {
  host: '0.0.0.0',
  port: 3000,
  server: {
    baseDir: 'build',
    middleware: { 1: proxy(paths, proxyOpts) }
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
