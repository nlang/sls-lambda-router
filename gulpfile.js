var gulp = require("gulp");
var ts = require("gulp-typescript");
var merge = require("merge2");
var tslint = require("gulp-tslint");
const mocha = require("gulp-mocha");

gulp.task("lint", () =>
    gulp.src("./lib/*.ts")
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
);

var tsProject = ts.createProject("tsconfig.json", {
    declaration: true
});

gulp.task("build", ["lint"], function () {
    var tsResult = gulp.src("./lib/**/*.ts")
        .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest("dist")),
        tsResult.js.pipe(gulp.dest("dist"))
    ]);
});

gulp.task("test", ["build"], function() {
    gulp.src(["./dist/test/**/*.spec.js"], {read: false})
        .pipe(mocha({reporter: "progress"}))
});

gulp.task("watch", ["scripts"], function () {
    gulp.watch("lib/*.ts", ["scripts"]);
});