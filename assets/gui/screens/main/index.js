'use strict';

const pathToAssets = '../../';
const pathToRoot = pathToAssets + '../../';
const pathToLib = pathToRoot + 'lib/';
console.log(require('path').normalize(__dirname + '/' + pathToAssets));

const id = require('remote').getCurrentWindow().id;
const ipc = require('electron').ipcRenderer;
const h = require(pathToLib + 'helper');
const app = require(pathToLib + 'app');
const namespace = 'moebius.main.';
const status = {
  toDownload: 'toDownload',
  toAdd: 'toAdd',
};

let display = {
  mangas: [],
  filter: '',
  refresh: function refresh() {
    display.refreshDownloadList();
    display.refreshCollection();
  },
  refreshCollection: function refreshCollection() {
    console.log('Refreshing list of available mangas');
    let mangaCollectionHTML = display.mangas.reduce(function reduce(memo, manga) {
      if (status.toAdd === manga.status && manga.title.indexOf(display.filter) >= 0) {
        memo += '<a href="#!" class="collection-item indigo-text add-manga">' +
          manga.title + '</a>';
      }
      return memo;
    }, '');
    $('#manga-collection').html(mangaCollectionHTML);
  },
  refreshDownloadList: function refreshDownloadList() {
    console.log('Refreshing list of manga to download');
    let mangaCollectionHTML = display.mangas.reduce(function reduce(memo, manga) {
      if (status.toDownload === manga.status) {
        memo += '<a href="#!" class="collection-item black-text remove-manga">' +
          manga.title + '</a>';
      }
      return memo;
    }, '');
    $('#manga-to-download').html(mangaCollectionHTML);
  },
};
let message = {
  set: function setMessage(message, color) {
    console.log('Set message: ' + message + '{color: ' + color + '}');
    let definedColor = 'black';
    if (undefined !== color) {
      definedColor = color;
    }

    let messageEl = $('#message');

    let textClassRegex = /.*-text$/i;
    textClassRegex.exec(messageEl.attr('class')).forEach(function removeClass(textClass) {
      messageEl.removeClass(textClass);
    });

    messageEl.addClass(definedColor + '-text');
    messageEl.html(message);
    $('#delete-message').css('display', 'inline');
  },
  remove: function remove() {
    console.log('Remove message');
    $('#message').html('');
    $('#delete-message').css('display', 'none');
  },
};

let inputReceived = false;
let inputs;
ipc.on(namespace + 'input', function onInput(event, opts) {
  console.log('Input received');
  if (!inputReceived) {
    console.log(opts);
    inputReceived = true;
    inputs = opts;
    display.mangas = opts.mangas.map(toDisplayFormat);
    display.refresh();
  }
});

$('#delete-message').click(function hideErrorMessage() {
  message.remove();
});

$('#search-manga').on('input', function filterMangaCollection() {
  let filter = $('#search-manga').val();
  console.log('Filtering on: ' + filter);
  message.set('Filtering ...');
  display.filter = filter;
  display.refreshCollection();
  message.remove();
});

$('.refresh-manga-collection').click(function refreshCollection() {
  message.set('Loading ...');
  app.list(true)
    .then(function onSuccess(mangaObjects) {
      message.set('Data received. Refreshing manga list ...');
      display.mangas = mangaObjects.map(function toMangaListFormat(mangaObject) {
        let manga = display.mangas.find(function find(manga) {
          return manga.title === mangaObject.title;
        });
        if (undefined !== manga) {
          return manga;
        }
        return toDisplayFormat(manga);
      });
      message.set('Manga list refreshed. Refreshing screen ...');
      display.refreshCollection();
      message.remove();
    }).catch(function onError(err) {
      console.error(err.stack);
      message.set('Could not refresh mangas: ' + err, 'red');
    });
});

$('#manga-collection').on('click', '.add-manga', function addManga(event) {
  let title = $(event.target).text();
  let manga = display.mangas.find(function find(manga) {
    return manga.title === title;
  });
  manga.status = status.toDownload;
  display.refresh();
});

$('#manga-to-download').on('click', '.remove-manga', function removeManga(event) {
  let title = $(event.target).text();
  let manga = display.mangas.find(function find(manga) {
    return manga.title === title;
  });
  manga.status = status.toAdd;
  display.refresh();
});

$('.show-download-resume').click(function showDownloadResumeCli() {
  let toDownload = display.mangas.filter(function filter(manga) {
    return status.toDownload === manga.status;
  });
  if (h.exist(toDownload) && toDownload.length > 0) {
    let toSend = toDownload.map(function getOriginal(manga) {
      return manga.original;
    });
    ipc.send(namespace + 'show-download-resume', {
      id: id,
      mangas: toSend,
      originalInputs: inputs,
    });
    toDownload.forEach(function removeStatus(manga) {
      manga.status = status.toAdd;
    });
    display.refresh();
  } else {
    message.set('Please select some manga to download', 'red');
  }
});

function toDisplayFormat(manga) {
  return {
    title: manga.title,
    status: status.toAdd,
    original: manga,
  };
}
