'use strict';

let fs = require('fs');
let test = require('tape');
let proxyquire = require('proxyquire');

let resources = {
  manga: {
    english: {
      url: 'https://www.mangaeden.com/api/list/0/',
      content: fs.readFileSync(__dirname + '/loadMangas-English.json'),
      result: [{
        id: '54430be945b9ef3a6d5818cc',
        title: 'Kanai-kun',
        tags: ['Drama', 'Slice of Life'],
        image: 'https://cdn.mangaeden.com/mangasimg/05/05d5df58e440371496b217f94cc4894abeba1671bd9edf0e7cd774a1.jpg',
        alias: 'kanai-kun',
        status: 2,
      },],
    },
    italian: {
      url: 'https://www.mangaeden.com/api/list/1/',
      content: fs.readFileSync(__dirname + '/loadMangas-Italian.json'),
      result: [{
        id: '5492fbbe45b9ef55c2a4f8bb',
        title: 'Tokyo Ghoul:re',
        tags: ['Azione', 'Drama'],
        image: 'https://cdn.mangaeden.com/mangasimg/0f/0f7ce4704e7dfc8c93ec45e7de4a2a82d350d46f007503847a4c9aa5.jpg',
        alias: 'tokyo-ghoulre',
        status: 1,
      },],
    },
    empty: {
      url: 'https://www.mangaeden.com/api/list/empty/',
      content: fs.readFileSync(__dirname + '/loadMangas-Empty.json'),
      result: [],
    },
  },
  chapter: {
    empty: {
      url: 'https://www.mangaeden.com/api/manga/empty/',
      content: fs.readFileSync(__dirname + '/mangaInfo-Empty.json'),
      result: {
        author: undefined,
        chapters: [],
        description: undefined,
        language: undefined,
      },
    },
    classic: {
      url: 'https://www.mangaeden.com/api/manga/54430be945b9ef3a6d5818cc/',
      content: fs.readFileSync(__dirname + '/mangaInfo.json'),
      result: {
        author: 'TANIKAWA Shuntaro',
        description: '&quot;Today Kanai-kun is absent from school.\nKanai-kun has passed away.\n' +
          'Who was Kanai-kun?\nWas he actually here?&quot;\n\nA quiet story about one of the great ' +
          'existential questions in life.\n',
        language: 'en',
        chapters: [{
          id: '5473d04345b9ef823ed0addb',
          number: 0,
          title: '0',
          time: new Date(1416876099.0 * 1000),
        },],
      },
    },
  },
  page: {
    empty: {
      url: 'https://www.mangaeden.com/api/chapter/empty/',
      content: fs.readFileSync(__dirname + '/chapterPages-Empty.json'),
      result: [],
    },
    classic: {
      url: 'https://www.mangaeden.com/api/chapter/4e711cb0c09225616d037cc2/',
      content: fs.readFileSync(__dirname + '/chapterPages.json'),
      result: [
        {
          number: 1,
          url: 'https://cdn.mangaeden.com/mangasimg/5e/5ebeef8b826e14901add625786ecdfb27a3c08556af018f417beb528.jpg',
        },
        {
          number: 0,
          url: 'https://cdn.mangaeden.com/mangasimg/e8/e8f4837666dc2db8e45375d2e5e3f8959c3cf5fa10fded7d77aaa0c9.jpg',
        },
      ],
    },
  },
};

let pathToLib = '../../../lib/';
let mangaEden = proxyquire(
  pathToLib + 'connector/mangaEden',
  {
    '../helper': {
      libraries: {
        request: function(url) {
          return new Promise(function(resolve, reject) {
            let json;
            if (resources.manga.english.url === url) {
              json = resources.manga.english.content;
            } else if (resources.manga.italian.url === url) {
              json = resources.manga.italian.content;
            } else if (resources.manga.empty.url === url) {
              json = resources.manga.empty.content;
            } else if (resources.chapter.classic.url === url) {
              json = resources.chapter.classic.content;
            } else if (resources.chapter.empty.url === url) {
              json = resources.chapter.empty.content;
            } else if (resources.page.empty.url === url) {
              json = resources.page.empty.content;
            } else if (resources.page.classic.url === url) {
              json = resources.page.classic.content;
            } else {
              return reject(new Error('URL Not supported'));
            }
            return resolve({
              headers: {
                statusCode: 200,
              },
              body: json,
            });
          });
        },
      },
    },
  });

