'use strict';

let pathToLib = './';
var fs = require(pathToLib + 'helper').libraries.fs;
var mangaEden = require(pathToLib + 'connector/mangaEden');
var downloadFromURL = require(pathToLib + 'download');

var list = module.exports.list = mangaEden.loadMangas;

module.exports.download = function download(title, path) {
  return new Promise(function download(resolve, reject) {
    console.log('Create manga directory');
    let directory = path + '/' + title + '/';
    fs.mkdir(directory)
      .then(function listManga() {
        console.log('Manga directory created');
        return list();
      }).then(function onListed(mangas) {
        let manga = mangas.find(function findManga(manga) {
          return title === manga.title;
        });
        console.log('Manga found: ' + manga.title);
        return mangaEden.loadChapters(manga.id);
      }).then(function onChaptersLoaded(mangaInfo) {
        console.log('Downloading chapters');
        let promises = mangaInfo.chapters.map(function toPromise(chapter) {
          return downloadChapter(chapter, directory);
        });
        return Promise.all(promises);
      }).then(resolve).catch(reject);
  });
};

function downloadChapter(chapter, path) {
  return new Promise(function downloadChapter(resolve, reject) {
    let directory = path + '/' + chapter.number + '/';
    fs.mkdir(directory)
      .then(function loadPages() {
        return mangaEden.loadPages(chapter.id);
      }).then(function downloadPages(pages) {
        console.log('Download chapter ' + chapter.number);
        let promises = pages.map(function toPromise(page) {
          let splicedURL = page.url.split('.');
          return downloadFromURL(
            page.url,
            directory + page.number + '.' + splicedURL[splicedURL.length - 1]);
        });
        return Promise.all(promises);
      }).then(function onSuccess() {
        console.log('Chapter ' + chapter.number + ' downloaded');
        resolve();
      }).catch(reject);
  });
}
