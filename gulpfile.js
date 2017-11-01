var gulp = require('gulp');
var concat = require('gulp-concat');
var debug = require('gulp-debug');
var sourcemaps = require('gulp-sourcemaps');
var gulpIf = require('gulp-if');
var newer = require('gulp-newer');
var del = require('del');
var imagemin = require('gulp-imagemin');
var autoprefixer = require('gulp-autoprefixer');
var remember = require('gulp-remember');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglifyjs');
var R = require('ramda');
var htmlmin = require('gulp-htmlmin');
var config = require('./config');
const zip = require('gulp-zip');
var fileInclude = require('gulp-file-include');
var dateformat = require('dateformat');

var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV.trim() == 'dev';
var isServer = !process.env.MODE || process.env.MODE.trim() == 'server';

var lang = process.env.LANG ? process.env.LANG.trim() : 'ru';

var translationsPath = config.get('translationsPath');
var langPath = config.get('translationsPath') + '\\' + lang;

//console.log('=' + process.env.NODE_ENV + '=');
//console.log(isServer);
//console.log(process.env.NODE_ENV == 'dev');

var addPrefix = function(path, files){
    return R.ap([R.concat(path)], files)
};

var coreDir = 'app/core';
var coreBase= 'app/core';

var projectDir = 'app/' + config.get('projectName');
var projectBase = 'app/' + config.get('projectName');

var styles = addPrefix(projectDir + "/style/", config.get('styles:customStyles'));
var libCoreStyles = addPrefix(coreDir + "/libs/", config.get('styles:libCore'));

var libStyles = addPrefix(coreDir + "/libs/", config.get('styles:lib'));