let moduleName = 'MangaEden API Module';
let functionName = 'loadMangas()';
test(moduleName + '.' + functionName + ' - Default language is English', function(assert) {
  mangaEden.loadMangas()
    .then(function onLoad(mangas) {
      assert.deepEqual(mangas, resources.manga.english.result);
      assert.end();
    }).catch(function onError(err) {
      assert.end(err);
    });
});
test(moduleName + '.' + functionName + ' - English', function(assert) {
  mangaEden.loadMangas('en')
    .then(function onLoad(mangas) {
      assert.deepEqual(mangas, resources.manga.english.result);
      assert.end();
    }).catch(function onError(err) {
      assert.end(err);
    });
});
test(moduleName + '.' + functionName + ' - Italian', function(assert) {
  mangaEden.loadMangas('it')
    .then(function onLoad(mangas) {
      assert.deepEqual(mangas, resources.manga.italian.result);
      assert.end();
    }).catch(function onError(err) {
      assert.end(err);
    });
});
test(moduleName + '.' + functionName + ' - has correct format', function(assert) {
  mangaEden.loadMangas()
    .then(function onLoad(mangas) {
      assert.deepEqual(mangas, resources.manga.english.result);
      assert.end();
    }).catch(function onError(err) {
      assert.end(err);
    });
});
test(moduleName + '.' + functionName + ' - crash with unknown language', function(assert) {
  mangaEden.loadMangas('fr')
  .then(function onLoad() {
    assert.end(new Error('Should have crashed (Unknown language)'));
  }).catch(function onError() {
    assert.end();
  });
});

functionName = 'loadChapters()';
test(moduleName + '.' + functionName + ' - crash if no id specified', function(assert) {
  mangaEden.loadChapters()
    .then(function onLoad() {
      assert.end(new Error('Should have crashed (No ID specified)'));
    }).catch(function onError() {
      assert.end();
    });
});
test(moduleName + '.' + functionName + ' - has correct format', function(assert) {
  mangaEden.loadChapters('54430be945b9ef3a6d5818cc')
    .then(function onLoad(mangaInfo) {
      assert.deepEqual(mangaInfo, resources.chapter.classic.result);
      assert.end();
    }).catch(function onError(err) {
      assert.end(err);
    });
});
test(moduleName + '.' + functionName + ' - load empty response', function(assert) {
  mangaEden.loadChapters('empty')
    .then(function onLoad(mangaInfo) {
      assert.deepEqual(mangaInfo, resources.chapter.empty.result);
      assert.end();
    }).catch(function onError(err) {
      assert.end(err);
    });
});

functionName = 'loadPages()';
test(moduleName + '.' + functionName + ' - crash if no id specified', function(assert) {
  mangaEden.loadPages()
    .then(function onLoad() {
      assert.end(new Error('Should have crashed (No ID specified)'));
    }).catch(function onError() {
      assert.end();
    });
});
test(moduleName + '.' + functionName + ' - has correct format', function(assert) {
  mangaEden.loadPages('4e711cb0c09225616d037cc2')
    .then(function onLoad(mangaInfo) {
      assert.deepEqual(mangaInfo, resources.page.classic.result);
      assert.end();
    }).catch(function onError(err) {
      assert.end(err);
    });
});
test(moduleName + '.' + functionName + ' - load empty response', function(assert) {
  mangaEden.loadPages('empty')
    .then(function onLoad(mangaInfo) {
      assert.deepEqual(mangaInfo, resources.page.empty.result);
      assert.end();
    }).catch(function onError(err) {
      assert.end(err);
    });
});
