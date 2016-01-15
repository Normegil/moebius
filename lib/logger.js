'use strict';

const bunyan = require('bunyan');
const homeDirectory = require('home-or-tmp');
const mkdirp = require('mkdirp');
const logPath = homeDirectory + '/.moebius/log/';

mkdirp.sync(logPath);

let logger = bunyan.createLogger({
  name: 'mylibrary',
  src: true,
  streams: [
    {
      level: 'info',
      stream: process.stdout,
    }, {
      level: 'trace',
      path: logPath + 'moebius.log.json',
    },
  ],
  serializers: bunyan.stdSerializers,
});

logger.on('error', function handleLoggerErrors(err) {
  if (err) {
    console.error(err.stack);
  }
});

module.exports = logger;
