'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var path = require('path');
var karma = require('karma');

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

gulp.task('test', function(done) {
  runTests(true, done);
});

gulp.task('test:auto', function(done) {
  runTests(false, done);
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

function runTests (singleRun, done) {
  var reporters = ['mocha'];
  var preprocessors = {};

  var pathSrcJs = [
    path.join(__dirname, 'github.js')
  ];

  if (singleRun) {
    pathSrcJs.forEach(function(path) {
      preprocessors[path] = ['coverage'];
    });
    reporters.push('coverage');

    preprocessors['test/user.json'] = ['json_fixtures'];
  }

  var localConfig = {
    configFile: path.join(__dirname, './karma.conf.js'),
    singleRun: singleRun,
    autoWatch: !singleRun,
    reporters: reporters,
    preprocessors: preprocessors
  };

  var server = new karma.Server(localConfig, function(failCount) {
    done(failCount ? new Error('Failed ' + failCount + ' tests.') : null);
  });
  server.start();
}
