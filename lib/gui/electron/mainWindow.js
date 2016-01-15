'use strict';

const path = require('path');
const pathToLib = '../../';
const pathToAssets = path.normalize(__dirname + '/' + pathToLib + '../assets/gui/');
const pathToScreens = path.normalize(pathToAssets + 'screens/');
const log = require(pathToLib + 'logger');
const openResumeWindow = require('./resumeWindow').open;

const namespace = 'moebius.main.';
module.exports.open = function open(electron, opts) {
  log.info({opts: {poolSize: opts.poolSize, path: opts.path}}, 'Creating main window');
  let win = new electron.BrowserWindow({
    center: true,
    icon: pathToAssets + 'icon.png',

    show: false,

    width: 800,
    height: 600,
  });
  win.on('closed', function deleteReferenceToWindow() {
    log.info('Main window closed');
    win = null;
  });
  win.maximize();

  let pathToMainWindow = path.normalize(pathToScreens + 'main/index.html');
  win.loadURL('file://' + pathToMainWindow);
  win.webContents.on('did-finish-load', function sendInputs() {
    log.info('Sending inputs to main window');
    win.webContents.send(namespace + 'input', opts);
    win.show();
  });
  return win;
};

module.exports.registerCommunicationListener = function registerCommunicationListener(electron) {
  electron.ipcMain.on(namespace + 'show-download-resume',
    function showDownloadResume(event, opts) {
      openResumeWindow(electron, {
        mangas: opts.mangas,
        poolSize: opts.originalInputs.poolSize,
        path: opts.originalInputs.path,
      });
    });
};
