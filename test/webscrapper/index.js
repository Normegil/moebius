'use strict';
var test = require('tape');
var pathToLib = '../../lib/';
var load = require(pathToLib + 'webscrapper');

var moduleName = 'WebScrapper Module ';
test(moduleName + 'send an empty array if no scraper plugin found', function(assert) {
  load([], function(err, data) {
    if (err) { assert.fail(err); }
    assert.deepEqual([], data);
    assert.end();
  });
});

test(moduleName + 'send an array with each scrap plugin', function(assert) {
  var expecteds = [
    {
      source: {
        name: 'test',
        website: 'http://www.test.com',
      },
      mangas: [],
    },
    {
      source: {
        name: 'test2',
        website: 'http://www.test2.com',
      },
      mangas: [],
    },
  ];
  load(
    [
      {
        type: 'scraper',
        scrap: function scrap(callback) {
          return callback(null, expecteds[0]);
        },
      },
      {
        type: 'scraper',
        scrap: function scrap(callback) {
          return callback(null, expecteds[1]);
        },
      },
    ],
    function(err, data) {
      if (err) { assert.fail(err); }
      assert.deepEqual(expecteds, data);
      assert.end();
    });
});

test(moduleName + 'don\'t use non-scraper plugin', function(assert) {
  load([{
    type: 'notAScraper',
    scrap: function scrap(callback) {
      return callback(null, {
        field: 'test',
      });
    },
  },], function(err, data) {
    if (err) { assert.fail(err); }
    assert.deepEqual([], data);
    assert.end();
  });
});

test(moduleName + 'send an error if an error occured in a plugin', function(assert) {
  var expectedError = new Error('TestError');
  load([{
    type: 'scraper',
    scrap: function scrap(callback) {
      return callback(null, {
        field: 'test',
      });
    },
  },{
    type: 'scraper',
    scrap: function scrap(callback) {
      return callback(expectedError);
    },
  },], function(err) {
    if (err) {
      assert.equal(expectedError, err);
      assert.end();
    } else {
      assert.fail(new Error('Should have sent back an error'));
      assert.end();
    }
  });
});
