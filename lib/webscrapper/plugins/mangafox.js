'use strict';

var async = require('async');
var _ = require('underscore');
var request = require('request');
var cheerio = require('cheerio');

var website = {
  name: 'MangaFox',
  directory: 'http://mangafox.me/manga/',
};

module.exports = {
  type: 'scraper',
  scrap: function scrap(callback) {
    request(website.directory, function onResponseReceived(err, response, html) {
      if (err) {
        return callback(err);
      }
      var $ = cheerio.load(html);
      getListOfManga($, function onMangaListLoaded(err, mangas) {
        return callback(err, {
          source: website,
          mangas: mangas,
        });
      });
    });
  },
};

function getListOfManga($, callback) {
  var mangas = $('#page .series_preview').map(function getInfos() {
    var closed;
    if ($(this).hasClass('manga_open')) {
      closed = false;
    } else if ($(this).hasClass('manga_close')) {
      closed = true;
    }
    return {
      name: $(this).text(),
      link: $(this).attr('href'),
      closed: closed,
    };
  }).get();

  async.map(
    mangas,
    function getTomes(manga, asyncCallback) {
      loadTomes(manga, function onTomesLoaded(err, tomes) {
        if (err) {
          return asyncCallback(err);
        }
        manga.tomes = tomes;
        return asyncCallback(null, manga);
      });
    },
    callback
  );
}

function loadTomes(manga, callback) {
  request(manga.link, function onResponseReceived(err, response, html) {
    if (err) {
      return callback(err);
    }
    loadChapters(html, manga, function onChapterLoaded(err, chapters) {
      if (err) {
        return callback(err);
      }
      createTomeFrom(chapters, callback);
    });
  });
}

function loadChapters(html, manga, callback) {
  var $ = cheerio.load(html);
  var chapters = $('#chapters .tips').map(function loadChapters() {
    var link = $(this).attr('href');
    var subLink = link.replace(manga.link + 'v', '');
    var tomeNumber = subLink.substring(0, subLink.indexOf('/'));
    var chapter = {
      title: $(this).parent().find('.title').text(),
      number: +$(this).text().replace(manga.name + ' ', ''),
      tome: tomeNumber,
      link: link,
    };
    return chapter;
  });

  async.map(
    chapters,
    function getPages(chapter, asyncCallback) {
      loadPages([], chapter.link, function onPagesLoaded(err, pages) {
        if (err) {
          return asyncCallback(err);
        }
        delete chapter.link;
        chapter.pages = pages;
        return asyncCallback(null, chapter);
      });
    },
    callback
  );
}

function createTomeFrom(chapters, callback) {
  var chaptersArrays = _.toArray(_.groupBy(chapters, 'tome'));
  var tomes = _.map(chaptersArrays, function getTomeList(chapterList) {
    return {
      number: _.first(chapterList).tome,
      chapters: chapterList,
    };
  });
  return callback(null, tomes);
}

function loadPages(pages, link, callback) {
  request(link, function onResponseReceived(err, response, html) {
    if (err) {
      return callback(err);
    }
    var $ = cheerio.load(html);
    pages.push({
      picture: $('#image').attr('src'),
    });
    var lastLinkPart = $('#top_bar .next_page').attr('href');
    if (lastLinkPart.match(/\.html$/)) {
      var nextLink = link.substring(0, link.lastIndexOf('/')) + '/' + lastLinkPart;
      loadPages(pages, nextLink, callback);
    } else {
      return callback(null, pages);
    }
  });
}
