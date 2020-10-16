const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const terser = require("gulp-terser");
const posthtml = require("gulp-posthtml");
const include = require('gulp-include');
const htmlmin = require("gulp-htmlmin");
const uglify = require('gulp-uglify');
const pipeline = require('readable-stream').pipeline;
const cleanCSS = require('gulp-clean-css');

const jsminify = () => {
  return pipeline(
    gulp.src("source/js/*.js"),
    uglify(),
    gulp.dest('build/')
  );
};

const htmlminify = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin())
    .pipe(gulp.dest('build/'));
};

// Styles
const clean = () => {
  return del("build");
};
exports.clean = clean;

const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
};
exports.sprite = sprite;

const createWebp = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("build/img"))
};
exports.webp = createWebp;

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.mozjpeg({
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}
exports.images = images;

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;
// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}
exports.server = server;

const copy = () => {
  return gulp.src([
      "source/fonts//*.{woff,woff2}",
      "source/img/",
      "source/css/",
      "source/js/*.js",
      "source/*.ico",
      "source/*.html"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
};
exports.copy = copy;

const svg = () => {
  return gulp.src("source/img/**/*.svg")
    .pipe(svgmin())
    .pipe(gulp.dest("build/img"));
};

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

const build = gulp.series(
  clean,
  copy,
  styles,
  sprite,
  createWebp,
  images,
  htmlminify,
  jsminify
);
exports.build = build;

gulp.task('build', gulp.series(build));
gulp.task("start", gulp.series(build, server, watcher));
