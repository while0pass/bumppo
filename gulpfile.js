const _lsconf = require('./lite-server.config.js'),
      _pkgconf = require('./package.json');

const context = {
  BUMPPO_ENV: process.env.BUMPPO_ENV || 'development',
  BUMPPO_ENV_IS_PRODUCTION: process.env.BUMPPO_ENV === 'production',
  BUMPPO_LOCAL_PORT: _lsconf.port,
  BUMPPO_LOCAL_SERVER: process.env.BUMPPO_LOCAL_SERVER || '',
  BUMPPO_REMOTE_SERVER: _lsconf.BUMPPO.REMOTE_SERVER,
  BUMPPO_VERSION: _pkgconf.version,
};

console.log('\nBumppo v' + context.BUMPPO_VERSION);

const { src, dest, parallel, series } = require('gulp'),
      merge = require('merge-stream');

// Gulp plugins
const babel = require('gulp-babel'),
      eslint = require('gulp-eslint'),
      //ext = require('gulp-ext'),
      gulpif = require('gulp-if'),
      htmlmin = require('gulp-htmlmin'),
      nunjucks = require('gulp-nunjucks'),
      postcss = require('gulp-postcss'),
      rename = require('gulp-rename'),
      rollup = require('gulp-better-rollup'),
      terser = require('gulp-terser');

// Rollup plugins
const //builtins = require('rollup-plugin-node-builtins'),
      commonjs = require('@rollup/plugin-commonjs'),
      //globals = require('rollup-plugin-node-globals'),
      jscc = require('rollup-plugin-jscc'),
      json = require('@rollup/plugin-json'),
      resolve = require('@rollup/plugin-node-resolve');

// PostCSS plugins
const //calc = require('postcss-calc'),
      color = require('postcss-color-function'),
      cssNano = require('cssnano'),
      cssNext = require('postcss-cssnext'),
      //cssPresetEnv = require('postcss-preset-env'),
      //customProps = require('postcss-css-variables'),
      easyImport = require('postcss-easy-import'),
      mixins = require('postcss-mixins'),
      nested = require('postcss-nested'),
      sassLikeVars = require('postcss-simple-vars');

const rollupOutputOpts = {
  format: 'iife',
  globals: {
    'jquery': 'jQuery',
    'knockout': 'ko',
    'svg.js': 'SVG',
  }
};

const rollupInputOpts = {
  external: ['jquery', 'semantic-ui', 'knockout', 'svg.js'],
  plugins: [
    //builtins(),
    resolve({ mainFields: ['browser', 'jsnext:main', 'module', 'main'] }),
    commonjs(),
    //globals(),
    json(),
    jscc({ values: { _CONFIG: context }, exclude: 'node_modules/**'}),
  ],
};

function html() {
  var cond = function (vinylFile) { return vinylFile.path.endsWith('.html'); };
  return src(['src/index.html'])
    .pipe(nunjucks.compile(context))
    //.pipe(ext.crop()) // Удаляем из мени файла расширение
    .pipe(gulpif(cond, htmlmin({
      collapseWhitespace: true,
      conservativeCollapse: false,
      removeComments: true,
      ignoreCustomComments: [/^\s+ko\s+|\s+\/ko\s+$/],
      minifyCSS: true,
      minifyJS: true,
    })))
    .pipe(dest('.build'));
}

function js() {
  var cond = function (vinylFile) { return vinylFile.path.endsWith('app.js'); };
  return src(['src/app.js', 'src/worker.js'], { sourcemaps: true })
    .pipe(rollup(rollupInputOpts, rollupOutputOpts))
    .pipe(eslint())
    .pipe(babel({ exclude: 'node_modules/**' }))
    .pipe(gulpif(context.BUMPPO_ENV_IS_PRODUCTION, terser()))
    .pipe(gulpif(cond, rename('spa.js')))
    .pipe(dest('.build/js', { sourcemaps: true }));
}

function css() {
  var //cpOpts = { preserve: false },
      //cpeOpts = { stage: 0 },
      //plugins = [easyImport(), mixins(), sassLikeVars(), customProps(cpOpts),
      //           cssPresetEnv(cpeOpts), calc(), color(), cssNano()],
      oldPlugins = [easyImport(), mixins(), sassLikeVars(), nested(),
                    cssNext(), color(), cssNano()];
  return src('src/styles/main.css').pipe(postcss(oldPlugins))
    .pipe(rename('bumppo.css')).pipe(dest('.build'));
}

function assets() {
  return merge(
    src('node_modules/jquery/dist/jquery.min.js').pipe(dest('.build/js')),
    src('node_modules/knockout/build/output/knockout-latest.js')
      .pipe(rename('knockout.min.js')).pipe(dest('.build/js')),
    src('node_modules/plyr/dist/plyr.css').pipe(dest('.build')),
    src(['node_modules/svg.js/dist/svg.min.js',
         'node_modules/jquery.initialize/jquery.initialize.min.js'])
      .pipe(dest('.build/js/libs')),
    src('src/scraps/ref00.svg').pipe(dest('.build')),
    src('src/scraps/ref01.svg').pipe(dest('.build')),
    src('src/scraps/ref10.svg').pipe(dest('.build')),
    src('src/scraps/ref11.svg').pipe(dest('.build')),
    src('bin/useless.mp3').pipe(dest('.build')),
  );
}

function sync() {
  return merge(
    src('.build/**').pipe(dest('build')),
    src('.semantic/**').pipe(dest('build/semantic')),
  );
}

exports.html = series(html, sync);
exports.js = series(js, sync);
exports.css = series(css, sync);
exports.assets = series(assets, sync);
exports.sync = sync;
exports.default = series(parallel(css, js, assets, html), sync);
