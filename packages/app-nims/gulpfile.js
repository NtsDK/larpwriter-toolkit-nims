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
var distPath = config.get('distPath');
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
var pageStyles = [projectDir + "/js/pages/**/*.css"];

var processStyles = function(styles, fileName, taskName, addSourcemaps) {
    return function(done){
        if(styles.length === 0) return done();
        return gulp.src(styles, {base: projectBase, since: gulp.lastRun(taskName)}) // can't use since here because we need all data
        .pipe(gulpIf(addSourcemaps && isDevelopment, sourcemaps.init()))
        .pipe(autoprefixer())
        .pipe(remember(taskName))
        .pipe(concat(fileName + '.min.css'))
        .pipe(debug({title:'concat'}))
        .pipe(cssnano())
        .pipe(gulpIf(addSourcemaps && isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest(distPath + '/styles'));
    }
};



gulp.task('styles:nims',        processStyles(styles,       "nims",         'styles:nims',      true));
gulp.task('styles:libsCore',    processStyles(libCoreStyles,"libsCore",     'styles:libsCore',  false));
gulp.task('styles:libs',        processStyles(libStyles,    "libs",         'styles:libs',      false));
gulp.task('styles:pageStyles',  processStyles(pageStyles,   "pageStyles",   'styles:pageStyles',true ));

gulp.task('styles', gulp.parallel('styles:libs','styles:nims', 'styles:libsCore', 'styles:pageStyles'));

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

var common = addPrefix(projectDir + "/js/common/", config.get('scripts:commonList'));

common.push(projectDir + "/js/common/engine/*.js");
common.push(langPath + "/demoBase.js");
common.push(langPath + "/emptyBase.js");

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
            .pipe(gulp.dest(distPath + '/js'));
    }
};

gulp.task('scripts:libsCore',       processScripts(libsCore,    "libsCore",     'scripts:libsCore',     false));
gulp.task('scripts:libs',           processScripts(libs,        "libs",         'scripts:libs',         false));
//gulp.task('scripts:translations',   processScripts(translations,"translations", 'scripts:translations', false));
gulp.task('scripts:resources',      processScripts(resources,   "resources",    'scripts:resources',    false));
gulp.task('scripts:commonCore',     processScripts(commonCore,  "commonCore",   'scripts:commonCore',   true ));
gulp.task('scripts:common',         processScripts(common,      "common",       'scripts:common',       true ));
gulp.task('scripts:scripts',        processScripts(scripts,     "scripts",      'scripts:scripts',      true ));
gulp.task('scripts:pages',          processScripts(pages,       "pages",        'scripts:pages',        true ));
gulp.task('scripts:pagesLight',     processScripts(pagesLight,  "pagesLight",   'scripts:pagesLight',   true ));

//var scriptsArr = ['scripts:libsCore', 'scripts:libs','scripts:translations',
//                  'scripts:commonCore','scripts:common','scripts:scripts','scripts:pages','scripts:pagesLight']
var scriptsArr = ['scripts:libsCore', 'scripts:libs',
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
      basepath: './' + projectDir + '/js/pages/',
      context: {
        MODE: isServer ? 'NIMS_Server' : 'Standalone',
        BASE_FILE_NAME: config.get( 'baseFileName' )
      }
    }))
    .pipe(htmlmin({collapseWhitespace : true}))
    .pipe(gulp.dest(distPath))
});

var translations2 = [translationsPath + "/l10n/*.js"];
var translations2All = [translationsPath + "/l10n/**/*.js"];

gulp.task('translations2', function() {
    return gulp.src(translations2, {base : translationsPath})
    .pipe(fileInclude({
      prefix: '@@',
      basepath: translationsPath + "/l10n",
//      context: {
//        MODE: isServer ? 'NIMS_Server' : 'Standalone',
//        BASE_FILE_NAME: config.get( 'baseFileName' )
//      }
    }))
//    .pipe(htmlmin({collapseWhitespace : true}))
    .pipe(concat('translations.min.js'))
    .pipe(gulp.dest(distPath + '/js'))
});

// plain copy
var corePlains = addPrefix(coreDir + "/",['LICENSE','LICENSE_RUS','NOTICE','NOTICE_RUS']);
var projectPlains = [projectDir + '/' + 'CHANGELOG'];
var fontPlains = addPrefix(coreDir + "/fonts/",config.get('fonts'));
var bsIconsPlains = addPrefix(coreDir + "/fonts/",config.get('bsIcons'));
var faIconsPlains = addPrefix(coreDir + "/webfonts/",config.get('faIcons'));

var copyFiles = (files, base) =>{
    return function(done) {
        if(files.length === 0) return done();
        return gulp.src(files, {base: base}).pipe(gulp.dest(distPath));
    }
};

