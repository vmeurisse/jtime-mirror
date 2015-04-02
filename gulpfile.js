var spawn = require('child_process').spawn;

var gulp = require('gulp');

var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var htmlmin = require('gulp-htmlmin');
var sourcemaps = require('gulp-sourcemaps');
var amdOptimize = require('amd-optimize');
var eslint = require('gulp-eslint');

var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var calc = require('postcss-calc');
var nested = require('postcss-nested');
var customProperties = require('postcss-custom-properties');
var cssImport = require('postcss-import');
var csswring = require('csswring');
var doiuse = require('doiuse');

var order = require('gulp-order');
var cached = require('gulp-cached');
var remember = require('gulp-remember');
var progeny = require('gulp-progeny');
var gulpWatch = require('gulp-watch');
var filter = require('gulp-filter');
var es = require('event-stream');
var runSequence = require('run-sequence');
var gulpif = require('gulp-if');
var lazypipe = require('lazypipe');
var plumber = require('gulp-plumber');

var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var notifier =  require('node-notifier');

var globs = {
	scripts: ['src/client/**/*.js'],
	style: 'src/client/**/*.css',
	markup: ['src/client/**/*.html'],
	statics: ['src/client/**/*.json', 'src/client/**/*.png'],
	templates: 'src/client/**/*.hbs',
	server: 'src/server/**/*.js',
	gulp: 'gulpfile.js'
};

var mode = 'prod'; // or 'dev'
var watch = false;

var mario = function() {
	return gulpif(watch, plumber({
		errorHandler: function(err) {
			console.log('\x07' + err.toString());
			notifier.notify({
				'title': 'You broke the build!!!',
				'message': err.message,
				sound: true
			});
		}
	}));
};

var reloadPipe = lazypipe().pipe(filter, ['*', '!*.map'])
	                       .pipe(function () { return gulpif(watch, livereload()); });

gulp.task('build', ['_scripts', '_style', '_markup', '_statics', '_templates', '_server', '_checkdeps']);

gulp.task('default', function () {
	mode = 'dev';
	livereload.listen();
	runSequence('build', '_watch', function() {
		livereload.reload();
	});
});

gulp.task('_watch', function () {
	watch = true;
	for (var type of ['scripts', 'style', 'markup', 'statics', 'templates', 'server']) {
		gulp.src('I_DONT_EXIST')
			.pipe(gulpWatch(globs[type]))
			.pipe(filter(function(type, file) {
				console.log('I changed', file.path, file.event);
				if (file.event === 'unlink') { // if a file is deleted, forget about it
					if (cached.caches[type]) {
						delete cached.caches[type][file.path];
						remember.forget(type, file.path);
					}
				}
				return true;
			}.bind(null, type)))
			.pipe(es.map(function(type) {
				console.log('Starting', type);
				runSequence('_' + type);
			}.bind(null, type)));
	}

	nodemon({
		script: 'src/server/server.js',
		watch: ['src/server'],
		ext: 'js json'
	});
});
gulp.task('_scripts', function() {
	var amdconf = {
		paths : {
			'page': './bower_components/page.js/page'
		}
	};

	var amdModules = es.merge(getSourceModules(), getAmdDependencies(amdconf))
				.pipe(amdOptimize('jtime', amdconf));

	return es.merge(getScriptDependencies(), amdModules)
		.pipe(concat('app.js'))
		.pipe(wrap("<%= contents %>require('jtime')"))
		.pipe(uglify({mangle: mode === 'prod'}))
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
		.pipe(babel({
			modules: 'amd',
			blacklist: ['strict']
		}))
		.pipe(remember('scripts'));
}

function getAmdDependencies(amdconf) {
	return gulp.src([
			amdconf.paths.page + '.js'
		], {base: '.'})
		.pipe(sourcemaps.init())
}

function getScriptDependencies() {
	return gulp.src([
			'./bower_components/fetch/fetch.js',
			'./bower_components/handlebars/handlebars.runtime.js',
			'./bower_components/hazelnut/hazelnut.js'
		], {base: '.'})
		.pipe(sourcemaps.init())
}

gulp.task('_server', function() {
	return gulp.src(globs.server)
		.pipe(mario())
		.pipe(cached('server'))
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('_style', function() {
	var browsers = [
		'last 2 Firefox versions',
		'Firefox ESR',
		'last 2 Chrome versions'
	],
	processors = [
		nested(),
		cssImport(),
		customProperties(),
		calc(),
		autoprefixer(browsers),
		doiuse({
			browsers: browsers,
			onFeatureUsage: function(usageInfo) {
				console.log(usageInfo.message);
			}
		}),
		csswring.postcss
	];
	return gulp.src(globs.style)
	           .pipe(mario())
	           .pipe(sourcemaps.init())
	           .pipe(cached('style')) //cached prevent recompilation when variables.css is touched
	           .pipe(progeny({regexp: /^\s*@import\s*(?:url\(\s*)?['"]?([^'")]+)['"]?\)?/}))
	           .pipe(postcss(processors))
	           .pipe(remember('style'))
	           .pipe(concat('app.css', {newLine: ''}))
	           .pipe(sourcemaps.write('.'))
	           .pipe(gulp.dest('./build'))
	           .pipe(reloadPipe());
});

gulp.task('_markup', function() {
	return gulp.src(globs.markup)
	           .pipe(gulp.dest('build'))
	           .pipe(reloadPipe());
});

gulp.task('_statics', function() {
	return gulp.src(globs.statics)
	           .pipe(gulp.dest('build'))
	           .pipe(reloadPipe());
});

gulp.task('_templates', function() {
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
	           .pipe(handlebars())
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

gulp.task('_checkdeps', function() {
	return new Promise(function(fulfill, reject) {
		var depcheck = require('depcheck');
		depcheck(__dirname, {}, function(unused) {
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
