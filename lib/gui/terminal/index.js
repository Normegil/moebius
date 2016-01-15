'use strict';

const term = require('terminal-kit').terminal;
const pathToLib = '../../';
const h = require(pathToLib + 'helper');
const app = require(pathToLib + 'app');
const mangaStatus = require('./mangaStatus');

module.exports = function launch(opts) {
  h.libraries.terminalKit.getCursorLocation(term)
    .then(function onSuccess(coordinates) {
      let adjuster = 0;
      let promises = opts.mangas.map(function createDownloader(manga) {
        let downloader = app.download(manga, opts.path, opts.poolSize);
        manageEvents({
          events: downloader.events,
          definition: app.events,
        }, {
          x: coordinates.x,
          y: coordinates.y + adjuster,
        });
        adjuster += 2;
        return downloader.start(!opts.refresh);
      });
      term.moveTo(coordinates.x, coordinates.y + adjuster);
      return Promise.all(promises);
    }).then(function onSuccess() {
      term.nextLine(1).column(3).green('Everything was downloaded !');
      setTimeout(function exit() {
        term.processExit(0);
      }, 5);
    }).catch(function onError(err) {
      term.nextLine(2).red(err.stack);
      term.processExit(1);
    });
};

function manageEvents(eventsDef, coordinates) {
  let status;
  let events = eventsDef.events;
  let definition = eventsDef.definition;

  let imageDownloading = 0;
  let imageDownloaded = 0;
  let totalImages = 0;
  let chaptersClosed = 0;
  let alreadyAddedChapterIDs = [];

  events.on(definition.start, function onStart(args) {
    try {
      status = mangaStatus({
        term: term,
        title: args.manga.title,
        coordinates: coordinates,
      });
      status.update({
        step: args.step,
      });
    } catch (err) {
      term.red(err.stack);
      term.processExit(1);
    }
  });
  events.on(definition.progress, function onProgress(args) {
    try {
      status.update({
        step: args.step,
        chapters: {
          total: h.exist(args.manga.chapters) ? args.manga.chapters.length : undefined,
        },
      });
    } catch (err) {
      term.red(err.stack);
      term.processExit(1);
    }
  });
  events.on(definition.close, function onClosed(args) {
    try {
      args.step.finalStep = true;
      status.update({
        step: args.step,
      });
    } catch (err) {
      term.red(err.stack);
      term.processExit(1);
    }
  });

  events.on(definition.chapter.progress, function onChapterProgress(args) {
    try {
      if (chapterPagesNotAlreadyAdded(args.chapterEvent.chapter, alreadyAddedChapterIDs)) {
        alreadyAddedChapterIDs.push(args.chapterEvent.chapter.id);
        totalImages += args.chapterEvent.chapter.pages.length;
        status.update({
          step: args.step,
          chapters: {
            total: h.exist(args.manga.chapters) ? args.manga.chapters.length : undefined,
            closed: chaptersClosed,
          },
          images: {
            total: totalImages,
            downloading: imageDownloading,
            downloaded: imageDownloaded,
          },
        });
      }
    } catch (err) {
      term.red(err.stack);
      term.processExit(1);
    }
  });

  events.on(definition.chapter.image.downloading, function onImageDownloading(args) {
    try {
      imageDownloading += 1;
      status.update({
        step: args.step,
        chapters: {
          total: h.exist(args.manga.chapters) ? args.manga.chapters.length : undefined,
          closed: chaptersClosed,
        },
        images: {
          total: totalImages,
          downloading: imageDownloading,
          downloaded: imageDownloaded,
        },
      });
    } catch (err) {
      term.red(err.stack);
      term.processExit(1);
    }
  });

  events.on(definition.chapter.image.downloaded, function onImageDownloaded(args) {
    try {
      imageDownloading -= 1;
      imageDownloaded += 1;
      status.update({
        step: args.step,
        chapters: {
          total: h.exist(args.manga.chapters) ? args.manga.chapters.length : undefined,
          closed: chaptersClosed,
        },
        images: {
          total: totalImages,
          downloading: imageDownloading,
          downloaded: imageDownloaded,
        },
      });
    } catch (err) {
      term.red(err.stack);
      term.processExit(1);
    }
  });
}

function chapterPagesNotAlreadyAdded(toCheckChapter, alreadyAddedChapterIDs) {
  if (h.exist(toCheckChapter.pages)) {
    let chapter = alreadyAddedChapterIDs.find(function searchForChapter(chapter) {
      return toCheckChapter.id === chapter.id;
    });
    return !h.exist(chapter);
  }
  return false;
}
