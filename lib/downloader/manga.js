'use strict';

let EventEmitter = require('events').EventEmitter;
let pathToLib = '../';
let fs = require(pathToLib + 'helper').libraries.fs;
let connector = require(pathToLib + 'connector/mangaEden');
let chapterLib = require('./chapter');
const extend = require('deep-extend');

let steps = [
  'Create Directory',
  'Load mangas',
  'Load manga infos',
  'Download chapters',
];

let eventsDefinition = module.exports.events = {
  start: 'start',
  close: 'close',
  progress: 'progress',
  chapter: {
    start: 'start-chapter',
    close: 'close-chapter',
    progress: 'progress-chapter',
    imageDownloaded: 'image-downloaded',
  },
};

module.exports.download = function download(title, path) {
  let emitter = new EventEmitter();
  return {
    events: emitter,
    start: function start() {
      return new Promise(function start(resolve, reject) {
        let directory = path + '/' + title + '/';
        let step = 0;
        let manga;
        emitter.emit(eventsDefinition.start, {
          directory: directory,
          manga: {
            title: title,
          },
          step: {
            number: step,
            total: steps.length,
            next: steps[step],
          },
        });
        fs.mkdir(directory)
          .then(function listManga() {
            step += 1;
            emitter.emit(eventsDefinition.progress, {
              directory: directory,
              manga: {
                title: title,
              },
              step: {
                number: step,
                total: steps.length,
                done: steps[step - 1],
                next: steps[step],
              },
            });
            return connector.loadMangas();
          }).then(function onListed(mangas) {
            manga = mangas.find(function findManga(manga) {
              return title === manga.title;
            });
            step += 1;
            emitter.emit(eventsDefinition.progress, {
              manga: manga,
              step: {
                number: step,
                total: steps.length,
                done: steps[step - 1],
                next: steps[step],
              },
            });
            return connector.loadChapters(manga.id);
          }).then(function onChaptersLoaded(mangaInfo) {
            step += 1;
            manga = extend(manga, mangaInfo);
            emitter.emit(eventsDefinition.progress, {
              manga: manga,
              step: {
                number: step,
                total: steps.length,
                done: steps[step - 1],
                next: steps[step],
              },
            });
            let promises = mangaInfo.chapters.map(function toPromise(chapter) {
              let downloader = chapterLib.download(chapter, directory);
              manageEvents({
                manga: manga,
                emitter: emitter,
                step: {
                  number: step,
                  total: steps.length,
                  next: steps[step],
                },
              }, downloader.events);
              return downloader.start();
            });
            return Promise.all(promises);
          }).then(function onSuccess() {
            emitter.emit(eventsDefinition.close, {
              manga: manga,
              step: {
                number: step,
                total: steps.length,
                done: steps[step],
              },
            });
            resolve();
          }).catch(reject);
      });
    },
  };
};

function manageEvents(mangaOpts, events) {
  let chapterEventsDef = chapterLib.events;
  events.on(chapterEventsDef.start, function onProgress(args) {
    sendEvent(mangaOpts.emitter, eventsDefinition.chapter.start, {
      manga: mangaOpts.manga,
      step: mangaOpts.step,
      chapterEvent: args,
    });
  });
  events.on(chapterEventsDef.progress, function onProgress(args) {
    sendEvent(mangaOpts.emitter, eventsDefinition.chapter.progress, {
      manga: mangaOpts.manga,
      step: mangaOpts.step,
      chapterEvent: args,
    });
  });
  events.on(chapterEventsDef.close, function onProgress(args) {
    sendEvent(mangaOpts.emitter, eventsDefinition.chapter.close, {
      manga: mangaOpts.manga,
      step: mangaOpts.step,
      chapterEvent: args,
    });
  });
  events.on(chapterEventsDef.imageDownloaded, function onProgress(args) {
    sendEvent(mangaOpts.emitter, eventsDefinition.chapter.imageDownloaded, {
      manga: mangaOpts.manga,
      step: mangaOpts.step,
      chapterEvent: args,
    });
  });
}

function sendEvent(emitter, eventDef, options) {
  try {
    emitter.emit(eventDef, options);
  } catch (err) {
    console.error(err);
  }
}
