'use strict';

// Make standalone build
// gulp dist
// Make server build
// gulp server
// make prod build
// set NODE_ENV=production && gulp dist

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

var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

//gulp.task('hello', function(callback) {
//    console.log('hello');
//    callback();
//});
//
//gulp.task('default', function() {
//    return gulp.src('app/**/*').pipe(gulp.dest('dist'));
//});

var addPrefix = function(path, files){
    return R.ap([R.concat(path)], files)
};

var root = "C:\\workspaces\\nodeclipse\\NIMS\\"

// css: libs, my, tests
var styles = [];
styles = styles.concat(addPrefix("app/style/", ["bootstrap.min.css", "common.css", "style.css", "experimental.css"]));
styles = styles.concat("app/libs/*.css");
//styles = styles.concat("app/tests/**/*.css");

gulp.task('styles', function() {
//    return gulp.src('app/style/*', {base: 'app'})
    return gulp.src(styles, {base: 'app', since: gulp.lastRun('styles')}) // can't use since here because we need all data
//    return gulp.src(styles, {base: 'app'})
    .pipe(debug({title:'app'}))
//    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(autoprefixer())
    .pipe(remember('styles'))
    .pipe(concat('nims.min.css'))
    .pipe(debug({title:'concat'}))
    .pipe(cssnano())
//    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest('dist/styles'));
});

// js: libs, l10n, templates, common, dbms, js root, pages, tests
var jses = [];

jses = jses.concat(addPrefix("app/libs/",[
'jquery-2.1.4.js',
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
'vis-custom.min.js']));

//jses = jses.concat("app/libs/*.js");
jses = jses.concat("app/l10n/*.js");
jses = jses.concat(addPrefix("app/templates/",["templatesArr.js","genericTemplate.js","inventoryTemplate.js",
                                               "templateByStory.js","templateByTime.js","textTemplate.js"]));
jses = jses.concat("app/js/common/**/*.js");
jses = jses.concat("app/js/dbms/*.js");
jses = jses.concat("app/js/*.js");
jses = jses.concat("app/js/pages/**/*.js");
jses = jses.concat(addPrefix("app/tests/jasmine/",["jasmine.js","jasmine-html.js","boot.js"]));
//jses = jses.concat("app/tests/spec/*.js");

gulp.task('scripts', function() {
    return gulp.src(jses, {base: 'app'})
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(remember('scripts'))
        .pipe(concat('nims.min.js'))
        .pipe(gulpIf(!isDevelopment, uglify()))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest('dist'));
});

// plain copy
var plains = [];
plains = plains.concat(addPrefix("app/",['CHANGELOG','LICENSE','LICENSE_RUS','mode.js','nims.html','NOTICE',
                        'NOTICE_RUS']));
plains = plains.concat(['app/templates/*.docx']);

gulp.task('plains', function() {
    return gulp.src(plains, {base: 'app'})
        .pipe(gulp.dest('dist'));
});

gulp.task('assets', function() {
    return gulp.src('app/images/*', {base: 'app', since: gulp.lastRun('assets')})
    .pipe(newer('dist')) // used for single tasks when many files already copied, like first launch
    .pipe(gulpIf(!isDevelopment, imagemin()))
    .pipe(debug({title:'assets copy'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
    return del('dist');
});

//gulp.task('js:libs', function() {
//    return gulp.src('app/libs/*.js', {base: 'app'})
//        .pipe(concat('libs.min.js'))
//        .pipe(uglify())
//        .pipe(gulp.dest('dist/libs'));
//});
//gulp.task('css:libs', function() {
//    return gulp.src('app/libs/*.css', {base: 'app'})
//    .pipe(concat('libs.min.css'))
//    .pipe(cssnano())
//    .pipe(gulp.dest('dist/libs'));
//});


gulp.task('dist', gulp.series('clean', gulp.parallel('styles','assets','scripts','plains')));

gulp.task('watch', function() {
    gulp.watch('app/style/*', gulp.series('styles'));
    gulp.watch('app/images/*', gulp.series('assets'));
});
gulp.task('dev', gulp.series('dist', 'watch'));
