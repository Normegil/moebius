'use strict';

var loadPlugins = require('plugin-system');
var getWebContent = require('../webscrapper');

var pluginPaths = [
  __dirname + '/../webscrapper/plugins/',
  __dirname + '/../structure/plugins/',
];

var list = module.exports = function list(customPlugins, callback) {
  loadPlugins(
    {
      path: pluginPaths,
      custom: customPlugins,
    },
    function onPluginLoaded(err, plugins) {
      if (err) {
        return callback(err);
      }
      getWebContent(
        {
          plugins: plugins,
        },
        callback);
    });
};

module.exports = function download(options, callback) {
  list(options, function onListed(err, data) {
    // Call structure
      // Structure call download
        // Structure create folders & save file
  });
};
