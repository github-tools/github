'use strict';

var gulp = require('gulp');

var babel = require('gulp-babel');
var istanbul = require('gulp-istanbul');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');

var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var stylish = require('gulp-jscs-stylish');

var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var del = require('del');
var path = require('path');
var Promise = require('es6-promise').Promise;
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

gulp.task('lint', function() {
   var sources = [
      path.join(__dirname, '/*.js'),
      path.join(__dirname, '/src/*.js'),
      path.join(__dirname, '/test/*.js')
   ];
   var opts = {
      base: './'
   };

   return gulp.src(sources, opts)
      .pipe(jshint())
      .pipe(jscs())
      .pipe(stylish.combineWithHintResults())
      .pipe(jscs.reporter())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(gulp.dest('.'))
      ;
});

gulp.task('coverage', function() {
   return gulp.src('src/**/*.js')
      .pipe(istanbul())
      .pipe(istanbul.hookRequire())
      ;
});

gulp.task('test:mocha', ['coverage'], function() {
   var srcOpts = {
      read: false
   };
   var mochaOpts = {
      timeout: 30000,
      slow: 5000
   };

   return gulp.src('test/test.*.js', srcOpts)
      .pipe(mocha(mochaOpts))
      .pipe(istanbul.writeReports())
      ;
});

gulp.task('clean', function() {
   return Promise.all([del('dist/*'), del('coverage/*')]);
});

gulp.task('build', function() {
   var bundler = browserify({
      debug: true,
      entries: 'src/github.js',
      standalone: 'Github'
   });

   bundler
      .transform('babelify')
      .bundle()
      .pipe(source('github.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({
         loadMaps: true
      }))
      .pipe(uglify())
      .pipe(rename({
         extname: '.bundle.min.js'
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist'))
      ;

   gulp.src('src/github.js')
      .pipe(babel())
      .pipe(sourcemaps.init())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist'))
      ;

   return gulp.src('src/github.js')
      .pipe(babel())
      .pipe(sourcemaps.init())
      .pipe(rename({
         extname: '.min.js'
      }))
      .pipe(uglify())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist'))
      ;
});

gulp.task('default', ['clean'], function() {
   gulp.start('lint', 'test:mocha', 'build');
});
