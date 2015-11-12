'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var stylish = require('gulp-jscs-stylish');
var path = require('path');
var karma = require('karma');

gulp.task('lint', function() {
   return gulp.src([
      path.join(__dirname, '/*.js'),
      path.join(__dirname, '/test/*.js')
   ],
   {
      base: './'
   })
   .pipe(jshint())
   .pipe(jscs({
      fix: true
   }))
   .pipe(stylish.combineWithHintResults())
   .pipe(jscs.reporter())
   .pipe(jshint.reporter('jshint-stylish'))
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

   var files = [
     path.join(__dirname, 'github.js'),
     path.join(__dirname, 'test/*.js')
   ];

   if (singleRun) {
      files.forEach(function(path) {
         preprocessors[path] = ['coverage'];
      });
      reporters.push('coverage');
   }

   files.push(path.join(__dirname, 'test/user.json'));
   files.push({
      pattern: path.join(__dirname, 'test/gh.png'),
      watched: false,
      included: false
   });
   preprocessors['test/user.json'] = ['json_fixtures'];

   var localConfig = {
      files: files,
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
