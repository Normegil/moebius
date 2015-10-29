'use strict';
var test = require('tape');
var _ = require('underscore');
var proxyquire = require('proxyquire');
var fs = require('fs');
var pathToLib = '../../../../lib/';

var directoryHtml = fs.readFileSync(__dirname + '/directory.html');
var mangaHtml = fs.readFileSync(__dirname + '/multitome.html');
var firstPageHtml = fs.readFileSync(__dirname + '/firstpage.html');
var middlePageHtml = fs.readFileSync(__dirname + '/middlepage.html');
var lastPageHtml = fs.readFileSync(__dirname + '/lastpage.html');
var mangaPageRegex = /^http:\/\/mangafox\.me\/manga\/.+\/v.+\/c.+\/.+\.html$/i;
var mangaFoxPlugin = proxyquire(
  pathToLib + 'webscrapper/plugins/mangafox',
  {
    request: function(url, callback) {
      var html;
      if ('http://mangafox.me/manga/' === url) {
        html = directoryHtml;
      } else if ('http://mangafox.me/manga/bleach/' === url) {
        html = mangaHtml;
      } else if (url.match(mangaPageRegex)) {
        if ('http://mangafox.me/manga/bleach/v00/c000/1.html' === url) {
          html = firstPageHtml;
        } else if ('http://mangafox.me/manga/bleach/v00/c000/2.html' === url) {
          html = middlePageHtml;
        } else {
          html = lastPageHtml;
        }
      } else {
        return callback(null, null, '');
      }
      return callback(null, null, html);
    },
  });

var moduleName = 'MangaFox ';
test(moduleName + 'is a scraper plugin', function(assert) {
  assert.equal(mangaFoxPlugin.type, 'scraper');
  assert.end();
});

test(moduleName + 'return correct source name', function(assert) {
  mangaFoxPlugin.scrap(function(err, object) {
    if (err) { assert.fail(err); }
    assert.equal(object.source.name, 'MangaFox');
    assert.end();
  });
});
test(moduleName + 'return correct source address', function(assert) {
  mangaFoxPlugin.scrap(function(err, object) {
    if (err) { assert.fail(err); }
    assert.equal(object.source.directory, 'http://mangafox.me/manga/');
    assert.end();
  });
});
test(moduleName + 'can select all mangas from directory', function(assert) {
  mangaFoxPlugin.scrap(function(err, object) {
    if (err) { assert.fail(err); }
    var expecteds = [
      {
        index: 0,
        name: '-6mm no Taboo',
        link: 'http://mangafox.me/manga/6mm_no_taboo/',
        closed: false,
      },
      {
        index: 1,
        name: '-Rain-',
        link: 'http://mangafox.me/manga/rain/',
        closed: true,
      },
      {
        index: 2,
        name: '-SINS-',
        link: 'http://mangafox.me/manga/sins/',
        closed: true,
      },
      {
        index: 3,
        name: '.hack//4koma',
        link: 'http://mangafox.me/manga/hack_4koma/',
        closed: false,
      },
      {
        index: 4,
        name: '17 Sai no Mama',
        link: 'http://mangafox.me/manga/17_sai_no_mama/',
        closed: false,
      },
      {
        index: 5,
        name: 'Area no Kishi',
        link: 'http://mangafox.me/manga/area_no_kishi/',
        closed: false,
      },
      {
        index: 6,
        name: 'Bleach',
        link: 'http://mangafox.me/manga/bleach/',
        closed: false,
      },
      {
        index: 7,
        name: 'Otona to Kodomo no Kyoukaisen',
        link: 'http://mangafox.me/manga/otona_to_kodomo_no_kyoukaisen/',
        closed: true,
      },
    ];

    _.each(expecteds, function(expected) {
      var result = object.mangas[expected.index];
      assert.equal(result.name, expected.name);
      assert.equal(result.link, expected.link);
      assert.equal(result.closed, expected.closed, 'Result doesn\'t correspond [Manga:' + expected.name + ';Expected:' + expected.closed + ';Value:' + result.closed + ']');
    });
    var numberOfMangas = 8;
    assert.equal(numberOfMangas, object.mangas.length);
    assert.end();
  });
});

var testMangaName = 'Bleach';
test(moduleName + 'can load tomes', function(assert) {
  mangaFoxPlugin.scrap(function(err, object) {
    var manga = getManga(object, testMangaName);
    var numberOfTomes = 3;
    assert.equal(manga.tomes.length, numberOfTomes);

    var expecteds = [
      {
        index: 0,
        chapters: 10,
        number: '35',
      },
      {
        index: 1,
        chapters: 15,
        number: 'TBD',
      },
      {
        index: 2,
        chapters: 1,
        number: '00',
      },
    ];

    _.each(expecteds, function(expected) {
      var result = manga.tomes[expected.index];
      assert.equal(expected.chapters, result.chapters.length, 'Tome ' + result.number);
      assert.equal(expected.number, result.number);
    });
    assert.end();
  });
});

test(moduleName + 'can load chapters', function(assert) {
  mangaFoxPlugin.scrap(function(err, object) {
    var manga = getManga(object, testMangaName);
    var tome = getTome(manga, '00');
    var numberOfChapters = 1;
    assert.equal(tome.chapters.length, numberOfChapters);
    var expecteds = [
      {
        index: 0,
        title: 'One shot - Pilot',
        number: 0,
        tome: '00',
      },
    ];
    _.each(expecteds, function(expected) {
      var result = tome.chapters[expected.index];
      assert.equal(expected.title, result.title);
      assert.equal(undefined, result.link);
      assert.equal(expected.number, result.number);
      assert.equal(expected.tome, result.tome);
    });
    assert.end();
  });
});

test(moduleName + 'can load image urls', function(assert) {
  mangaFoxPlugin.scrap(function(err, object) {
    var manga = getManga(object, testMangaName);
    var tome = getTome(manga, '00');
    var chapter = getChapter(tome, 0);
    var expecteds = [
      {
        index: 0,
        picture: 'firstpage_fichiers/k000.jpg',
      },
      {
        index: 1,
        picture: 'middlepage_fichiers/v002.jpg',
      },
      {
        index: 2,
        picture: 'lastpage_fichiers/v030.jpg',
      },
    ];
    _.each(expecteds, function(expected) {
      var result = chapter.pages[expected.index];
      assert.equal(result.picture, expected.picture, 'Index: ' + expected.index);
    });
    assert.end();
  });
});

function getManga(object, name) {
  return _.find(object.mangas, function getManga(manga) {
    return name === manga.name;
  });
}

function getTome(manga, name) {
  return _.find(manga.tomes, function getManga(tome) {
    return name === tome.number;
  });
}

function getChapter(tome, id) {
  return _.find(tome.chapters, function getManga(chapter) {
    return id === chapter.number;
  });
}
