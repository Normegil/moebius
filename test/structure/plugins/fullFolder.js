'use strict';
var test = require('tape');
var pathToLib = '../../lib/';
var plugin = require(pathToLib + 'plugins/FullFolder');

var moduleName = 'FullFolder ';
test(moduleName + 'name is fullfolder', function(assert) {
  assert.equal('FullFolder', plugin.name);
  assert.end();
});

test(moduleName + 'type is structure', function(assert) {
  assert.equal('structure', plugin.type);
  assert.end();
});

test(moduleName + '.download()', function(assert) {
  assert.end();
});
