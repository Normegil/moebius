'use strict';

const pathToAssets = '../../../';
const pathToRoot = pathToAssets + '../../';
const pathToLib = pathToRoot + 'lib/';

const win = require('remote').getCurrentWindow();
const ipc = require('electron').ipcRenderer;
const h = require(pathToLib + 'helper');
/* globals storage */
const id = win.id;

const namespace = 'moebius.download.resume.';
const status = {
  toDownload: 'toDownload',
  removed: 'removed',
};
let display = {
  mangas: [],
  refresh: function refresh() {
    let html = display.mangas.filter(function filterRemoved(manga) {
      return status.toDownload === manga.status;
    }).reduce(function toHTML(memo, manga) {
      memo += '<a href="#!" class="collection-item">' + manga.title + '</a>';
      return memo;
    }, '');
    $('#download-list').html(html);
  },
};

let inputReceived = false;
ipc.on(namespace + 'input', function onInput(event, inputs) {
  console.log('Input received');
  console.log(inputs);
  if (!inputReceived) {
    inputReceived = true;

    initSettings({
      poolSize: inputs.poolSize,
      path: inputs.path,
    });

    display.mangas = inputs.mangas.map(function toDisplayFormat(manga) {
      return {
        title: manga.title,
        status: status.toDownload,
        original: manga,
      };
    });
    display.refresh();
  }
});

ipc.on(namespace + 'folder-selected', function onInput(event, folder) {
  console.log('Folder received: ' + folder);
  if (undefined !== folder && null !== folder) {
    $('#path').val(folder);
  }
});

$('.start-download').click(function downloadList() {
  let toDownload = display.mangas.filter(function reset(manga) {
    return status.toDownload === manga.status;
  }).map(function getOriginal(manga) {
    return manga.original;
  });
  let poolSize = getPoolSize();
  let path = getPath();
  storage.set('settings', {
    poolSize: poolSize,
    path: path,
  });
  ipc.send(namespace + 'start-download', {
    id: id,
    poolSize: poolSize,
    path: path,
    toDownload: toDownload,
  });
});

$('.reset-list').click(function resetList() {
  display.mangas = display.mangas.map(function reset(manga) {
    manga.status = status.toDownload;
    return manga;
  });
  display.refresh();
});

$('#download-list').on('click', '.collection-item', function removeManga(event) {
  let title = $(event.target).text();
  console.log('Remove: ' + title);
  let manga = display.mangas.find(function find(manga) {
    return manga.title === title;
  });
  manga.status = status.removed;
  display.refresh();
});

$('.cancel-download').click(function closeWindow() {
  win.close();
});

$('.folder-selector').click(function selectFolder() {
  let path = getPath();
  ipc.send(namespace + 'select-folder', {
    id: id,
    path: path,
  });
});

function getPoolSize() {
  let poolSize = -1;
  let value = $('#pool-size').val();
  if (undefined !== value && null !== value) {
    poolSize = value;
  }
  return poolSize;
}

function getPath() {
  let path = './';
  let value = $('#path').val();
  if (undefined !== value && null !== value) {
    path = value;
  }
  return path;
}

function initSettings(opts) {
  let settings = storage.get('settings');

  let poolSize;
  if (h.exist(opts.poolSize)) {
    poolSize = opts.poolSize;
  } else if (h.exist(settings)) {
    poolSize = settings.poolSize;
  }
  $('#pool-size').val(poolSize);

  let path;
  if (h.exist(opts.path) && './' !== opts.path) {
    path = opts.path;
  } else if (h.exist(settings) && './' !== settings.path) {
    path = settings.path;
  }
  $('#path').val(path);
}
