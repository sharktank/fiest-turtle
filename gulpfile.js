var gulp = require('gulp'); 
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');

// Tasks
gulp.task('static', function() {
   gulp.src('app/img/**')
       .pipe(gulp.dest('build/img'));

   gulp.src('app/htdocs/index.html')
     .pipe(gulp.dest('build'));
});

gulp.task('sass', function() {
  gulp.src('app/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('build/css'));
});

gulp.task('scripts', function() {
  var b = browserify();
  b.add('./app/js/init.js');
  b.transform(reactify);
  b.bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./build/'));
});

gulp.task('default', ['static', 'sass', 'scripts']);
