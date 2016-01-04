'use strict';

let EventEmitter = require('events').EventEmitter;
let pathToLib = '../';
let fs = require(pathToLib + 'helper').libraries.fs;
let connector = require(pathToLib + 'connector/mangaEden');
let h = require(pathToLib + 'helper');
let PromisePool = require('es6-promise-pool');
const extend = require('deep-extend');

let steps = [
  'Create Directory',
  'Loading pages',
  'Download Images',
  'Done',
];

let events = module.exports.events = {
  start: 'start',
  close: 'close',
  progress: 'progress',
  image: {
    downloading: 'image-downloading',
    downloaded: 'image-downloaded',
  },
};

module.exports.download = function downloadChapter(givenChapter, path, poolSize) {
  let emitter = new EventEmitter();
  let chapter = extend({}, givenChapter);
  return {
    events: emitter,
    start: function start() {
      return new Promise(function start(resolve, reject) {
        let directory = path + '/' + chapter.number + '/';
        let step = 0;
        emitter.emit(events.start, {
          directory: directory,
          chapter: chapter,
          step: {
            number: step,
            total: steps.length,
            next: steps[step],
          },
        });
        fs.mkdir(directory)
          .then(function loadPages() {
            step += 1;
            emitter.emit(events.progress, {
              directory: directory,
              chapter: chapter,
              step: {
                number: step,
                total: steps.length,
                done: steps[step - 1],
                next: steps[step],
              },
            });
            return connector.loadPages(chapter.id);
          }).then(function downloadPages(pages) {
            step += 1;
            chapter = extend(chapter, {pages: pages});
            let stepInfo = {
              number: step,
              total: steps.length,
              done: steps[step - 1],
              next: steps[step],
            };
            emitter.emit(events.progress, {
              directory: directory,
              chapter: chapter,
              step: stepInfo,
            });
            let optionsArray = pages.map(function toPromise(page) {
              let fileName = directory + page.number + '.' + h.getExtention(page.url);
              return {
                url: page.url,
                fileName: fileName,
                onClosed: function onClosed() {
                  emitter.emit(events.image.downloaded, {
                    chapter: chapter,
                    image: {
                      url: page.url,
                      fileName: fileName,
                    },
                    directory: directory,
                    step: stepInfo,
                  });
                },
                onResponse: function onResponse() {
                  emitter.emit(events.image.downloading, {
                    chapter: chapter,
                    image: {
                      url: page.url,
                      fileName: fileName,
                    },
                    directory: directory,
                    step: stepInfo,
                  });
                },
              };
            });

            if (poolSize > 0) {
              let pool = new PromisePool(function* promiseProducer() {
                for (let options of optionsArray) {
                  yield h.download(options);
                }
              }, poolSize);
              return pool.start();
            }

            let promises = optionsArray.map(function toPromise(options) {
              return h.download(options);
            });
            return Promise.all(promises);
          }).then(function onSuccess() {
            emitter.emit(events.close, {
              directory: directory,
              chapter: chapter,
              step: {
                number: step,
                done: steps[step],
                total: steps.length,
              },
            });
            return resolve();
          }).catch(reject);
      });
    },
  };
};
