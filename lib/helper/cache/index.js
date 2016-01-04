'use strict';

let homeDirectory = require('home-or-tmp');

let fs = require('../libraries/fs');
let cachePath = homeDirectory + '/.moebius/cache/';

module.exports.load = function load(filename) {
  return new Promise(function load(resolve, reject) {
    let filePath = cachePath + filename;
    fs.readFile(filePath)
      .then(function onLoaded(data) {
        return JSON.parse(data);
      })
      .then(resolve)
      .catch(reject);
  });
};

module.exports.save = function save(filename, object) {
  return new Promise(function save(resolve, reject) {
    let filePath = cachePath + filename;
    fs.mkdir(cachePath)
      .then(function onCacheDirectoryCreated() {
        return fs.writeFile(filePath, JSON.stringify(object));
      }).then(resolve).catch(reject);
  });
};

module.exports.expire = require('./expiration');
