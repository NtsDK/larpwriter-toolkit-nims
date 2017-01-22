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

//set NODE_ENV=prod && set MODE=standalone && set LANG=ru && gulp dist:final
//set NODE_ENV=prod && set MODE=standalone && set LANG=en && gulp dist:final
//set NODE_ENV=prod && set MODE=server && set LANG=ru && gulp dist:final
//set NODE_ENV=prod && set MODE=server && set LANG=en && gulp dist:final

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
var fileInclude = require('gulp-file-include');

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
var libCoreStyles = addPrefix("app/libs/", ["bootstrap.min.css", "jquery.datetimepicker.css", "select2.min.css"]);
var libStyles = addPrefix("app/libs/", ['vis.min.css']);

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
gulp.task('styles:libsCore', processStyles(libCoreStyles, "libsCore", 'styles:libsCore', false));
gulp.task('styles:libs', processStyles(libStyles, "libs", 'styles:libs', false));

gulp.task('styles', gulp.parallel('styles:libs','styles:nims', 'styles:libsCore'));

// js: libs, resources (l10n, templates), common, scripts (dbms, js root), pages, tests

var libsCore = addPrefix("app/libs/",[
'jquery-3.1.1.min.js',
'bootstrap.min.js',
'jquery.datetimepicker.js',
'ramda.min.js',
'select2.min.js',
]);

var libs = addPrefix("app/libs/",[
'docxgen-121.min.js',
'FileSaver.js',
'jszip-utils.js',
'jszip.js',
'mustache.min.js',
'ajv-4.1.1.js',
'Chart.min.js',
'vis-custom.min.js',
//'three.js',
//'stats.js',
//'dat.gui.js',
]);

//var resources = ["app/l10n/*.js"].concat(addPrefix("app/templates/",["templatesArr.js","genericTemplate.js",
var translations = [translationsPath + "/l10n/*.js"];
var resources = addPrefix(langPath + "/embeddedTemplates/",["templatesArr.js","genericTemplate.js",
    "inventoryTemplate.js","templateByStory.js","templateByTime.js","textTemplate.js"]);

var commonCore = addPrefix("app/js/common/",
['constants.js'   ,
 'errors.js'      ,
 'commonUtils.js' ,
 'dateFormat.js'  ]);
commonCore.push(langPath + "/defaultLang.js");

var common = addPrefix("app/js/common/",
['emptyBase.js'   ,
 'EventEmitter.js',
 'logger.js'      ,
 'migrator.js'    ,
 'schema.js']);

common.push("app/js/common/engine/*.js");
common.push(langPath + "/baseExample.js");

var scripts = ["app/js/dbms/*.js"].concat("app/js/*.js");

var pages = ["app/js/pages/**/*.js"];
var pagesLight = addPrefix("app/js/pages/",
        ['enter.js'   ,
         'player.js',
         'register.js'      ,
         'logs/about.js',
         'profiles/profileEditorCore.js']);

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

gulp.task('scripts:libsCore', processScripts(libsCore, "libsCore", 'scripts:libsCore', false));
gulp.task('scripts:libs', processScripts(libs, "libs", 'scripts:libs', false));
gulp.task('scripts:translations', processScripts(translations, "translations", 'scripts:translations', false));
gulp.task('scripts:resources', processScripts(resources, "resources", 'scripts:resources', false));
gulp.task('scripts:commonCore', processScripts(commonCore, "commonCore", 'scripts:commonCore', true));
gulp.task('scripts:common', processScripts(common, "common", 'scripts:common', true));
gulp.task('scripts:scripts', processScripts(scripts, "scripts", 'scripts:scripts', true));
gulp.task('scripts:pages', processScripts(pages, "pages", 'scripts:pages', true));
gulp.task('scripts:pagesLight', processScripts(pagesLight, "pagesLight", 'scripts:pagesLight', true));

gulp.task('scripts', gulp.parallel('scripts:libsCore', 'scripts:libs','scripts:resources','scripts:translations',
        'scripts:commonCore','scripts:common','scripts:scripts','scripts:pages','scripts:pagesLight'));

var htmls = ['app/nims.html', 'app/index.html', 'app/player.html'];

gulp.task('html', function() {
    return gulp.src(htmls, {base : 'app'})
    .pipe(fileInclude({
      prefix: '@@',
      basepath: './app/partials/',
      context: {
        MODE: isServer ? 'NIMS_Server' : 'Standalone'
      }
    }))
    .pipe(htmlmin({collapseWhitespace : true}))
    .pipe(gulp.dest('dist'))
});

// plain copy
var plains = [];
plains = plains.concat(addPrefix("app/",['CHANGELOG','LICENSE','LICENSE_RUS','NOTICE','NOTICE_RUS']));
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
        .pipe(zip((isServer?'server':'stand') + '-' + lang + '.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('dist', gulp.series('clean', gulp.parallel('styles','assets','scripts','html','plains','tests','server')));
gulp.task('dist:final', gulp.series('dist', 'copyDoc', 'copyTemplates', 'copyPresentation', 'zip'));

var partials = ["app/partials/**/*.html"];

gulp.task('watch', function() {
    
    gulp.watch(scripts, gulp.series('scripts:scripts'));
    gulp.watch(commonCore, gulp.series('scripts:commonCore'));
    gulp.watch(common, gulp.series('scripts:common'));
    gulp.watch(pages, gulp.series('scripts:pages'));
    gulp.watch(pagesLight, gulp.series('scripts:pagesLight'));
    gulp.watch(translations, gulp.series('scripts:translations'));
    gulp.watch(styles, gulp.series('styles:nims'));
    gulp.watch(htmls, gulp.series('html'));
    gulp.watch(partials, gulp.series('html'));
    
});
gulp.task('dev', gulp.series('dist', 'watch'));
