'use strict';

var async = require('async');
var _ = require('underscore');
var h = require('../../helper');

module.exports = {
  name: 'FullFolder',
  type: 'structure',
  download: function download(toDownload, path, callback) {
    toChapters(
      {
        mangas: toDownload.mangas,
        tomes: toDownload.tomes,
        chapters: toDownload.chapters,
      },
      path,
      function download(err, chapters) {
        if (err) {
          return callback(err);
        }
        async.each(
          chapters,
          function getChapter(chapterAndPath, asyncCallback) {
            downloadChapter(chapterAndPath.chapter, chapterAndPath.path, asyncCallback);
          },
          callback
        );
      });
  },
};

function toChapters(toDownload, path, callback) {
  async.map(
    toDownload.mangas,
    function toChapter(manga, asyncCallback) {
      getChaptersWithPathFromManga(manga, path, asyncCallback);
    },
    function onMangaToChapters(err, mangaChapters) {
      if (err) {
        return callback(err);
      }

      async.map(
        toDownload.tomes,
        function getChaptersWithTome(tome, asyncCallback) {
          var tomePath = path + '/' + tome.manga;
          getChaptersWithPathFromTome(tome, tomePath, asyncCallback);
        },
        function onTomeToChapters(err, tomeChapters) {
          if (err) {
            return callback(err);
          }
          var chaptersWithPath = _.map(toDownload.chapters, function map(chapter) {
            return {
              chapter: chapter,
              path: path + '/' + chapter.manga + '/' + chapter.tome + '/' + chapter.index,
            };
          });
          var chaptersToReturn = _.merge(chaptersWithPath, mangaChapters, tomeChapters);
          return callback(null, chaptersToReturn);
        }
      );
    }
  );
}

function getChaptersWithPathFromManga(manga, path, callback) {
  async.map(
    manga.tomes,
    function getChapters(tome, asyncCallback) {
      getChaptersWithPathFromTome(tome, path + '/' + tome.index, asyncCallback);
    },
    callback
  );
}

function getChaptersWithPathFromTome(tome, path, callback) {
  var chapters = _.map(tome.chapters, function map(chapter) {
    return {
      chapter: chapter,
      path: path + '/' + chapter.index,
    };
  });
  return callback(null, chapters);
}

function downloadChapter(chapter, path, callback) {
  async.each(
    chapter.pages,
    function downloadImage(page, asyncCallback) {
      h.getExtention(page.image, function onExtentionParsed(err, extention) {
        if (err) {
          return asyncCallback(err);
        }
        var finalPath = path + '/' + page.index + '.' + extention;
        h.download(page.picture, finalPath, asyncCallback);
      });
    },
    callback
  );
}
