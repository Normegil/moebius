'use strict';
var test = require('tape');
var pathToLib = '../../lib/';
var h = require(pathToLib + 'helper');

var moduleName = 'Helper ';
test(moduleName + '.exist() on existing object return true', function(assert) {
  assert.equal(true, h.exist({}));
  assert.end();
});

test(moduleName + '.exist() on existing array return true', function(assert) {
  assert.equal(true, h.exist([]));
  assert.end();
});

test(moduleName + '.exist() on existing number return true', function(assert) {
  assert.equal(true, h.exist(3));
  assert.end();
});

test(moduleName + '.exist() on existing string return true', function(assert) {
  assert.equal(true, h.exist(''));
  assert.end();
});

test(moduleName + '.exist() on existing boolean return true', function(assert) {
  assert.equal(true, h.exist(false));
  assert.end();
});

test(moduleName + '.exist() on null return false', function(assert) {
  assert.equal(false, h.exist(null));
  assert.end();
});

test(moduleName + '.exist() on undefined return false', function(assert) {
  assert.equal(false, h.exist(undefined));
  assert.end();
});
