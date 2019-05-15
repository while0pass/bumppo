'use strict';

const BUMPPO_REMOTE_SERVER = {
  origin: 'https://multidiscourse.ru:8080',
  path: '/search_annotations/SearchAnnotations'
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
  injectChanges: true,
  logLevel: 'silent',
  browser: ['google-chrome'],

  BUMPPO: { REMOTE_SERVER: BUMPPO_REMOTE_SERVER }
};
