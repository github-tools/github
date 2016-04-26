import gulp from 'gulp';
import jscs from 'gulp-jscs';
import eslint from 'gulp-eslint';
import stylish from 'gulp-jscs-stylish';

import babel from 'gulp-babel';
import rename from 'gulp-rename';

import browserify  from 'browserify';
import buffer  from 'vinyl-buffer';
import del  from 'del';
import path  from 'path';
import {Promise}  from 'es6-promise';
import source  from 'vinyl-source-stream';
import sourcemaps  from 'gulp-sourcemaps';
import uglify  from 'gulp-uglify';

const ALL_SOURCES = [
   path.join(__dirname, '/*.js'),
   path.join(__dirname, '/src/*.js'),
   path.join(__dirname, '/test/*.js')
];

gulp.task('lint', function() {
   const opts = {
      base: './'
   };
   return gulp.src(ALL_SOURCES, opts)
      .pipe(eslint())
      .pipe(jscs())
      .pipe(stylish.combineWithHintResults())
      .pipe(stylish())
      ;
});

gulp.task('clean', function() {
   return Promise.all([del('dist/'), del('coverage/')]);
});

const browserifyConfig = {
   debug: true,
   entries: 'src/Github.js',
   standalone: 'Github'
};
gulp.task('build', function() {
   browserify(browserifyConfig)
      .transform('babelify')
      .bundle()
      .pipe(source('Github.js'))
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

   browserify(browserifyConfig)
      .transform('babelify')
      .bundle()
      .pipe(source('Github.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({
         loadMaps: true
      }))
      .pipe(rename({
         extname: '.bundle.js'
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist'))
      ;

   return gulp.src('src/*.js')
      .pipe(babel())
      .pipe(sourcemaps.init())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist/components'))
      ;
});

gulp.task('default', ['clean'], function() {
   gulp.start('lint', 'test:mocha', 'build');
});
