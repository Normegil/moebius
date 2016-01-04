'use strict';

let moment = require('moment');
let fs = require('../libraries/fs');
let homeDirectory = require('home-or-tmp');
let cachePath = homeDirectory + '/.moebius/cache/';

module.exports = expire;

function expire(fileName, period) {
  return new Promise(function execute(resolve, reject) {
    fs.stat(cachePath + '/' + fileName)
      .then(function onStatLoaded(stats) {
        if (isExpired(stats, period)) {
          let error = new Error('File outside of validity period');
          error.code = 'INVALIDTIME';
          throw error;
        }
        return;
      }).then(resolve).catch(reject);
  });
}

function isExpired(time, validityPeriod) {
  let now = moment();
  let startDate = moment().subtract(validityPeriod.number, validityPeriod.type);
  return !startDate.isBefore(time) || !now.isAfter(time);
}