gulp.task('corePlains', copyFiles(corePlains, coreDir));
gulp.task('projectPlains', copyFiles(projectPlains, projectBase));
gulp.task('fontPlains', copyFiles(fontPlains, coreDir));
gulp.task('bsIconsPlains', copyFiles(bsIconsPlains, coreDir));
gulp.task('faIconsPlains', copyFiles(faIconsPlains, coreDir));

gulp.task('assets', function() {
    return gulp.src(projectDir + '/images/*', {base: projectBase, since: gulp.lastRun('assets')})
    .pipe(newer(distPath)) // used for single tasks when many files already copied, like first launch
//    .pipe(gulpIf(!isDevelopment, imagemin())) // enable on adding new images
    .pipe(debug({title:'assets copy'}))
    .pipe(gulp.dest(distPath));
});

gulp.task('clean', function() {
    return del(distPath, {force: true});
});

var tests = addPrefix(coreDir + "/tests/jasmine/",["jasmine.js","jasmine-html.js","boot.js"]);
var specs = [projectDir + "/specs/*.js"];

if(!isDevelopment){
    specs = tests = [coreDir + "/tests/empty.js"];
}

gulp.task('tests', function() {
    gulp.src(isDevelopment ? [coreDir + "/tests/jasmine/jasmine.css"] : [coreDir + "/tests/empty.js"], {base: projectBase})
    .pipe(concat('tests.min.css'))
    .pipe(cssnano())
    .pipe(gulp.dest(distPath + '/tests'));
    
    gulp.src(specs, {base: projectBase})
    .pipe(gulpIf(false && isDevelopment, sourcemaps.init()))
//    .pipe(remember('tests'))
    .pipe(concat('specs.min.js'))
    .pipe(gulpIf(!isDevelopment, uglify()))
    .pipe(gulpIf(false && isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(distPath + '/tests'));
    
    return gulp.src(tests, {base: projectBase})
    .pipe(gulpIf(false && isDevelopment, sourcemaps.init()))
//    .pipe(remember('tests'))
    .pipe(concat('tests.min.js'))
    .pipe(gulpIf(!isDevelopment, uglify()))
    .pipe(gulpIf(false && isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(distPath + '/tests'));
});

gulp.task('server', function(callback) {
    if(isServer){
        gulp.src(coreDir + '/js/common/**/*.js', {base: coreBase})
        .pipe(gulp.dest(distPath));
        gulp.src(projectDir + '/js/common/**/*.js', {base: projectBase})
        .pipe(gulp.dest(distPath));
        gulp.src(langPath + "/emptyBase.js", {base: langPath})
        .pipe(gulp.dest(distPath + '/js/common'));
    }
    callback();
});

gulp.task('copyDoc', function() {
    return gulp.src(langPath + '\\doc\\_build\\html' + '/**/*')
    .pipe(gulp.dest(distPath + '/extras/doc'));
});

gulp.task('copyTemplates', function() {
    return gulp.src(langPath + '\\templates' + '/**/*')
    .pipe(gulp.dest(distPath + '/extras/templates'));
});

gulp.task('copyPresentation', function() {
    return gulp.src(langPath + '\\presentation' + '/**/*')
    .pipe(gulp.dest(distPath + '/extras/presentation'));
});

gulp.task('zip', function() {
    return gulp.src(distPath + '/**/*')
        .pipe(zip((isServer?'server':'stand') + '-' + lang + dateformat(new Date(), '_dd-mmm-yyyy_HH-MM-ss') + '.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('dist', gulp.series('clean', 
        gulp.parallel('styles','assets','scripts','html','corePlains','projectPlains',
                'fontPlains','bsIconsPlains', 'faIconsPlains', 'tests','server', 'translations2')));
//gulp.task('dist:final', gulp.series('dist', 'copyDoc', 'copyTemplates', 'copyPresentation', 'zip'));
gulp.task('dist:final', gulp.series('dist', 'copyTemplates', 'zip'));

var partials = [projectDir + "/js/pages/**/*.html"];

gulp.task('watch', function() {
    
    gulp.watch(scripts, gulp.series('scripts:scripts'));
    gulp.watch(commonCore, gulp.series('scripts:commonCore'));
    gulp.watch(common, gulp.series('scripts:common'));
    gulp.watch(commonCore, gulp.series('server'));
    gulp.watch(common, gulp.series('server'));
    gulp.watch(pages, gulp.series('scripts:pages'));
    gulp.watch(pagesLight, gulp.series('scripts:pagesLight'));
//    gulp.watch(translations, gulp.series('scripts:translations'));
    gulp.watch(styles, gulp.series('styles:nims'));
    gulp.watch(pageStyles, gulp.series('styles:pageStyles'));
    gulp.watch(htmls, gulp.series('html'));
    gulp.watch(translations2All, gulp.series('translations2'));
    gulp.watch(partials, gulp.series('html'));
    gulp.watch(specs, gulp.series('tests'));
    
});
gulp.task('dev', gulp.series('dist', 'watch'));
