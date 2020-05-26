/**
 * A simple Gulp 4 Starter Kit for modern web development.
 *
 * @package @jr-cologne/create-gulp-starter-kit
 * @author JR Cologne <kontakt@jr-cologne.de>
 * @copyright 2020 JR Cologne
 * @license https://github.com/jr-cologne/gulp-starter-kit/blob/master/LICENSE MIT
 * @version v0.10.12-beta
 * @link https://github.com/jr-cologne/gulp-starter-kit GitHub Repository
 * @link https://www.npmjs.com/package/@jr-cologne/create-gulp-starter-kit npm package site
 *
 * ________________________________________________________________________________
 *
 * gulpfile.js
 *
 * The gulp configuration file.
 *
 */

const gulp = require('gulp'),
  del = require('del'),
  sourcemaps = require('gulp-sourcemaps'),
  plumber = require('gulp-plumber'),
  autoprefixer = require('gulp-autoprefixer'),
  minifyCss = require('gulp-clean-css'),
  babel = require('gulp-babel'),
  webpack = require('webpack-stream'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  htmlmin = require('gulp-htmlmin'),
  imagemin = require('gulp-imagemin'),
  browserSync = require('browser-sync').create(),
  postcss = require('gulp-postcss'),
  purgecss = require('gulp-purgecss'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  twig = require('gulp-twig'),
  fs = require('fs'),
  src_folder = './src/',
  src_assets_folder = src_folder + 'assets/',
  dist_folder = './dist/',
  dist_assets_folder = dist_folder + 'assets/'

sass.compiler = require('node-sass')

gulp.task('clear', () => del([dist_folder]))

gulp.task('pages', () => {
  return gulp
    .src([src_folder + 'pages/**/*.html'], {
      base: src_folder + 'pages',
    })
    .pipe(
      twig({
        data: JSON.parse(
          fs.readFileSync(
            './src/config/config-' +
              (process.env.NODE_ENV || 'development') +
              '.json'
          )
        ),
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
        removeComments: true,
      })
    )
    .pipe(gulp.dest(dist_folder))
    .pipe(browserSync.stream())
})

gulp.task('postcss', function () {
  return gulp
    .src([src_assets_folder + 'sass/**/!(_)*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([require('tailwindcss'), require('postcss-object-fit-images')])
    )
    .pipe(
      purgecss({
        content: [
          src_folder + 'layout/**/*.html',
          src_folder + 'pages/**/*.html',
          src_folder + 'partials/**/*.html',
          src_assets_folder + 'js/**/*.js',
        ],
        keyframes: true,
        variables: true,
        fontFace: true,
        defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      })
    )
    .pipe(
      autoprefixer({
        grid: true,
      })
    )
    .pipe(minifyCss())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist_assets_folder + 'css'))
})

gulp.task('purgecss-rejected', function () {
  return gulp
    .src([src_assets_folder + 'sass/**/!(_)*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([require('tailwindcss'), require('postcss-object-fit-images')])
    )
    .pipe(
      rename({
        suffix: '.rejected',
      })
    )
    .pipe(
      purgecss({
        content: [
          src_folder + 'layout/**/*.html',
          src_folder + 'pages/**/*.html',
          src_folder + 'partials/**/*.html',
          src_assets_folder + 'js/**/*.js',
        ],
        keyframes: true,
        variables: true,
        fontFace: true,
        rejected: true,
        defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      })
    )
    .pipe(gulp.dest(dist_assets_folder + 'css'))
})

gulp.task('js', () => {
  return gulp
    .src([src_assets_folder + 'js/**/*.js'])
    .pipe(plumber())
    .pipe(
      webpack({
        mode: 'production',
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dist_assets_folder + 'js'))
    .pipe(browserSync.stream())
})

gulp.task('images', () => {
  return gulp
    .src([src_assets_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)'], {
      since: gulp.lastRun('images'),
    })
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(dist_assets_folder + 'images'))
    .pipe(browserSync.stream())
})

gulp.task('public', () => {
  return gulp.src([src_folder + 'public/**/*']).pipe(gulp.dest(dist_folder))
})

gulp.task('serve', () => {
  return browserSync.init({
    server: {
      baseDir: ['dist'],
    },
    // port: 3000,
    notify: false,
    open: true,
  })
})

gulp.task(
  'build',
  gulp.series(
    'clear',
    'pages',
    'postcss',
    'purgecss-rejected',
    'js',
    'images',
    'public'
  )
)

gulp.task(
  'dev',
  gulp.series('images', 'public', 'pages', 'postcss', 'purgecss-rejected', 'js')
)

gulp.task('watch', () => {
  const watchImages = [
    src_assets_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)',
  ]

  const watch = [
    src_folder + '**/*.html',
    src_folder + 'public/**/*',
    src_folder + 'public/**/.*',
    src_folder + 'config/**/.*',
    src_folder + 'config/**/.*',
    src_assets_folder + 'sass/**/*.scss',
    src_assets_folder + 'js/**/*.js',
  ]

  gulp.watch(watch, gulp.series('dev')).on('change', browserSync.reload)
  gulp
    .watch(watchImages, gulp.series('images'))
    .on('change', browserSync.reload)
})

gulp.task('default', gulp.series('dev', gulp.parallel('serve', 'watch')))
