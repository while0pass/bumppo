// Rollup plugins
import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';

// PostCSS plugins
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';

export default {
  external: ['jquery', 'semantic-ui', 'knockout', 'video.js', 'svg.js'],
  input: 'src/app.js',
  output: {
    file: 'build/js/spa.js',
    format: 'iife',
    sourcemap: true,
    globals: {
      'jquery': 'jQuery',
      'knockout': 'ko',
      'video.js': 'videojs',
      'svg.js': 'SVG',
    },
  },
  plugins: [
    postcss({
      extensions: ['.css'],
      plugins: [
        simplevars(),
        nested(),
        cssnext(),
        cssnano(),
      ],
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    eslint({
      exclude: [
        'src/styles/**',
        'src/semantic/**',
      ],
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    replace({
      exclude: [
        'node_modules/**',
        'src/semantic/**',
      ],
      BUMPPO_ENV: JSON.stringify(process.env.BUMPPO_ENV || 'development'),
      BUMPPO_VERSION: process.env.BUMPPO_VERSION || '',
      BUMPPO_HOSTING: process.env.BUMPPO_HOSTING || 'false',
    }),
    (process.env.BUMPPO_ENV === 'production' && terser()),
    copy({
      'node_modules/videojs-youtube/dist/Youtube.min.js':
      'build/js/libs/videojs-youtube.min.js',
      'node_modules/svg.js/dist/svg.min.js':
      'build/js/libs/svg.min.js',
      'node_modules/jquery.initialize/jquery.initialize.min.js':
      'build/js/libs/jquery.initialize.min.js',
    }),
  ],
};
