"use strict";

const
    gulp = require('gulp'),
    noop = require('gulp-noop'),
    newer = require('gulp-newer'),
    htmlclean = require('gulp-htmlclean'),
    devBuild = (process.env.NODE_ENV !== 'production'),
    sass = require('gulp-sass'),
    browsersync = require('browser-sync').create(),
    del = require('del'),
    concat = require('gulp-concat'),
    deporder = require('gulp-deporder'),
    terser = require('gulp-terser'),
    stripdebug = devBuild ? null : require('gulp-strip-debug'),
    sourcemaps = devBuild ? require('gulp-sourcemaps') : null,
    src = './',
    build = 'dist/';

function html() {
    return gulp.src(src + "./*.html")
        .pipe(newer(src + "./*.html"))
        .pipe(devBuild ? noop() : htmlclean())
        .pipe(gulp.dest(build));
}

function css() {
    return gulp.src(src + 'css/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            imagePath: 'img/',
            precision: 3,
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(gulp.dest(build + 'css/'))
        .pipe(browsersync.stream());
}

function js() {
    return gulp.src(src + 'js/*')
        .pipe(sourcemaps ? sourcemaps.init() : noop())
        .pipe(deporder())
        .pipe(concat('main.js'))
        .pipe(stripdebug ? stripdebug() : noop())
        .pipe(terser())
        .pipe(sourcemaps ? sourcemaps.write() : noop())
        .pipe(gulp.dest(build + 'js/'))
        .pipe(browsersync.stream());
}

function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./"
        },
        port: 3000
    });
    done();
}

// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

function clean() {
    return del(build);
}

function copyFonts() {
    gulp.src(src + './node_modules/font-awesome/fonts/fontawesome-webfont.*')
        .pipe(gulp.dest(build + 'fonts'));
}

function watch(done) {
    // image changes
    gulp.watch(src + 'img/*');
    // html changes
    gulp.watch(src + '*.html', html);
    // css changes
    gulp.watch(src + 'css/*', css);
    // js changes
    gulp.watch(src + 'js/*', js);
    done();
}

exports.build = gulp.series(clean, gulp.parallel(copyFonts, html, css, js, browserSync));

exports.watch = gulp.parallel(watch, browserSyncReload);

exports.default = gulp.series(exports.build, exports.watch);