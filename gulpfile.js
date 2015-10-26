'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('lint', function() {
   return gulp.src('github.js')
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jscs({
         fix: true
      }))
      .pipe(jscs.reporter())
      .pipe(gulp.dest('.'));
});

gulp.task('test', function() {
});

gulp.task('build', function() {
   return gulp.src('github.js')
      .pipe(uglify())
      .pipe(rename('github.min.js'))
      .pipe(gulp.dest('dist/'));
});

gulp.task('default', function() {
   gulp.start('lint', 'test', 'build');
});