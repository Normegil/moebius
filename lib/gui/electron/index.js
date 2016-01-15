'use strict';
let electron = null;
try {
  electron = require('electron');
} catch (err) {
  if (process.argv[0].endsWith('electron')) {
    throw err;
  }
  return;
}
const app = electron.app;

const pathToLib = '../../';
const log = require(pathToLib + 'logger');
const moebiusApplication = require(pathToLib + 'app');
const mainWindow = require('./mainWindow');
const resumeWindow = require('./resumeWindow');
const downloadProcessWindow = require('./downloadProcessWindow');

module.exports = function launchApplication(opts) {
  log.info({opts: opts}, 'Launching GUI');
  app.on('window-all-closed', function quitApplication() {
    log.info('Application exited');
    app.quit();
  });

  app.on('ready', function launchGUI() {
    let shouldUseCache = true;
    if (opts.refresh) {
      shouldUseCache = false;
    }
    moebiusApplication.list(shouldUseCache)
      .then(function onListed(mangas) {
        registerCommunicationListener(electron);
        mainWindow.open(electron, {
          poolSize: opts.poolSize,
          path: opts.path,
          mangas: mangas,
        });
      }).catch(function onError(err) {
        console.error(err.stack);
        app.quit(1);
      });
  });
};

function registerCommunicationListener(electron) {
  mainWindow.registerCommunicationListener(electron);
  resumeWindow.registerCommunicationListener(electron);
  downloadProcessWindow.registerCommunicationListener(electron);
}
