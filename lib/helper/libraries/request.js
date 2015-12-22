'use strict';

let request = require('request');

module.exports = function requestAsPromise(url) {
  return new Promise(function requestAsPromise(resolve, reject) {
    request({uri: url, time: true}, function onRequest(err, headers, body) {
      if (err) {
        return reject(err);
      }
      if (200 !== headers.statusCode) {
        return reject(new Error('Status is not ok: ' + headers.statusCode));
      }
      return resolve({
        headers: headers,
        body: body,
      });
    });
  });
};
