'use strict';
var test = require('tape');
var pathToLib = '../../lib/';
var structure = require(pathToLib + 'structure');

var moduleName = 'Structure ';
test(moduleName + '.getStructurePlugin() return requested plugin', function(assert) {
  var searchedPlugin = {
    name: 'right',
    type: 'structure',
  };
  structure.getStructurePlugin(
    searchedPlugin.name,
    [
      {
        name: 'wrongNotStruct',
        type: 'notStructure',
      },
      {
        name: 'wrongStruct',
        type: 'structure',
      },
      searchedPlugin,
    ],
    function onPluginFound(err, plugin) {
      if (err) {
        assert.fail(err);
        return assert.end();
      }
      assert.deepEqual(plugin, searchedPlugin);
      return assert.end();
    });
});

test(moduleName + '.getStructurePlugin() with random object', function(assert) {
  structure.getStructurePlugin(
    '',
    [
      {
        notAPlugin: 'wrongStruct',
      },
    ],
    function onPluginFound(err) {
      if (err) {
        return assert.end();
      }
      assert.fail('Should send back an error');
      return assert.end();
    });
});

test(moduleName + '.getStructurePlugin() requested plugin not found', function(assert) {
  structure.getStructurePlugin(
    '',
    [
      {
        name: 'wrongNotStruct',
        type: 'notStructure',
      },
      {
        name: 'wrongStruct',
        type: 'structure',
      },
    ],
    function onPluginFound(err, plugin) {
      if (err) {
        assert.fail(err);
        return assert.end();
      }
      assert.equal(plugin, undefined);
      return assert.end();
    });
});
