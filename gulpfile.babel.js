import gulp from 'gulp';
import eslint from 'gulp-eslint';
import babel from 'gulp-babel';
import rename from 'gulp-rename';

import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import del from 'del';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

const ALL_SOURCES = [
   '*.js',
   'lib/*.js',
   'test/*.js',
];

gulp.task('lint', function() {
   return gulp.src(ALL_SOURCES)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      ;
});

gulp.task('clean', function() {
   return Promise.all([del('dist/'), del('coverage/')]);
});

gulp.task('build', [
   'build:bundled:min',
   'build:external:min',
   'build:bundled:debug',
   'build:external:debug',
   'build:components',
]);

const bundledConfig = {
   debug: true,
   entries: 'lib/GitHub.js',
   standalone: 'GitHub',
};
const externalConfig = {
   debug: true,
   entries: 'lib/GitHub.js',
   standalone: 'GitHub',
   external: [
      'axios',
      'js-base64',
      'es6-promise',
      'debug',
      'utf8',
   ],
   bundleExternal: false,
};
gulp.task('build:bundled:min', function() {
   return buildBundle(bundledConfig, '.bundle.min.js', true);
});
gulp.task('build:external:min', function() {
   return buildBundle(externalConfig, '.min.js', true);
});
gulp.task('build:bundled:debug', function() {
   return buildBundle(bundledConfig, '.bundle.js', false);
});
gulp.task('build:external:debug', function() {
   return buildBundle(externalConfig, '.js', false);
});
gulp.task('build:components', function() {
   return gulp.src('lib/*.js')
      .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist/components'))
      ;
});

function buildBundle(options, extname, minify) {
   let stream = browserify(options)
      .transform('babelify')
      .bundle()
      .pipe(source('GitHub.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({
         loadMaps: true,
      }));

   if (minify) {
      stream = stream.pipe(uglify());
   }

   return stream.pipe(rename({extname}))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('dist'))
      ;
}
