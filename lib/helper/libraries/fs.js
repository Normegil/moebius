'use strict';

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
