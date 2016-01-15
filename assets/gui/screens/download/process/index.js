'use strict';

const pathToAssets = '../../../';
const pathToRoot = pathToAssets + '../../';
const pathToLib = pathToRoot + 'lib/';

const crypto = require('crypto');
const win = require('remote').getCurrentWindow();
const ipc = require('electron').ipcRenderer;
const h = require(pathToLib + 'helper');
const id = win.id;
const namespace = 'moebius.download.process.';
const emptyColumn = '<td></td>';

let display = {
  refreshTable: function refreshTable(argsArray) {
    let html = argsArray.reduce(function toHTML(memo, args) {
      memo += '<tr id="' + hash(args.manga.title) + '">' + toTableLine(args) + '</tr>';
      return memo;
    }, '');
    $('#manga-statuses').html(html);
  },
  refreshLine: function refreshLine(args) {
    let title = args.manga.title;
    $('#' + hash(title)).html(toTableLine(args));
  },
};

let inputReceived = false;
ipc.on(namespace + 'input', function onInput(event, settings) {
  console.log('Input received');
  if (!inputReceived) {
    inputReceived = true;

    $('#pool-size').text(getPoolSize(settings.poolSize));
    $('#path').text(settings.path);
    $('#manga-number').text(settings.toDownload.length);

    let toDisplay = settings.toDownload.map(function toEntry(manga) {
      return {
        manga: manga,
      };
    });
    display.refreshTable(toDisplay);
  }
});

ipc.on(namespace + 'update', function onUpdate(event, args) {
  display.refreshLine(args);
});
ipc.on(namespace + 'done', function onFinished() {
  console.log('DONE');
  $('#message').text('Download finished');
  $('#message-block').css('display', 'inline');
});
ipc.on(namespace + 'error', function onError(event, err) {
  $('#message').text(err);
  $('#message-block').css('display', 'inline');
});

$('#delete-message').click(function hideMessage() {
  $('#message-block').css('display', 'none');
});
$('#close-window').click(function closeWindow() {
  ipc.send(namespace + 'close-window', {
    id: id,
  });
});

function getPoolSize(givenPoolSize) {
  let poolSize = 'No pool';
  if (h.exist(givenPoolSize) && 0 < Number(givenPoolSize)) {
    poolSize = Number(givenPoolSize);
  }
  return poolSize;
}

function toTableLine(args) {
  let html = '<td>' + args.manga.title + '</td>';
  if (h.exist(args.step)) {
    let stepNumber = args.step.number + 1;
    if (args.step.finalStep) {
      html += '<td>Done</td>';
    } else {
      html += '<td>[' + stepNumber + '/' + args.step.total + '] ' + args.step.next + '</td>';
    }
  } else {
    html += emptyColumn;
  }
  if (h.exist(args.chapters)) {
    html += toCell(args.chapters.total);
  } else {
    html += emptyColumn;
  }
  if (h.exist(args.images)) {
    html += toCell(args.images.downloading);
    let downloaded = 0;
    if (h.exist(args.images.downloaded)) {
      downloaded = args.images.downloaded;
    }
    html += '<td>' + args.images.downloaded + '/' + args.images.total + '</td>';
  } else {
    html += emptyColumn;
    html += emptyColumn;
  }
  return html;
}

function toCell(string) {
  if (!h.exist(string)) {
    return emptyColumn;
  }
  return '<td>' + string + '</td>';
}

function hash(string) {
  let hashAlgorithm = crypto.createHash('sha1');
  hashAlgorithm.update(string);
  return hashAlgorithm.digest('hex');
}
