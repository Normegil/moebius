'use strict';

module.exports.exist = function exist(object) {
  return undefined !== object && null !== object;
};
