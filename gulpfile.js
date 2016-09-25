var gulp = require("gulp");
var mocha = require("gulp-mocha")
var ts = require("gulp-typescript");
var fs = require("fs");
var through = require("through2");
var del = require("del");
var rename = require("gulp-rename");

gulp.task("build", function() {
    return gulp.src("./src/*.ts")
        .pipe(ts({
            target: "es5",
            module: "commonjs"
        })).js    
        .pipe(gulp.dest("./lib"));
});

gulp.task("tsc", function(){
    return gulp.src(["./src/*.ts", "./test/*.ts"])
        .pipe(ts({
            target: "es5",
            module: "commonjs"
        }))
        .pipe(gulp.dest(function(file) {
           return file.base; 
        }));
});

gulp.task("test", ["tsc"], function() {
    return gulp.src("./test/*.js")
        .pipe(mocha({}));
});

gulp.task("examples", ["tsc"], function() {

    var snip = require("./src/snip.js").snip;
    return del("./examples/snipped/*.*")
        .then(() => 
            gulp.src("./examples/*.*")
                .pipe(through.obj(function(file, _, next) {
                    file.contents = new Buffer(JSON.stringify(snip(file.contents.toString(), { unindent: true }), null, "\t"));
                    next(null, file);
                }))
                .pipe(rename(path => {
                    path.extname = path.extname + ".json";
                }))
                .pipe(gulp.dest("./examples/snipped"))
        );
});
