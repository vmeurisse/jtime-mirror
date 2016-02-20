'use strict';

/* eslint-env node */

// gulp and functional plugins
const gulp =        require('gulp');
const babel =       require('gulp-babel');
const uglify =      require('gulp-uglify');
const concat =      require('gulp-concat');
const handlebars =  require('gulp-handlebars');
const wrap =        require('gulp-wrap');
const declare =     require('gulp-declare');
const htmlmin =     require('gulp-htmlmin');
const sourcemaps =  require('gulp-sourcemaps');
const amdOptimize = require('amd-optimize');
const eslint =      require('gulp-eslint');

// post-css & plugins
const postcss =      require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csswring =     require('csswring');
const doiuse =       require('doiuse');
const calc =         require('postcss-calc');
const customProp =   require('postcss-custom-properties');
const cssImport =    require('postcss-import');
const nested =       require('postcss-nested');
const stylelint =    require('stylelint');

// gulp wiring plugins
const cached =      require('gulp-cached');
const remember =    require('gulp-remember');
const progeny =     require('gulp-progeny');
const gulpWatch =   require('gulp-watch');
const filter =      require('gulp-filter');
const es =          require('event-stream');
const runSequence = require('run-sequence');
const gulpif =      require('gulp-if');
const lazypipe =    require('lazypipe');
const plumber =     require('gulp-plumber');

// magic ;)
const livereload = require('gulp-livereload');
const nodemon =    require('gulp-nodemon');
const notifier =   require('node-notifier');

const globs = {
  scripts: ['src/client/**/*.js'],
  style: 'src/client/**/*.css',
  markup: ['src/client/**/*.html'],
  statics: ['src/client/**/*.json', 'src/client/**/*.png', 'src/client/**/*.svg'],
  templates: 'src/client/**/*.hbs',
  server: 'src/server/**/*.js',
  gulp: 'gulpfile.js'
};

let mode = 'prod'; // or 'dev'
let watch = false;

const mario = function() {
  return gulpif(watch, plumber({
    errorHandler(err) {
      console.log(err.toString());
      notifier.notify({
        'title': 'You broke the build!!!',
        'message': err.message,
        sound: true
      });
    }
  }));
};

const reloadPipe = lazypipe().pipe(filter, ['*', '!*.map'])
                             .pipe(() => {
                               return gulpif(watch, livereload());
                             });

gulp.task('build', [
  '_scripts',
  '_style',
  '_markup',
  '_statics',
  '_templates',
  '_server',
  '_checkdeps',
  '_checkgulpfile'
]);

gulp.task('default', () => {
  mode = 'dev';
  livereload.listen();
  runSequence('build', '_watch', () => {
    livereload.reload();
  });
});

gulp.task('_watch', () => {
  watch = true;
  for (let type of ['scripts', 'style', 'markup', 'statics', 'templates', 'server']) {
    gulp.src('I_DONT_EXIST')
      .pipe(gulpWatch(globs[type]))
      .pipe(filter(file => {
        console.log('I changed', file.path, file.event);
        if (file.event === 'unlink') { // if a file is deleted, forget about it
          if (cached.caches[type]) {
            delete cached.caches[type][file.path];
            remember.forget(type, file.path);
          }
        }
        return true;
      }))
      .pipe(es.map(() => {
        console.log('Starting', type);
        runSequence(`_${type}`);
      }));
  }

  nodemon({
    script: 'src/server/server.js',
    watch: ['src/server'],
    ext: 'js json'
  });
});
gulp.task('_scripts', () => {
  const amdconf = {
    paths: {
      'page': './bower_components/page.js/page'
    }
  };

  const amdModules = es.merge(getSourceModules(), getAmdDependencies(amdconf))
                       .pipe(amdOptimize('jtime', amdconf));

  return es.merge(getScriptDependencies(), amdModules)
           .pipe(concat('app.js'))
           .pipe(wrap("<%= contents %>require('jtime')"))
           .pipe(uglify({ mangle: mode === 'prod' }))
           .pipe(sourcemaps.write('.'))
           .pipe(gulp.dest('build'))
           .pipe(reloadPipe());
});

function getSourceModules() {
  return gulp.src(globs.scripts)
             .pipe(mario())
             .pipe(sourcemaps.init())
             .pipe(cached('scripts'))
             .pipe(eslint())
             .pipe(eslint.format())
             .pipe(eslint.failAfterError())
             .pipe(babel())
             .pipe(remember('scripts'));
}

