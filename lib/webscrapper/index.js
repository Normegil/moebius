'use strict';

var _ = require('underscore');
var async = require('async');

module.exports = function load(plugins, callback) {
  var scraperPlugins = _.filter(plugins, function filter(plugin) {
    return 'scraper' === plugin.type;
  });

  async.map(
    scraperPlugins,
    function scrap(plugin, asyncCallback) {
      plugin.scrap(asyncCallback);
    },
    callback
  );
};
