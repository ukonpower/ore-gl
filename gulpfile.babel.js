import gulp from 'gulp';
import plumber from 'gulp-plumber';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import webpackConfig from './webpack.config.js';
import browserSync from 'browser-sync';
import autoprefixer from 'gulp-autoprefixer';
import sass from 'gulp-sass';
import cssmin from 'gulp-cssmin';
import pug from 'gulp-pug';

gulp.task("webpack", () => {
    return webpackStream(webpackConfig, webpack).on('error', function (e) {
        this.emit('end');
    })
    .pipe(gulp.dest("./public/js/"));
});

gulp.task('pug', () => {
    return gulp.src(['./src/pug/**/*.pug', '!./pug/**/_*.pug'])
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('./public/'));
  });

gulp.task("sass", ()=> {
    gulp.src("./src/scss/style.scss")
      .pipe(plumber())
      .pipe(autoprefixer())
      .pipe(sass())
      .pipe(cssmin())
      .pipe(gulp.dest("./public/css/"));
});

gulp.task('copy', ()=> {
    gulp.src(['./src/gl/**/*']).pipe(gulp.dest('./public/gl/'));
    gulp.src(['./src/conf/**/*']).pipe(gulp.dest('./public/'));
    gulp.src(['./src/assets/**/*']).pipe(gulp.dest('./public/assets/'));
});

gulp.task('browser-sync', () =>{
    browserSync.init({
        server:{
            baseDir:"public",
            index: "index.html"
        },
    });
});

gulp.task('bs-reload', () =>{
    browserSync.reload();
})

gulp.task('default',['browser-sync','webpack','sass','pug','copy'],() => {
    gulp.watch(['./src/js/**/*'],['webpack','bs-reload']);
    gulp.watch('./src/scss/**/*.scss',['sass','bs-reload']);
    gulp.watch('./src/pug/**/*.pug',['pug','bs-reload']);
    gulp.watch(['./src/js/*'],['copy']);
});