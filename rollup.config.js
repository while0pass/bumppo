// Rollup plugins
import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
//import builtins from 'rollup-plugin-node-builtins';
//import globals from 'rollup-plugin-node-globals';
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

const IS_PRODUCTION = process.BUMPPO_ENV === 'production';

export default {
  external: ['jquery', 'semantic-ui', 'knockout', 'svg.js'],
  input: 'src/app.js',
  output: {
    file: 'build/js/spa.js',
    format: 'iife',
    sourcemap: true,
    globals: {
      'jquery': 'jQuery',
      'knockout': 'ko',
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
    //builtins(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    //globals(),
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
      BUMPPO_HOSTING: process.env.BUMPPO_HOSTING || JSON.stringify(false),
      BUMPPO_LOCAL_SERVER: JSON.stringify(process.env.BUMPPO_LOCAL_SERVER || ''),
      BUMPPO_VERSION: process.env.BUMPPO_VERSION || '',
    }),
    terser({
      warnings: "verbose",
      compress: IS_PRODUCTION ? {} : false,
      mangle: IS_PRODUCTION ? true : false,
    }),
    copy({
      'node_modules/plyr/dist/plyr.css':
      'build/plyr.css',
      'node_modules/svg.js/dist/svg.min.js':
      'build/js/libs/svg.min.js',
      'node_modules/jquery.initialize/jquery.initialize.min.js':
      'build/js/libs/jquery.initialize.min.js',
    }),
  ],
};
