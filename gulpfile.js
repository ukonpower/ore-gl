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
        name: null,
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

function buildAllGLs( cb ){

    fs.readdir( glDir, ( err, files ) => {

        if ( err ) throw err;

        let conf = require( './webpack/buildAllGL.config' );

        for ( let i = 0; i < files.length; i++ ) {

            if( files[i] == '.DS_Store' ) continue;
            
            let glItemDir = glDir + files[i];
            let distGLItemDir = distGLDir + files[i];

            //set webpack entry files
            conf.entry[files[i]] = glItemDir + '/ts/main.ts';     

            //pug
            gulp.src([ glItemDir + '/pug/**/*.pug', '!' + glItemDir + '/pug/**/_*.pug'] )
                .pipe(plumber())
                .pipe(pug({
                    pretty: true,
                    locals: {
                        title: files[i],
                    }
                }))
                .pipe(gulp.dest( distGLItemDir ));

            //sass
            gulp.src( glItemDir + "/scss/style.scss" )
                .pipe( plumber() )
                .pipe( autoprefixer() )
                .pipe( sass() )
                .pipe( cssmin() )
                .pipe( gulp.dest( distGLItemDir + "/css/" ) )

            //copy files
            gulp.src( glDir + files[i] + '/src/assets/**/*' ).pipe( gulp.dest( distGLItemDir + '/assets/' ) );

            gulp.src( glItemDir + '/' + files[i] + '-thumbnail.png', { allowEmpty: true } ).pipe( gulp.dest( distGLItemDir) );
            
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

    let conf = require( './webpack/dev.config' );
    conf.entry.main = srcDir + '/ts/main.ts';
    conf.output.filename = 'main.js';
    conf.mode = options.P ? 'production' : 'development';

    return webpackStream( conf, webpack )
        .pipe( gulp.dest( distDir + "/js/" ) )
        .on( 'end', browserSync.reload )

}

function pugDev(){

    let title = options.name || 'Ore-GL';
    
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
    
    srcDir = srcPath + '/gl/' + options.name;
    distDir = publicPath + '/gl/' + options.name + '/public';

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
exports.default = gulp.series( cleanAllFiles, buildAllGLs, setDevTopVisualPath, develop );

//build GLs
exports.gl = gulp.series( setDevGLPath, cleanDevFiles, develop );

//build topVisual and GLs
// exports.build = gulp.series( cleanAllFiles, buildTopVisual, setDevTopVisualPath, develop );
