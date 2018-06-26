var gulp = require("gulp");
const del = require('del');
var ts = require("gulp-typescript");
var merge = require("merge2");
var tslint = require("gulp-tslint");
var shell = require('gulp-shell');
const uglify = require("gulp-uglify-es").default;

gulp.task("lint", () =>
    gulp.src("./src/**/*.ts")
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
        .on("error", () => {
            console.log("lint failed");
            process.exit(1);
        })
);

gulp.task("clean:dist", () => del(["dist/**/*"]));

const tsProject = ts.createProject("tsconfig.json", {
    declaration: true
});

gulp.task("build", gulp.series("lint", "clean:dist", () => {
    let hasErrors = false;
    const tsResult = gulp.src("./src/**/*.ts")
        .pipe(tsProject())
        .on("error", () => hasErrors = true)
        .on("finish", () => {
            if (hasErrors) {
                console.log("build failed");
                process.exit(1);
            }
        });

    return merge([
        tsResult.dts.pipe(gulp.dest("dist")),
        tsResult.js
            .pipe(uglify())
            .pipe(gulp.dest("dist"))
    ]);
}));

gulp.task("test", gulp.series("build", () => {
    return gulp.src('./test').pipe(shell('npm test'));
}));

gulp.task("release", gulp.series("build", () => {
    return gulp.src('./').pipe(shell('npm pack'));
}));
