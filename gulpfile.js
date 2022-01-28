'use strict';

const { dest, src, watch, parallel, series } = require('gulp');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const ttf2woff2 = require('gulp-ttf2woff2');
const ttfToWoff = require('gulp-ttf-to-woff');

const sass = require('gulp-sass')(require('sass'));
const pug = require('gulp-pug');
const react = require('react');
const babel = require('gulp-babel');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'src/'
        }
    });
}

function pugToHTML() {
    return src('src/pages/*.pug')
        .pipe(pug())
        .pipe(dest('src/'))
}

function fontsWOFF() {
    return src('src/fonts/web/*.ttf')
        .pipe(ttfToWoff())
        .pipe(dest('src/fonts'))
}

function fontsWOFF2() {
    return src('src/fonts/web/*.ttf')
        .pipe(ttf2woff2())
        .pipe(dest('src/fonts'))
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'src/js/babel/main.js',
        'src/js/slick.min.js',
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('src/js'))
        .pipe(browserSync.stream())
}

function babelWrites() {
    return src("src/js/main.js")
        .pipe(babel({
            presets: ["@babel/preset-env"]
        }))
        .pipe(dest("src/js/babel/"));
}

function images() {
    return src('src/images/**/*')
        .pipe(imagemin())
        .pipe(dest('build/images/'))
}

function styles() {
    return src('src/scss/style.scss')
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true,
        }))
        .pipe(dest('src/css'))
        .pipe(browserSync.stream())
}

function build() {
    return src([
        'src/css/style.min.css',
        'src/js/main.min.js',
        'src/*.html',
        'src/fonts/**/*.{"woff","woff2"}',
    ], { base: 'src' })
        .pipe(dest('build'))
}

function cleanBuild() {
    return del('build')
}

function watching() {
    watch(['src/scss/**/*.scss'], styles);
    watch(['src/js/main.js'], babelWrites);
    watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts);
    watch(['src/pages/**/*.pug'], pugToHTML);
    watch(['src/*.html']).on('change', browserSync.reload);

}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.fontsWOFF2 = fontsWOFF2;
exports.fontsWOFF = fontsWOFF;
exports.pugToHTML = pugToHTML;
exports.babelWrites = babelWrites;


exports.fonts = series(fontsWOFF2, fontsWOFF);
exports.build = series(cleanBuild, build, images);
exports.default = parallel(babelWrites, scripts, browsersync, watching);

