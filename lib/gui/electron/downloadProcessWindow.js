'use strict';

const path = require('path');
const pathToLib = '../../';
const pathToAssets = path.normalize(__dirname + '/' + pathToLib + '../assets/gui/');
const pathToScreens = path.normalize(pathToAssets + 'screens/');
const log = require(pathToLib + 'logger');
const app = require(pathToLib + 'app');
const h = require(pathToLib + 'helper');

const namespace = 'moebius.download.process.';
module.exports.open = function open(electron, settings) {
  let win = new electron.BrowserWindow({
    width: 640,
    height: 480,
    center: true,

    show: false,
  });
  win.on('closed', function deleteReferenceToWindow() {
    log.info('Download process window closed');
    win = null;
  });

  win.loadURL('file://' + pathToScreens + 'download/process/index.html');

  win.webContents.on('did-finish-load', function sendInputs() {
    log.info('Sending inputs to main window');
    win.webContents.send(namespace + 'input', {
      poolSize: settings.poolSize,
      path: settings.path,
      toDownload: settings.toDownload,
    });

    let messagingFunction = getMessagingFunction(electron, namespace, win.id);
    startDownload(settings.toDownload, {
      poolSize: getPoolSize(settings.poolSize),
      path: getPath(settings.path),
    }, messagingFunction);
    win.show();
  });
  return win;
};

module.exports.registerCommunicationListener =
  function registerCommunicationListener(electron) {
    let ipc = electron.ipcMain;
    ipc.on(namespace + 'close-window', function closeWindow(event, inputs) {
      electron.BrowserWindow.fromId(inputs.id)
        .close();
    });
  };

function startDownload(mangas, settings, updateView) {
  let promises = mangas.map(function getDownloaders(manga) {
    let downloader = app.download(manga.title, settings.path, settings.poolSize);
    manageEvent({
      events: downloader.events,
      definition: app.events,
    }, manga, updateView);
    log.info('Start download of ' + manga.title);
    return downloader.start();
  });
  Promise.all(promises)
    .then(function onSuccess() {
      updateView('done');
    }).catch(function onError(err) {
      updateView('error', err);
    });
}

function manageEvent(eventsDef, manga, updateView) {
  let events = eventsDef.events;
  let definition = eventsDef.definition;

  let imageDownloading = 0;
  let imageDownloaded = 0;
  let totalImages = 0;
  let chaptersClosed = 0;
  let alreadyAddedChapterIDs = [];

  events.on(definition.start, function onStart(args) {
    try {
      updateView('update', {
        manga: manga,
        step: args.step,
      });
    } catch (err) {
      updateView('error', err);
    }
  });
  events.on(definition.progress, function onProgress(args) {
    try {
      updateView('update', {
        manga: manga,
        step: args.step,
        chapters: {
          total: h.exist(args.manga.chapters) ? args.manga.chapters.length : undefined,
        },
      });
    } catch (err) {
      updateView('error', err);
    }
  });
  events.on(definition.close, function onClosed(args) {
    try {
      args.step.finalStep = true;
      updateView('update', {
        manga: manga,
        step: args.step,
      });
    } catch (err) {
      updateView('error', err);
    }
  });

  events.on(definition.chapter.progress, function onChapterProgress(args) {
    try {
      if (chapterPagesNotAlreadyAdded(args.chapterEvent.chapter, alreadyAddedChapterIDs)) {
        alreadyAddedChapterIDs.push(args.chapterEvent.chapter.id);
        totalImages += args.chapterEvent.chapter.pages.length;

        updateView('update', {
          manga: manga,
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
      updateView('error', err);
    }
  });

  events.on(definition.chapter.image.downloading, function onImageDownloading(args) {
    try {
      imageDownloading += 1;
      updateView('update', {
        manga: manga,
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
      updateView('error', err);
    }
  });

  events.on(definition.chapter.image.downloaded, function onImageDownloaded(args) {
    try {
      imageDownloading -= 1;
      imageDownloaded += 1;
      updateView('update', {
        manga: manga,
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
      updateView('error', err);
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

function getMessagingFunction(electron, namespace, winID) {
  return function sendMessage(message, args) {
    electron.BrowserWindow.fromId(winID)
      .webContents.send(namespace + message, args);
  };
}

function getPath(givenPath) {
  let path = './';
  if (h.exist(givenPath)) {
    path = givenPath;
  }
  return path;
}

function getPoolSize(givenPoolSize) {
  let poolSize = -1;
  if (h.exist(givenPoolSize) && 0 < Number(givenPoolSize)) {
    poolSize = Number(givenPoolSize);
  }
  return poolSize;
}
