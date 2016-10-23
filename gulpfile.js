'use strict';

const webpack = require("webpack-stream");
const gulp = require("gulp");
const zip = require("gulp-zip");
const del = require("del");
const mainBowerFiles = require("main-bower-files");
const exists = require("path-exists").sync;


gulp.task("clean", () => {
    return del(['build'])
});


gulp.task("bower", ["clean"], () => {
    const bowerWithMin = mainBowerFiles().map( function(path, index, arr) {
        const newPath = path.replace(/.([^.]+)$/g, '.min.$1');
        return exists(newPath) ? newPath : path;
    });

    return gulp.src(bowerWithMin)
        .pipe(gulp.dest("build/lib/"));
});


// Extension

gulp.task("copy_ext", ["clean", "bower"], () => {
    return gulp.src(["src/**", "static/**", "build/lib/**"])
        .pipe(gulp.dest("build/ext/"));
});


gulp.task("pack_ext_mv", ["clean"], () => {
    return gulp.src("app/multiview.js")
        .pipe(webpack({
            "output": {
                "filename": "multiview.js"
            }
        }))
        .pipe(gulp.dest("build/ext/"));
});


gulp.task("pack_ext_opt", ["clean"], () => {
    return gulp.src("app/options.js")
        .pipe(webpack({
            "output": {
                "filename": "options.js"
            }
        }))
        .pipe(gulp.dest("build/ext/"));
});


gulp.task("pack_ext", ["pack_ext_mv", "pack_ext_opt"]);


gulp.task("zip_ext", ["copy_ext", "pack_ext"], () => {
    return gulp.src(["build/ext/**"])
        .pipe(zip("multiview.zip"))
        .pipe(gulp.dest("build"));
});


// Default task

gulp.task("default", ["zip_ext"]);
