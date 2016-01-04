'use strict';

let fs = require('fs');
let mkdirp = require('mkdirp');

module.exports.mkdir = function mkdir(path) {
  return new Promise(function mkdir(resolve, reject) {
    mkdirp(path, function onCreated(err) {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
};

module.exports.writeFile = function writeFile(path, object) {
  return new Promise(function writeFile(resolve, reject) {
    fs.writeFile(path, object, 'utf8', function callback(err) {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
};

module.exports.readFile = function readFile(path) {
  return new Promise(function writeFile(resolve, reject) {
    fs.readFile(path, 'utf8', function callback(err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

module.exports.stat = function stat(path) {
  return new Promise(function stat(resolve, reject) {
    fs.stat(path, function callback(err, stat) {
      if (err) {
        return reject(err);
      }
      return resolve(stat);
    });
  });
};
