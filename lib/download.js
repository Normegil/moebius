'use strict';

let request = require('request');
let fs = require('fs');

module.exports = function download(url, fileName) {
  return new Promise(function download(resolve, reject) {
    let downloadRequest = request.get(url);
    downloadRequest.on('error', reject);
    downloadRequest.pipe(fs.createWriteStream(fileName))
      .on('close', resolve);
  });
};
