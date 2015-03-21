"use strict";

var path = require("path");
var gulp = require("gulp");
var gulpPlugins = require("gulp-load-plugins")();
var del = require("del");
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var browserSync = require("browser-sync");
var runSequence = require("run-sequence");
var reload = browserSync.reload;
var viewVars = require("./view-vars");

var AUTOPREFIXER_BROWSERS = [
"ie >= 10",
"ie_mob >= 10",
"ff >= 30",
"chrome >= 34",
"safari >= 7",
"opera >= 23",
"ios >= 7",
"android >= 4.4",
"bb >= 10"
];
var bundler;

// Optimize Images
gulp.task("images", function () {
  return gulp.src("dev/images/**/*")
  .pipe(gulpPlugins.cache(gulpPlugins.imagemin({
    progressive: true,
    interlaced: true
  })))
  .pipe(gulp.dest("dist/images"))
  .pipe(gulpPlugins.size({ title: "images" }));
});

// Copy Web Fonts To Dist
gulp.task("fonts", function () {
  return gulp.src(["dev/fonts/**"])
  .pipe(gulp.dest("dist/fonts"))
  .pipe(gulpPlugins.size({ title: "fonts" }));
});

gulp.task("vendor-styles", function () {
  return gulp.src(["dev/styles/vendor/**/*"])
  .pipe(gulp.dest("dist/styles/vendor"))
  .pipe(gulpPlugins.size({ title: "vendor-styles" }));
});

gulp.task("vendor-scripts", function () {
  return gulp.src(["dev/scripts/vendor/**/*"])
  .pipe(gulp.dest("dist/scripts/vendor"))
  .pipe(gulpPlugins.size({ title: "vendor-scripts" }));
});

// Lint JavaScript
gulp.task("jslint", function () {
  return gulp.src(["dev/scripts/**/*.js", "!dev/scripts/vendor/**/*"])
  .pipe(reload({ stream: true, once: true }))
  .pipe(gulpPlugins.eslint({ configFile: './.eslintrc' }))
  .pipe(gulpPlugins.eslint.format());
});

// Compile and Automatically Prefix Stylesheets
gulp.task("styles", function () {
  // For best performance, don"t add Sass partials to `gulp.src`
  return gulp.src([
    "dev/styles/*.scss",
    "dev/styles/**/*.css",
    "!dev/styles/vendor/**/*"
  ])
  .pipe(gulpPlugins.changed("styles", { extension: ".scss" }))
  .pipe(gulpPlugins.sass({
    precision: 10,
    errLogToConsole: true
  }))
  .pipe(gulpPlugins.autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }))
  .pipe(gulp.dest("dist/styles"))
  .pipe(gulpPlugins.size({ title: "styles" }));
});

bundler = watchify(browserify('./dev/scripts/index.js', watchify.args))
gulp.task('scripts', ['jslint', 'browserify']);
gulp.task('browserify', bundle)
bundler.on('update', bundle);
bundler.on('log', gulpPlugins.util.log);

function bundle() {
  return bundler.bundle()
    .on('error', gulpPlugins.util.log.bind(gulpPlugins.util, 'Browserify Error'))
    .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(gulpPlugins.sourcemaps.init({loadMaps: true})) // loads map from browserify file
      .pipe(gulpPlugins.sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('dist/scripts'));
}

//gulp.task("scripts", ["jslint"], function () {
//  return gulp.src(["dev/scripts/**/*.js", "!dev/scripts/vendor/**/*"])
//  .pipe(gulpPlugins.plumber())
//  .pipe(gulpPlugins.uglifyjs("bundle.js",{ outSourceMap: true, sourceRoot: "/", basePath: "/dist" }))
//  .pipe(gulp.dest("dist/scripts"))
//  .pipe(gulpPlugins.size({ title: "scripts" }));
//});

gulp.task("html", function () {
  return gulp.src(["dev/*.html"])
  .pipe(gulp.dest("dist/"))
  .pipe(gulpPlugins.size({ title: "html" }));
});

gulp.task("views", function () {
  gulp.src(["dev/views/**/*.html"])
  .pipe(gulpPlugins.data(function () {
    return viewVars;
  }))
  .pipe(gulpPlugins.swig())
  .pipe(gulp.dest('dist/'))
  .pipe(gulpPlugins.size({ views: "views" }));
});

// Watch Files For Changes & Reload
gulp.task("dev", ["styles", "scripts", "views", "html", "fonts", "images", "vendor-scripts", "vendor-styles"], function () {
  browserSync({
    notify: false,
    // Customize the BrowserSync console logging prefix
    logPrefix: "WSK",
    // Run as an https by uncommenting "https: true"
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    online: true, // If it is not set and you"re offline the server take 2 minutes to run
    open: false, // Don"t open the browser windows with the url when staring
    port: 8000,
    ui: {
      port: 8080
    },
    server: ["dist"]
  });

  gulp.watch(["dev/styles/**/*.{scss,css}"], ["styles"]);
  gulp.watch(["dev/scripts/**/*.js"], ["scripts"]);
  gulp.watch(["dev/views/**/*"], ["views"]);
  gulp.watch(["dev/*.html"], ["html"]);
  gulp.watch(["dev/fonts/**/*"], ["fonts"]);
  gulp.watch(["dev/images/**/*"], ["images"]);
  gulp.watch(["dev/scripts/vendor/**/*"], ["vendor-scripts"]);
  gulp.watch(["dev/styles/vendor/**/*"], ["vendor-styles"]);
  gulp.watch(["dist/**/*"], reload)
});

// Clean Output Directory
gulp.task("clean", del.bind(null, [ "dist", ".sass-cache"]));

// Build Production Files, the Default Task
gulp.task("build", ["clean"], function (cb) {
  runSequence(["scripts", "styles", "images", "fonts", "vendor-styles", "vendor-scripts"], function (error) {
    if (error) {
      cb(error);
    } else {
      gulpPlugins.util.log("`dist` directory created with all the content");
      cb();
    }
  });
});
