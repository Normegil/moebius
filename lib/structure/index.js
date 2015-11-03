'use strict';

var _ = require('underscore');
var h = require('../helper');

module.exports.getStructurePlugin = function getStructurePlugin(structureName, plugins, callback) {
  for (var i = 0;i < plugins.length;i++) {
    var pluginToCheck = plugins[i];
    if (!h.exist(pluginToCheck.type) || !h.exist(pluginToCheck.name)) {
      return callback(new Error(
        'An object wich is not a plugin ' +
        '(or doesn\'t complie to plugin interface detected [Invalid: ' + pluginToCheck + ']')
      );
    }
  }

  var plugin = _.chain(plugins)
    .filter(function isStructurePlugin(plugin) {
      return 'structure' === plugin.type;
    })
    .reduce(function getPluginByName(memo, plugin) {
      if (h.exist(memo)) {
        return memo;
      } else if (structureName === plugin.name) {
        return plugin;
      } else {
        return undefined;
      }
    }, undefined)
    .value();
  return callback(null, plugin);
};
