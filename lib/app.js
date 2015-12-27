'use strict';

let pathToLib = './';
let connector = require(pathToLib + 'connector/mangaEden');
let mangaDownloader = require(pathToLib + 'downloader').manga;

module.exports.events = mangaDownloader.events;

module.exports.list = connector.loadMangas;
module.exports.download = mangaDownloader.download;
