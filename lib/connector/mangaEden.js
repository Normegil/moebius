'use strict';

let format = require('string-template');
let pathToLib = '../';
let h = require(pathToLib + 'helper');
let request = h.libraries.request;

let mangasUrl = 'https://www.mangaeden.com/api/list/{language}/';
let chaptersAndInfoUrl = 'https://www.mangaeden.com/api/manga/{mangaID}/';
let pagesUrl = 'https://www.mangaeden.com/api/chapter/{chapterID}/';
let imageUrl = 'https://cdn.mangaeden.com/mangasimg/{url}';

let cache = {
  name: 'mangaEden-{language}.json',
  expiration: {
    number: 5,
    type: 'days',
  },
};

module.exports.loadMangas = function loadMangas(useCache, language) {
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

    if (useCache) {
      let cacheName = format(cache.name, {language: languageCode});
      return h.cache.expire(cacheName, cache.expiration).then(function loadFromCache() {
        return h.cache.load(cacheName);
      }).catch(function onError(err) {
        if ('ENOENT' === err.code || 'INVALIDTIME' === err.code) {
          return requestMangas(languageCode);
        }
        throw err;
      }).then(resolve).catch(reject);
    }
    return requestMangas(languageCode).then(resolve).catch(reject);
  });
};

function requestMangas(languageCode) {
  return new Promise(function requestMangas(resolve, reject) {
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
        return mangas;
      }).then(function saveToCache(mangas) {
        let cacheName = format(cache.name, {language: languageCode});
        h.cache.save(cacheName, mangas);
        return mangas;
      }).then(resolve).catch(reject);
  });
}

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
        reject(err);
      });
  });
};
