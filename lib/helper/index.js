'use strict';

var fs = require('fs');
var request = require('request');

module.exports.exist = function exist(object) {
  return undefined !== object && null !== object;
};

module.exports.download = function exist(uri, path, callback) {
  request.head(uri, function onHead(err) {
    if (err) {
      return callback(err);
    }
    request(uri).pipe(fs.createWriteStream(path).on('error', function onError(err) {
      if (err) {
        return callback(err);
      }
    })).on('close', function onClose() {
      return callback(null);
    });
  });
};

module.exports.getExtention = function getExtention(path, callback) {
  var extention = path
    .split('.')
    .pop();
  return callback(null, extention);
};

module.exports.libraries = require('./libraries');
