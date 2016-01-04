'use strict';

let request = require('request');
let fs = require('fs');

module.exports = function download(options) {
  return new Promise(function download(resolve, reject) {
    let downloadRequest = request.get(options.url);
    downloadRequest.on('error', reject);
    if (undefined !== options.onResponse && null !== options.onResponse) {
      downloadRequest.on('response', options.onResponse);
    }
    downloadRequest.pipe(fs.createWriteStream(options.fileName))
      .on('close', function onClosed() {
        if (undefined !== options.onClosed && null !== options.onClosed) {
          options.onClosed();
        }
        resolve();
      });
  });
};
