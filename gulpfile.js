"use strict";

var gulp=require("gulp");
var ts=require("gulp-typescript");
var tsPorject=ts.createProject("tsconfig.json");

gulp.task("lxs",function(){
    return tsPorject.src().pipe(tsPorject()).js.pipe(gulp.dest("./"));
})