'use strict';

const extend = require('deep-extend');
let pathToLib = '../';
let h = require(pathToLib + 'helper');

module.exports = function createStatus(options) {
  return new StatusBar({
    term: options.term,
    coordinates: options.coordinates,
    title: options.title,
  });
};

function StatusBar(options) {
  this.term = options.term;
  this.title = options.title;
  this.coordinates = options.coordinates;
  drawTo({
    term: this.term,
    coordinates: this.coordinates,
    title: this.title,
  }, drawTitle);
  this.update = function update(options) {
    let drawingOptions = extend({}, options);
    drawingOptions = extend(drawingOptions, {
      term: this.term,
      coordinates: {
        x: this.coordinates.x,
        y: this.coordinates.y + 1,
      },
    });
    drawTo(drawingOptions, function draw(options) {
      let term = options.term;
      let stepNumber = options.step.number + 1;
      if (true === options.step.finalStep) {
        term.column(4).green('[' + stepNumber + '/' + options.step.total + ']');
        term.column(12)('Done');
      } else {
        term.column(4).red('[' + stepNumber + '/' + options.step.total + ']');
        term.column(12)(options.step.next);
        drawChapterResume(term, 40, options.chapters);
        if (h.exist(options.images)) {
          drawImageResume(term, 60, options.images);
        }
      }
    });
  };
}

function drawChapterResume(term, column, chapter) {
  if (h.exist(chapter) && h.exist(chapter.total)) {
    let prefix = 'Chapters: ';
    term.column(column).yellow(prefix);
    term.column(column + prefix.length)(chapter.total);
  }
}

function drawImageResume(term, column, imageInfo) {
  let imageDownloading = 0;
  if (h.exist(imageInfo.downloading)) {
    imageDownloading = imageInfo.downloading;
  }
  let imageDownloaded = 0;
  if (h.exist(imageInfo.downloaded)) {
    imageDownloaded = imageInfo.downloaded;
  }
  if (h.exist(imageInfo.total)) {
    let prefix = 'Images: ';
    term.column(column).yellow(prefix);
    if (imageInfo.total === imageDownloaded) {
      term.column(column + prefix.length)
        .green('[' + imageDownloading + '/' + imageDownloaded + '/' + imageInfo.total + ']');
    } else {
      term.column(column + prefix.length)
        .red('[' + imageDownloading + '/' + imageDownloaded + '/' + imageInfo.total + ']');
    }
  }
}

function drawTitle(options) {
  options.term.cyan(options.title);
}

function drawTo(options, draw) {
  let term = options.term;
  term.saveCursor();
  term.moveTo(options.coordinates.x, options.coordinates.y);
  term.eraseLine();
  draw(options);
  term.restoreCursor();
}
