'use strict';
let test = require('tape');
let pathToLib = '../../lib/';
let h = require(pathToLib + 'helper');

let moduleName = 'Helper';
let functionName = 'exist()';
test(moduleName + '.' + functionName + ' - on existing object return true', function(assert) {
  assert.equal(true, h.exist({}));
  assert.end();
});

test(moduleName + '.' + functionName + ' - on existing array return true', function(assert) {
  assert.equal(true, h.exist([]));
  assert.end();
});

test(moduleName + '.' + functionName + ' - on existing number return true', function(assert) {
  assert.equal(true, h.exist(3));
  assert.end();
});

test(moduleName + '.' + functionName + ' - on existing string return true', function(assert) {
  assert.equal(true, h.exist(''));
  assert.end();
});

test(moduleName + '.' + functionName + ' - on existing boolean return true', function(assert) {
  assert.equal(true, h.exist(false));
  assert.end();
});

test(moduleName + '.' + functionName + ' - on null return false', function(assert) {
  assert.equal(false, h.exist(null));
  assert.end();
});

test(moduleName + '.' + functionName + ' - on undefined return false', function(assert) {
  assert.equal(false, h.exist(undefined));
  assert.end();
});
