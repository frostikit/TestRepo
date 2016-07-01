"use strict";

var gulp            = require("gulp"),
    gulpSass        = require("gulp-sass"),
    gulpSourcemaps  = require("gulp-sourcemaps"),
    gulpBrowserify  = require("gulp-browserify"),
    gulpSpriteSmith = require("gulp.spritesmith"),
    mergeStream     = require("merge-stream"),
    xtend           = require("xtend"),
    argv            = require("yargs").argv,
    path            = require("path"),
    /* If JenkinsCartridgesPath argument is present then this build is triggered from Jenkins and we should 
       use this as root path where cartridges are located, if not then this build was triggered from developer's
       PC and we use __dirname (which is current directory this file is located in) as root path. */
    rootPath        = argv.JenkinsCartridgesPath || __dirname;

/* JavaScript paths */
var JS_PATHS = [
        {
            "wtc" : "dlutsyk_cartridge/cartridge/js/**/*.js",
            "src" : "dlutsyk_cartridge/cartridge/js/app.js",
            "dst" : "dlutsyk_cartridge/cartridge/static/default/js"
        }
    ];

/* SCSS paths */
var SCSS_PATHS = [
        {
            "wtc" : "dlutsyk_cartridge/cartridge/scss/**/*.scss",
            "src" : "dlutsyk_cartridge/cartridge/scss/**/*.scss",
            "dst" : "dlutsyk_cartridge/cartridge/static/default/css"
        }
    ];

/* Gulp tasks */
gulp.task("scss", function() {
    var streams = mergeStream();

    SCSS_PATHS.forEach(function(p) {
        var srcPath = path.join(rootPath, p.src),
            dstPath = path.join(rootPath, p.dst);

        streams.add(gulp.src(srcPath)
            .pipe(gulpSourcemaps.init())
            .pipe(gulpSass({"errLogToConsole" : true}))
            .pipe(gulpSourcemaps.write())
            .pipe(gulp.dest(dstPath)));
    });

    return streams;
});

gulp.task("js", function() {
    var streams = mergeStream(),
        /* If JenkinsNodeModulesPath argument is present then this build is triggered from Jenkins and we need to
           add it to the paths argument passed to Browserify so it can look for the dependencies it needs in the
           place where we cached the node_modules, if it's not present then the build is run from the developer's
           PC and we leave the default values */
        optBrfy = xtend({"debug" : true}, argv.JenkinsNodeModulesPath ? {paths : [argv.JenkinsNodeModulesPath]} : {});

    JS_PATHS.forEach(function(p) {
        var srcPath = path.join(rootPath, p.src),
            dstPath = path.join(rootPath, p.dst);

        streams.add(gulp.src(srcPath)
            .pipe(gulpBrowserify(optBrfy))
            .pipe(gulp.dest(dstPath)));
    });

    return streams;
});

gulp.task("watch", ["scss", "js"], function() {
    SCSS_PATHS.forEach(function(p) {
        gulp.watch(path.join(rootPath, p.wtc), ["scss"]);
    });

    JS_PATHS.forEach(function(p) {
        gulp.watch(path.join(rootPath, p.wtc), ["js"]);
    });
});