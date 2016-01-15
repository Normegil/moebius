'use strict';

const pathToLib = './lib/';

const program = require('commander');
const launchElectron = require(pathToLib + 'gui').electron;
const h = require(pathToLib + 'helper');

program
  .usage('[options]')
  .option('-p, --path <path>', 'Indicate the default path (can be changed in the GUI) ' +
    'where to save downloaded files')
  .option('-r, --refresh', 'Don\'t load from cache and refresh it instead')
  .option('--pool <size>', 'Set the default download pool size (can be changed in the GUI). ' +
    'Defaults to 10. Set to 0 to disable. If it\'s set too high, ' +
    'you risk to encounter a timeout while downloading')
  .parse(process.argv);

let poolSize;
if (h.exist(program.pool)) {
  poolSize = Number(program.pool);
}

launchElectron({
  poolSize: poolSize,
  path: program.path,
  refresh: program.refresh,
});
