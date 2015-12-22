'use strict';

let format = require('string-template');
let pathToLib = '../';
let h = require(pathToLib + 'helper');
let request = h.libraries.request;

let mangasUrl = 'https://www.mangaeden.com/api/list/{language}/';
let chaptersAndInfoUrl = 'https://www.mangaeden.com/api/manga/{mangaID}/';
let pagesUrl = 'https://www.mangaeden.com/api/chapter/{chapterID}/';
let imageUrl = 'https://cdn.mangaeden.com/mangasimg/{url}';

module.exports.loadMangas = function loadMangas(language) {
  return new Promise(function loadMangas(resolve, reject) {
    if (!h.exist(language)) {
      language = 'en';
    }

    let languageCode;
    if ('en' === language) {
      languageCode = '0';
    } else if ('it' === language) {
      languageCode = '1';
    } else {
      return reject(new Error('Language not supported: ' + language));
    }

    let url = format(mangasUrl, {language: languageCode});
    request(url)
      .then(function onLoad(response) {
        return JSON.parse(response.body);
      }).then(function onParsed(body) {
        let mangas = body.manga.map(function toObject(manga) {
          return {
            id: manga.i,
            title: manga.t,
            tags: manga.c,
            image: format(imageUrl, {url: manga.im}),
            alias: manga.a,
            status: manga.s,
          };
        });
        resolve(mangas);
      }).catch(reject);
  });
};

module.exports.loadChapters = function loadChapters(mangaID) {
  return new Promise(function loadChapters(resolve, reject) {
    if (!h.exist(mangaID)) {
      reject(new Error('MangaID doesn\'t exist'));
    }
    let url = format(chaptersAndInfoUrl, {mangaID: mangaID});
    request(url)
      .then(function onLoad(response) {
        return JSON.parse(response.body);
      }).then(function onParsed(infos) {
        let chapters = [];
        if (h.exist(infos.chapters)) {
          chapters = infos.chapters.map(function format(chapterArray) {
           return {
             id: chapterArray[3],
             number: chapterArray[0],
             title: chapterArray[2],
             time: new Date(chapterArray[1] * 1000),
           };
         });
        }
        let language;
        if (0 === infos.language) {
          language = 'en';
        } else if (1 === infos.language) {
          language = 'it';
        }
        resolve({
         author: infos.author,
         description: infos.description,
         language: language,
         chapters: chapters,
       });
      }).catch(reject);
  });
};

module.exports.loadPages = function loadPages(chapterID) {
  return new Promise(function loadPages(resolve, reject) {
    if (!h.exist(chapterID)) {
      reject(new Error('ChapterID doesn\'t exist'));
    }
    let url = format(pagesUrl, {chapterID: chapterID});
    let toLog = url;
    request(url)
      .then(function onLoad(response) {
        return JSON.parse(response.body);
      }).then(function onParsed(infos) {
        let images = [];
        if (h.exist(infos.images)) {
          images = infos.images.map(function onImages(imageInfos) {
            return {
              number: imageInfos[0],
              url: format(imageUrl, {url: imageInfos[1]}),
            };
          });
        }
        resolve(images);
      }).catch(function onError(err) {
        console.log(toLog);
        reject(err);
      });
  });
};
