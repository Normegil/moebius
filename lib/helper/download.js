'use strict';

let request = require('request');
let fs = require('fs');

module.exports = function download(url, fileName, onResponse) {
  return new Promise(function download(resolve, reject) {
    let downloadRequest = request.get(url);
    downloadRequest.on('error', reject);
    if (undefined !== onResponse && null !== onResponse) {
      downloadRequest.on('response', onResponse);
    }
    downloadRequest.pipe(fs.createWriteStream(fileName))
      .on('close', resolve);
  });
};
