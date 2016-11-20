'use strict';

// Make standalone build
// gulp dist
// Make server build
// gulp server
// make prod build
// set NODE_ENV=prod && gulp dist
// set NODE_ENV=dev && gulp dist

//set NODE_ENV=dev && gulp dev

//set NODE_ENV=dev && set MODE=server && gulp dev
//set NODE_ENV=dev && set MODE=standalone && gulp dev
//set NODE_ENV=dev && set MODE=standalone && set LANG=en && gulp dev

//set NODE_ENV=prod && set MODE=standalone && gulp dist
//set NODE_ENV=prod && set MODE=standalone && gulp dist:final
//set NODE_ENV=prod && set MODE=standalone && set LANG=en && gulp dist:final
//set NODE_ENV=prod && set MODE=server && gulp dist:final

process.chdir("../NIMS");
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

var styles = addPrefix("app/style/", ["common.css", "style.css", "experimental.css"]);
var libStyles = ["app/libs/*.css"];

var processStyles = function(styles, fileName, taskName, addSourcemaps) {
    return function(){
        return gulp.src(styles, {base: 'app', since: gulp.lastRun(taskName)}) // can't use since here because we need all data
        .pipe(debug({title:'app'}))
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

gulp.task('styles:nims', processStyles(styles, "nims", 'styles:nims', true));
gulp.task('styles:libs', processStyles(libStyles, "libs", 'styles:libs', false));

gulp.task('styles', gulp.parallel('styles:libs','styles:nims'));

// js: libs, resources (l10n, templates), common, scripts (dbms, js root), pages, tests

var libs = addPrefix("app/libs/",[
'jquery-3.1.1.min.js',
'ajv-4.1.1.js',
'bootstrap.min.js',
'Chart.min.js',
'docxgen-121.min.js',
'FileSaver.js',
'jquery.datetimepicker.js',
'jszip-utils.js',
'jszip.js',
'mustache.min.js',
'ramda.min.js',
'select2.min.js',
'vis-custom.min.js',
'three.js',
'stats.js',
'dat.gui.js',
]);

//var resources = ["app/l10n/*.js"].concat(addPrefix("app/templates/",["templatesArr.js","genericTemplate.js",
var resources = [translationsPath + "/l10n/*.js"].concat(addPrefix("app/templates/",["templatesArr.js","genericTemplate.js",
    "inventoryTemplate.js","templateByStory.js","templateByTime.js","textTemplate.js"]));

var common = addPrefix("app/js/common/",
['constants.js'   ,
 'commonUtils.js' ,
 'dateFormat.js'  ,
 'emptyBase.js'   ,
 'errors.js'      ,
 'EventEmitter.js',
 'logger.js'      ,
 'migrator.js'    ,
 'schema.js']);

common = common.concat(["app/js/common/engine/*.js"]);
common = common.concat([langPath + "/baseExample.js", langPath + "/defaultLang.js"]);

var scripts = ["app/js/dbms/*.js"].concat("app/js/*.js");

var pages = ["app/js/pages/**/*.js"];

var processScripts = function(scripts, fileName, taskName, addSourcemaps) {
    return function() {
        return gulp.src(scripts, {base: 'app'})
            .pipe(gulpIf(addSourcemaps && isDevelopment, sourcemaps.init()))
            .pipe(remember(taskName))
            .pipe(concat(fileName + '.min.js'))
            .pipe(gulpIf(!isDevelopment, uglify()))
            .pipe(gulpIf(addSourcemaps && isDevelopment, sourcemaps.write()))
            .pipe(gulp.dest('dist/js'));
    }
};

gulp.task('scripts:libs', processScripts(libs, "libs", 'scripts:libs', false));
gulp.task('scripts:resources', processScripts(resources, "resources", 'scripts:resources', false));
gulp.task('scripts:common', processScripts(common, "common", 'scripts:common', true));
gulp.task('scripts:scripts', processScripts(scripts, "scripts", 'scripts:scripts', true));
gulp.task('scripts:pages', processScripts(pages, "pages", 'scripts:pages', true));

gulp.task('scripts', gulp.parallel('scripts:libs','scripts:resources','scripts:common','scripts:scripts','scripts:pages'));

gulp.task('html', function() {
    return gulp.src('app/nims.html', {base : 'app'})
    .pipe(htmlmin({collapseWhitespace : true}))
    .pipe(gulp.dest('dist'))
});

// plain copy
var plains = [];
plains = plains.concat(addPrefix("app/",['CHANGELOG','LICENSE','LICENSE_RUS','mode.js','NOTICE','NOTICE_RUS']));
//plains = plains.concat(['app/templates/*.docx']);

gulp.task('plains', function() {
    return gulp.src(plains, {base: 'app'})
        .pipe(gulp.dest('dist'));
});

gulp.task('assets', function() {
    return gulp.src('app/images/*', {base: 'app', since: gulp.lastRun('assets')})
    .pipe(newer('dist')) // used for single tasks when many files already copied, like first launch
//    .pipe(gulpIf(!isDevelopment, imagemin())) // enable on adding new images
    .pipe(debug({title:'assets copy'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
    return del('dist');
});

var tests = addPrefix("app/tests/jasmine/",["jasmine.js","jasmine-html.js","boot.js"]);
var specs = addPrefix("app/tests/spec/",[
                                        "DBMSSpec.js",
//                                                "tickets.js"
                                        ]);
if(!isDevelopment){
    specs = tests = ["app/tests/empty.js"];
}

gulp.task('tests', function() {
    gulp.src(isDevelopment ? ["app/tests/jasmine/jasmine.css"] : ["app/tests/empty.js"], {base: 'app'})
    .pipe(concat('tests.min.css'))
    .pipe(cssnano())
    .pipe(gulp.dest('dist/tests'));
    
    gulp.src(specs, {base: 'app'})
    .pipe(gulpIf(false && isDevelopment, sourcemaps.init()))
//    .pipe(remember('tests'))
    .pipe(concat('specs.min.js'))
    .pipe(gulpIf(!isDevelopment, uglify()))
    .pipe(gulpIf(false && isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest('dist/tests'));
    
    return gulp.src(tests, {base: 'app'})
    .pipe(gulpIf(false && isDevelopment, sourcemaps.init()))
//    .pipe(remember('tests'))
    .pipe(concat('tests.min.js'))
    .pipe(gulpIf(!isDevelopment, uglify()))
    .pipe(gulpIf(false && isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest('dist/tests'));
});

gulp.task('server', function(callback) {
    if(isServer){
        gulp.src('app/js/common/**/*.js', {base: 'app'})
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
        .pipe(zip('dist.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('dist', gulp.series('clean', gulp.parallel('styles','assets','scripts','html','plains','tests','server')));
gulp.task('dist:final', gulp.series('dist', 'copyDoc', 'copyTemplates', 'copyPresentation', 'zip'));

gulp.task('watch', function() {
    
    gulp.watch(scripts, gulp.series('scripts:scripts'));
    gulp.watch(common, gulp.series('scripts:common'));
    gulp.watch(pages, gulp.series('scripts:pages'));
    gulp.watch(styles, gulp.series('styles:nims'));
    gulp.watch('app/nims.html', gulp.series('html'));
    
});
gulp.task('dev', gulp.series('dist', 'watch'));