function getAmdDependencies(amdconf) {
  return gulp.src([
    `${amdconf.paths.page}.js`
  ], { base: '.' })
    .pipe(sourcemaps.init());
}

function getScriptDependencies() {
  return gulp.src([
    './bower_components/fetch/fetch.js',
    './bower_components/handlebars/handlebars.runtime.js',
    './bower_components/hazelnut/hazelnut.js'
  ], { base: '.' })
    .pipe(sourcemaps.init());
}

gulp.task('_server', () => {
  return gulp.src(globs.server)
             .pipe(mario())
             .pipe(cached('server'))
             .pipe(eslint())
             .pipe(eslint.format())
             .pipe(eslint.failAfterError());
});

gulp.task('_style', () => {
  const browsers = [
          'last 2 Firefox versions',
          'Firefox ESR',
          'last 2 Chrome versions'
        ],
        processors = [
          stylelint(),
          nested(),
          cssImport(),
          customProp(),
          calc(),
          autoprefixer(browsers, {
            remove: false
          }),
          doiuse({
            browsers,
            ignore: ['css-appearance'],
            onFeatureUsage(usageInfo) {
              console.log(usageInfo.message);
            }
          }),
          csswring.postcss
        ];
  return gulp.src(globs.style)
             .pipe(mario())
             .pipe(sourcemaps.init())
             .pipe(cached('style')) // cached prevent recompilation when variables.css is touched
             .pipe(progeny({ regexp: /^\s*@import\s*(?:url\(\s*)?['"]?([^'")]+)['"]?\)?/ }))
             .pipe(postcss(processors))
             .pipe(remember('style'))
             .pipe(concat('app.css', { newLine: '' }))
             .pipe(sourcemaps.write('.'))
             .pipe(gulp.dest('./build'))
             .pipe(reloadPipe());
});

gulp.task('_markup', () => {
  return gulp.src(globs.markup)
             .pipe(gulp.dest('build'))
             .pipe(reloadPipe());
});

gulp.task('_statics', () => {
  return gulp.src(globs.statics)
             .pipe(gulp.dest('build'))
             .pipe(reloadPipe());
});

gulp.task('_templates', () => {
  return gulp.src(globs.templates)
             .pipe(mario())
             .pipe(cached('templates'))
             .pipe(htmlmin({
               removeComments: true,
               collapseWhitespace: true,
               collapseBooleanAttributes: true,
               removeRedundantAttributes: true,
               removeEmptyAttributes: true,
               removeScriptTypeAttributes: true,
               removeStyleLinkTypeAttributes: true,
               removeOptionalTags: true,
               customAttrSurround: [
                 [/\{\{#if\s+\w+\}\}/, /\{\{\/if\}\}/],
                 [/\{\{#unless\s+\w+\}\}/, /\{\{\/unless\}\}/]
               ]
             }))
             .pipe(handlebars({
               handlebars: require('handlebars')
             }))
             .pipe(wrap('Handlebars.template(<%= contents %>)'))
             .pipe(remember('templates'))
             .pipe(declare({
               namespace: 'jtime.tpl',
               noRedeclare: true // Avoid duplicate declarations
             }))
             .pipe(concat('templates.js'))
             .pipe(gulpif(mode === 'production', uglify()))
             .pipe(gulp.dest('build'))
             .pipe(reloadPipe());
});

gulp.task('_checkgulpfile', () => {
  return gulp.src('gulpfile.js')
             .pipe(eslint())
             .pipe(eslint.format())
             .pipe(eslint.failAfterError());
});

gulp.task('_checkdeps', () => {
  return new Promise((fulfill, reject) => {
    const depcheck = require('depcheck');
    const options = {
      ignoreDirs: ['build', 'client']
    };
    depcheck(__dirname, options, (unused) => {
      if (Object.keys(unused.invalidFiles).length) {
        console.log('Unable to parse some files');
        console.log(unused.invalidFiles);
        reject(new Error('Unable to parse some files'));
        return;
      }
      if (unused.dependencies.length || unused.devDependencies.length) {
        console.log('You have some unused dependencies');
        console.log(unused.dependencies.concat(unused.devDependencies));
        reject(new Error('You have some unused dependencies'));
        return;
      }
      fulfill();
    });
  });
});
