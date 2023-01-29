import { src, dest, watch, series, parallel } from "gulp";
import htmlmin from "gulp-htmlmin";

import sassCore from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(sassCore);
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import rename from "gulp-rename";

import babel from "gulp-babel";
import uglify from "gulp-uglify";
import concat from "gulp-concat";

import imagemin from "gulp-imagemin";
import newer from "gulp-newer";

import del from "del";

import browserSync from "browser-sync";
const browsersync = browserSync.create();

const paths = {
  html: { src: "src/*.html", dest: "dist/" },
  styles: { src: "src/styles/**/*.scss", dest: "dist/css/" },
  scripts: { src: "src/scripts/**/*.js", dest: "dist/js/" },
  img: { src: "src/img/**", dest: "dist/img/" },
};

export const html = () =>
  src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.html.dest))
    .pipe(browsersync.stream());

export const styles = () =>
  src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS({ level: 2 }))
    .pipe(rename({ basename: "style", suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.styles.dest))
    .pipe(browsersync.stream());

export const scripts = () =>
  src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat("index.min.js"))
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.scripts.dest))
    .pipe(browsersync.stream());

export const img = () =>
  src(paths.img.src)
    .pipe(newer(paths.img.dest))
    .pipe(imagemin({ progressive: true }))
    .pipe(dest(paths.img.dest))
    .pipe(browsersync.stream());

export const clean = () => del(["dist/*", "!dist/img"]);

const watch = () => {
  browsersync.init({ server: { baseDir: "./dist" } });
  watch("src/*.html", html);
  watch("src/styles/**/*.scss", styles);
  watch("src/scripts/**/*.js", scripts);
  watch("src/img/**", img);
};

export default series(clean, parallel(html, styles, scripts, img), watch);
