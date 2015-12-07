'use strict';

var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var webpack = require('webpack-stream');
var stylish = require('gulp-jscs-stylish');

var path = require('path');
var karma = require('karma');

/*
 * Code style enforcement
 */
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

/*
 * Testing fixtures
 */
function runTests(singleRun, isCI, done) {
   var reporters = ['mocha'];
   var preprocessors = {};

   var files = [
      path.join(__dirname, 'test/vendor/*.js'), // PhantomJS 1.x polyfills
      path.join(__dirname, 'dist', 'github.min.js'),
      path.join(__dirname, 'test', 'helpers.js'),
      path.join(__dirname, 'test', 'test.*.js')
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

   if (isCI) {
      localConfig.sauceLabs = {
         testName: 'GitHub.js UAT tests',
         idleTimeout: 120000,
         recordVideo: false
      };

      // Increase timeouts massively so Karma doesn't timeout in Sauce tunnel.
      localConfig.browserNoActivityTimeout = 400000;
      localConfig.captureTimeout = 120000;
      localConfig.customLaunchers = sauceLaunchers;
      localConfig.browsers = Object.keys(sauceLaunchers);
      reporters.push('saucelabs');

      // Set Mocha timeouts to longer.
      localConfig.client = {
         mocha: {
            timeout: 20000
         }
      };
   }

   var server = new karma.Server(localConfig, function(failCount) {
      done(failCount ? new Error('Failed ' + failCount + ' tests.') : null);
   });

   server.start();
} // End runTests()

gulp.task('test', ['build'], function(done) {
   runTests(true, false, done);
});

gulp.task('test:ci', function(done) {
   runTests(true, true, done);
});

gulp.task('test:auto', function(done) {
   runTests(false, false, done);
});

/*
 * Build
 */
var WEBPACK_CONFIG = {
   entry: {
      github: './github.js'
   },
   output: {
      library: 'Github',
      libraryTarget: 'umd',
      filename: '[name].min.js'
   },
   resolve: {
      extensions: ['', '.js']
   },
   plugins: [
      new webpack.webpack.optimize.UglifyJsPlugin()
   ],
   devtool: 'source-map',
   stats: {
      colors: 'true'
   }
};

gulp.task('build', function() {
   return gulp.src('./github.js')
      .pipe(webpack(WEBPACK_CONFIG))
      .pipe(gulp.dest('dist/'))
      ;
});

gulp.task('default', function() {
   gulp.start('lint', 'test', 'build');
});

var sauceLaunchers = {
   SL_Chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      version: '45'
   },
   SL_Firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '39'
   },
   SL_Safari: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.10',
      version: '8'
   },
   SL_IE_10: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 2012',
      version: '10'
   },
   SL_IE_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
   },
   SL_iOS: {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.10',
      version: '8.1'
   }
};