var processStyles = function(styles, fileName, taskName, addSourcemaps) {
    return function(){
        return gulp.src(styles, {base: projectBase, since: gulp.lastRun(taskName)}) // can't use since here because we need all data
        .pipe(gulpIf(addSourcemaps && isDevelopment, sourcemaps.init()))
        .pipe(autoprefixer())
        .pipe(remember(taskName))
        .pipe(concat(fileName + '.min.css'))
        .pipe(debug({title:'concat'}))
        .pipe(cssnano())
        .pipe(gulpIf(addSourcemaps && isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest('dist/styles'));
    }
};

gulp.task('styles:nims',    processStyles(styles,       "nims",     'styles:nims',      true));
gulp.task('styles:libsCore',processStyles(libCoreStyles,"libsCore", 'styles:libsCore',  false));
gulp.task('styles:libs',    processStyles(libStyles,    "libs",     'styles:libs',      false));

gulp.task('styles', gulp.parallel('styles:libs','styles:nims', 'styles:libsCore'));

// js: libs, resources (l10n, templates), common, scripts (dbms, js root), pages, tests

var libsCore = addPrefix(coreDir + "/libs/", config.get('scripts:libsCore'));

var libs = addPrefix(coreDir + "/libs/", config.get('scripts:libs'));

// used in experimental page
//'three.js',
//'stats.js',
//'dat.gui.js',

var translations = [translationsPath + "/l10n/*.js"];
var resources = addPrefix(langPath + "/embeddedTemplates/", config.get('resources:files'));

var commonCore = addPrefix(coreDir + "/js/common/",
[
 'errors.js'      ,
 'EventEmitter.js',
 'commonUtils.js' ,
 'precondition.js' ,
 'dateFormat.js'  ]);
commonCore.push(langPath + "/defaultLang.js");

var common = addPrefix(projectDir + "/js/common/",
['emptyBase.js'   ,
 'constants.js'   ,
 'logger.js'      ,
 'projectUtils.js' ,
 'migrator.js'    ,
 'schema.js']);

common.push(projectDir + "/js/common/engine/*.js");
common.push(langPath + "/baseExample.js");

var scripts = [projectDir + "/js/dbms/*.js"].concat(coreDir + "/js/*.js").concat(projectDir + "/js/*.js");

var pages = [projectDir + "/js/pages/**/*.js"];
var pagesLight = addPrefix(projectDir + "/js/pages/", config.get('pagesLight'));

var processScripts = function(scripts, fileName, taskName, addSourcemaps) {
    return function() {
        return gulp.src(scripts, {base: projectBase})
            .pipe(gulpIf(addSourcemaps && isDevelopment, sourcemaps.init()))
            .pipe(remember(taskName))
            .pipe(concat(fileName + '.min.js'))
            .pipe(gulpIf(!isDevelopment, uglify()))
            .pipe(gulpIf(addSourcemaps && isDevelopment, sourcemaps.write()))
            .pipe(gulp.dest('dist/js'));
    }
};

gulp.task('scripts:libsCore',       processScripts(libsCore,    "libsCore",     'scripts:libsCore',     false));
gulp.task('scripts:libs',           processScripts(libs,        "libs",         'scripts:libs',         false));
gulp.task('scripts:translations',   processScripts(translations,"translations", 'scripts:translations', false));
gulp.task('scripts:resources',      processScripts(resources,   "resources",    'scripts:resources',    false));
gulp.task('scripts:commonCore',     processScripts(commonCore,  "commonCore",   'scripts:commonCore',   true ));
gulp.task('scripts:common',         processScripts(common,      "common",       'scripts:common',       true ));
gulp.task('scripts:scripts',        processScripts(scripts,     "scripts",      'scripts:scripts',      true ));
gulp.task('scripts:pages',          processScripts(pages,       "pages",        'scripts:pages',        true ));
gulp.task('scripts:pagesLight',     processScripts(pagesLight,  "pagesLight",   'scripts:pagesLight',   true ));

var scriptsArr = ['scripts:libsCore', 'scripts:libs','scripts:translations',
                  'scripts:commonCore','scripts:common','scripts:scripts','scripts:pages','scripts:pagesLight']

if(config.get('resources:enabled')){
    scriptsArr.push('scripts:resources');
}

gulp.task('scripts', gulp.parallel.apply(null, scriptsArr));

var htmls = config.get( isServer ? 'serverPages' : 'standalonePages' ).map(el => projectDir + '/' + el);

gulp.task('html', function() {
    return gulp.src(htmls, {base : projectBase})
    .pipe(fileInclude({
      prefix: '@@',
      basepath: './' + projectDir + '/partials/',
      context: {
        MODE: isServer ? 'NIMS_Server' : 'Standalone'
      }
    }))
    .pipe(htmlmin({collapseWhitespace : true}))
    .pipe(gulp.dest('dist'))
});

// plain copy
var corePlains = addPrefix(coreDir + "/",['LICENSE','LICENSE_RUS','NOTICE','NOTICE_RUS']);
var projectPlains = [projectDir + '/' + 'CHANGELOG'];

var copyFiles = (files, base) =>{
    return function() {
        return gulp.src(files, {base: base}).pipe(gulp.dest('dist'));
    }
};

gulp.task('corePlains', copyFiles(corePlains, coreDir));
gulp.task('projectPlains', copyFiles(projectPlains, projectBase));

gulp.task('assets', function() {
    return gulp.src(projectDir + '/images/*', {base: projectBase, since: gulp.lastRun('assets')})
    .pipe(newer('dist')) // used for single tasks when many files already copied, like first launch
//    .pipe(gulpIf(!isDevelopment, imagemin())) // enable on adding new images
    .pipe(debug({title:'assets copy'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
    return del('dist');
});

var tests = addPrefix(projectDir + "/tests/jasmine/",["jasmine.js","jasmine-html.js","boot.js"]);
var specs = addPrefix(projectDir + "/tests/spec/",[
                                        "DBMSSpec.js",
//                                                "tickets.js"
                                        ]);
if(!isDevelopment){
    specs = tests = [projectDir + "/tests/empty.js"];
}

gulp.task('tests', function() {
    gulp.src(isDevelopment ? [projectDir + "/tests/jasmine/jasmine.css"] : [projectDir + "/tests/empty.js"], {base: projectBase})
    .pipe(concat('tests.min.css'))
    .pipe(cssnano())
    .pipe(gulp.dest('dist/tests'));
    
    gulp.src(specs, {base: projectBase})
    .pipe(gulpIf(false && isDevelopment, sourcemaps.init()))
//    .pipe(remember('tests'))
    .pipe(concat('specs.min.js'))
    .pipe(gulpIf(!isDevelopment, uglify()))
    .pipe(gulpIf(false && isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest('dist/tests'));
    
    return gulp.src(tests, {base: projectBase})
    .pipe(gulpIf(false && isDevelopment, sourcemaps.init()))
//    .pipe(remember('tests'))
    .pipe(concat('tests.min.js'))
    .pipe(gulpIf(!isDevelopment, uglify()))
    .pipe(gulpIf(false && isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest('dist/tests'));
});

gulp.task('server', function(callback) {
    if(isServer){
        gulp.src(coreDir + '/js/common/**/*.js', {base: coreBase})
        .pipe(gulp.dest('dist'));
        gulp.src(projectDir + '/js/common/**/*.js', {base: projectBase})
        .pipe(gulp.dest('dist'));
    }
    callback();
});

gulp.task('copyDoc', function() {
    return gulp.src(langPath + '\\doc\\_build\\html' + '/**/*')
    .pipe(gulp.dest('dist/extras/doc'));
});

gulp.task('copyTemplates', function() {
    return gulp.src(langPath + '\\templates' + '/**/*')
    .pipe(gulp.dest('dist/extras/templates'));
});

gulp.task('copyPresentation', function() {
    return gulp.src(langPath + '\\presentation' + '/**/*')
    .pipe(gulp.dest('dist/extras/presentation'));
});

gulp.task('zip', function() {
    return gulp.src('dist/**/*')
        .pipe(zip((isServer?'server':'stand') + '-' + lang + dateformat(new Date(), '_dd-mmm-yyyy_HH-MM-ss') + '.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('dist', gulp.series('clean', gulp.parallel('styles','assets','scripts','html','corePlains','projectPlains','tests','server')));
gulp.task('dist:final', gulp.series('dist', 'copyDoc', 'copyTemplates', 'copyPresentation', 'zip'));

var partials = [projectDir + "/partials/**/*.html"];

gulp.task('watch', function() {
    
    gulp.watch(scripts, gulp.series('scripts:scripts'));
    gulp.watch(commonCore, gulp.series('scripts:commonCore'));
    gulp.watch(common, gulp.series('scripts:common'));
    gulp.watch(commonCore, gulp.series('server'));
    gulp.watch(common, gulp.series('server'));
    gulp.watch(pages, gulp.series('scripts:pages'));
    gulp.watch(pagesLight, gulp.series('scripts:pagesLight'));
    gulp.watch(translations, gulp.series('scripts:translations'));
    gulp.watch(styles, gulp.series('styles:nims'));
    gulp.watch(htmls, gulp.series('html'));
    gulp.watch(partials, gulp.series('html'));
    
});
gulp.task('dev', gulp.series('dist', 'watch'));
