'use strict';

const gulp = require('gulp');
//const sass = require('gulp-sass');
const compass = require('gulp-compass');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');//чтобы при ошибке в sass, не падал gulp
const autoprefixer = require('gulp-autoprefixer');//добавляем префиксы для браузеров
//const sourcemaps = require('gulp-sourcemaps');//в браузере при просмотре стилей, можно увидеть, из какого файла они взяты
//не подходит для задачи compass, можно будет использовать только с gulp-sass
const concat = require('gulp-concat');//собирает все css-файлы в один
const rename = require('gulp-rename');//переименовывает файлы
const cssmin = require('gulp-cssmin');
const jshint = require('gulp-jshint');//npm install jshint gulp-jshint --save-dev инструмент для проверки качества js кода
const uglify = require('gulp-uglify');
const del = require('del'); // Подключаем библиотеку для удаления файлов и папок
const imagemin = require('gulp-imagemin'); // Подключаем библиотеку для работы с изображениями
const pngquant = require('imagemin-pngquant'); // Подключаем библиотеку для работы с png
const cache = require('gulp-cache'); // Подключаем библиотеку кеширования

gulp.task('browser-sync', function() {
	browserSync.init({
		server: "./dev"
	});

	gulp.watch("dev/scss/*.scss", gulp.series('compass'));
    gulp.watch("dev/*.html").on('change', browserSync.reload);
});

gulp.task('compass', function() {
  	return gulp.src('dev/sass/**/*.scss')
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    //.pipe(sourcemaps.init())
    .pipe(compass({
      css: 'dev/css',
      sass: 'dev/sass',
      image: 'dev/images'
    }))
    .pipe(autoprefixer({
		browsers: ['last 10 versions', '> 1%', 'ie 8', 'ie 7'],
        cascade: true
	}))
	.pipe(concat('main.css'))
	//.pipe(sourcemaps.write())
    .pipe(gulp.dest('dev/css'))
    .pipe(browserSync.reload({stream: true}))// Обновляем CSS на странице при изменении
});

gulp.task('minCss', function() {
	return gulp.src('./dev/css/**/*.css')
	.pipe(plumber())
	.pipe(cssmin())
	.pipe(rename({suffix: ".min"}))
	.pipe(gulp.dest('./public/css'))
})

gulp.task('jsLibs', function() {
	return gulp.src('./dev/js/vendor/**/*.js')
		//.pipe(jshint('.jshintrc')) //здесь должне быть файл конфига
		//.pipe(jshint.reporter('default'))
		.pipe(concat('libs.js')) // Собираем их в файле libs.min.js
		.pipe(gulp.dest('./public/js/'))
		.pipe(rename(({suffix: '.min'})))
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('./public/js/'))
});

gulp.task('scripts', function() {
	return gulp.src(['./dev/js/**/*.js', '!./dev/js/vendor/**/*.js'])
		//.pipe(jshint('.jshintrc')) //здесь должне быть файл конфига
		//.pipe(jshint.reporter('default'))
		.pipe(concat('main.js')) // Собираем их в файле libs.min.js
		.pipe(gulp.dest('./public/js/'))
		.pipe(rename(({suffix: '.min'})))
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('./public/js/'))
});

gulp.task('imagemin', function() {
	return gulp.src('./dev/img/**/*.*') // Берем все изображения
		.pipe(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('./public/img')); // Выгружаем на продакшен
});

gulp.task('fonts', function () {
	return gulp.src('./dev/fonts/**/*')
		.pipe(gulp.dest('./public/fonts'))
});

gulp.task('clean', function() {
	return del('./public');
	console.log("Public was deleted.");
});

gulp.task('clear', function () {
	return cache.clearAll();
});

gulp.task('watch', function() {
	gulp.watch('./dev/sass/**/*.scss', gulp.series('compass'));
	gulp.watch('./dev/css/**/*.css', browserSync.reload);
	gulp.watch('./dev/*.html', browserSync.reload);
	gulp.watch('./dev/js/**/*.js', browserSync.reload);
});

gulp.task('dev', gulp.series('compass', gulp.parallel('compass', 'watch', 'browser-sync')));

gulp.task('build', gulp.series('clean', gulp.parallel('compass', 'minCss', 'jsLibs', 'scripts', 'imagemin', 'fonts')));
