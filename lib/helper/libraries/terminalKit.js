'use strict';

module.exports.getCursorLocation = function getCursorLocation(term) {
  return new Promise(function getCursorLocation(resolve, reject) {
    term.getCursorLocation(function onLocationLoaded(err, x, y) {
      if (err) {
        return reject(err);
      }
      return resolve({
        x: x,
        y: y,
      });
    });
  });
};
