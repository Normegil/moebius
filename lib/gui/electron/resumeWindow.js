'use strict';

const path = require('path');
const pathToLib = '../../';
const pathToAssets = path.normalize(__dirname + '/' + pathToLib + '../assets/gui/');
const pathToScreens = path.normalize(pathToAssets + 'screens/');
const log = require(pathToLib + 'logger');
const openDownloadProcessWindow = require('./downloadProcessWindow').open;

const namespace = 'moebius.download.resume.';

module.exports.open = function open(electron, opts) {
  let win = new electron.BrowserWindow({
    width: 640,
    height: 480,
    center: true,

    show: false,
  });

  win.loadURL('file://' + pathToScreens + 'download/resume/index.html');
  win.webContents.on('did-finish-load', function sendInputs() {
    log.info('Sending inputs to main window');
    win.webContents.send(namespace + 'input', {
      mangas: opts.mangas,
      poolSize: opts.poolSize,
      path: opts.path,
    });
    win.show();
  });
  return win;
};

module.exports.registerCommunicationListener = function registerCommunicationListener(electron) {
  let ipc = electron.ipcMain;
  ipc.on(namespace + 'select-folder', function selectFolder(event, inputs) {
    let folders = electron.dialog.showOpenDialog({
      defaultPath: inputs.path,
      properties: [
        'openDirectory',
      ],
    });
    if (undefined !== folders && null !== folders) {
      electron.BrowserWindow.fromId(inputs.id)
        .webContents.send(namespace + 'folder-selected', folders[0]);
    }
  });

  ipc.on(namespace + 'start-download', function selectFolder(event, inputs) {
    electron.BrowserWindow.fromId(inputs.id)
      .close();
    openDownloadProcessWindow(electron, {
      poolSize: inputs.poolSize,
      path: inputs.path,
      toDownload: inputs.toDownload,
    });
  });
};
