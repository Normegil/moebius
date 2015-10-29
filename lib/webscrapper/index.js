'use strict';

var _ = require('underscore');
var async = require('async');

module.exports = function load(options, callback) {
  var plugins = _.filter(options.plugins, function filter(plugin) {
    return 'scraper' === plugin.type;
  });

  async.map(
    plugins,
    function scrap(plugin, asyncCallback) {
      plugin.scrap(asyncCallback);
    },
    callback
  );
};
