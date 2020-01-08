const gulp = require( 'gulp' );
const pug = require( 'gulp-pug' );
const autoprefixer = require( 'gulp-autoprefixer' );
const plumber = require( 'gulp-plumber' );
const sass = require( 'gulp-sass' );
const cssmin = require( 'gulp-cssmin' );
const minimist = require( 'minimist' );
const webpackStream = require( 'webpack-stream' );
const webpack = require( 'webpack' );
const browserSync = require( 'browser-sync' );
const del = require( 'del' );
const fs = require( 'fs' );

const options = minimist( process.argv.slice( 2 ), {
    default: {
        gl: null,
        P: false,
    }
});

const srcPath = './src';
const publicPath = './public';

/*-------------------
    Production
--------------------*/

const glDir = srcPath + '/gl/';
const distGLDir =  publicPath + '/gl/';

function buildTopVisual( cb ){

    // min build
    let conf = require( './webpack/webpack.config' );

    conf.main = ''

    webpackStream( conf, webpack )
        .pipe( gulp.dest( publicPath + '/js/' ) );


    cb();

}

function buildGLs( cb ){

    fs.readdir( glDir, ( err, files ) => {

        if ( err ) throw err;

        let conf = require( './webpack/webpack.config' );

        for ( let i = 0; i < files.length; i++ ) {

            //set webpack entry files
            conf.entry[files[i]] = glDir + files[i] + '/src/ts/main.ts';     

            //sass
            gulp.src( glDir + files[i] + "/src/scss/style.scss" )
                .pipe( plumber() )
                .pipe( autoprefixer() )
                .pipe( sass() )
                .pipe( cssmin() )
                .pipe( gulp.dest( distGLDir + files[i] + "/css/" ) )

            //copy files
            gulp.src( glDir + files[i] + '/src/html/**/*' ).pipe( gulp.dest( distGLDir + files[i] + '/' ) );
            gulp.src( glDir + files[i] + '/src/assets/**/*' ).pipe( gulp.dest( distGLDir + files[i] + '/assets/' ) );
            
        }
        
        conf.output.filename = '[name]/js/main.js';

        //webpack
        webpackStream( conf, webpack )
            .pipe( gulp.dest( distGLDir ) )
            .on( 'end', cb )

    });

}

function cleanAllFiles( cb ){

    del([

        publicPath
        
    ],{

        force: true,

    }).then( ( paths ) => {

        cb();

    });

}

/*-------------------
    Development
--------------------*/

let srcDir = '';
let distDir = '';

function copyDevFiles( cb ){

    gulp.src( srcDir + '/assets/**/*' ).pipe( gulp.dest( distDir + '/assets/' ) );

    browserSync.reload();
    
    cb();

}

function cleanDevFiles( cb ){

    del([

        distDir
        
    ],{

        force: true,

    }).then( ( paths ) => {

        cb();

    });

}

function webpackDev(){

    let conf = require( './webpack/webpack.config' );
    conf.entry.main = srcDir + '/ts/main.ts';
    conf.output.filename = 'main.js';
    conf.mode = options.P ? 'production' : 'development';

    return webpackStream( conf, webpack )
        .pipe( gulp.dest( distDir + "/js/" ) )
        .on( 'end', browserSync.reload )

}

function pugDev(){

    let title = options.gl || 'Ore-GL';
    
    return gulp.src([ srcDir + '/pug/**/*.pug', '!' + srcDir + '/pug/**/_*.pug'] )
        .pipe(plumber())
        .pipe(pug({
            pretty: true,
            locals: {
                title: title,
            }
        }))
        .pipe(gulp.dest( distDir ));
    
}

function sassDev(){

    return gulp.src( srcDir + "/scss/style.scss" )
        .pipe( plumber() )
        .pipe( sass() )
        .pipe( autoprefixer() )
        .pipe( cssmin() )
        .pipe( gulp.dest( distDir + "/css/" ) )
        .pipe( browserSync.stream() )

}

function brSync(){

    browserSync.init({
        server: {
            baseDir: distDir,
            index: "index.html",
        },
    });

}

function watch(){

    console.log( srcDir );
    console.log( distDir );
    
    gulp.watch( srcDir + '/ts/**/*', gulp.series( webpackDev ) );
    gulp.watch( srcDir + '/pug/**/*', gulp.task( pugDev ) );
    gulp.watch( srcDir + '/scss/*.scss', gulp.task( sassDev ) );
    gulp.watch( srcDir + '/html/**/*', gulp.task( copyDevFiles ) );

}

function setDevGLPath( cb ){
    
    srcDir = './gl/' + options.gl + '/src';
    distDir = './gl/' + options.gl + '/public';

    cb();
}

function setDevTopVisualPath( cb ){

    srcDir = srcPath + '/topVisual';
    distDir = publicPath;

    cb();

}

let develop = gulp.series( 
    copyDevFiles,
    gulp.parallel( pugDev, webpackDev, sassDev ),
    gulp.parallel( brSync, watch ),
);

//build topVisual
exports.default = gulp.series( cleanAllFiles, setDevTopVisualPath, develop );

//build GLs
exports.dev = gulp.series( setDevGLPath, cleanDevFiles, develop );

//build topVisual and GLs
// exports.build = gulp.series( cleanAllFiles, buildTopVisual, setDevTopVisualPath, develop );
