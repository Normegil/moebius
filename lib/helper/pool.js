'use strict';

module.exports = function pool(functionToExecute, optionsArray, size) {
  return new Promise(function pool(resolve, reject) {
    let optsPools = split(size, optionsArray);
    let promises = optsPools.map(function toPromise(optionsArray) {
      return toPromiseSerie(optionsArray, functionToExecute);
    });
    Promise.all(promises).then(resolve).catch(reject);
  });
};

function toPromiseSerie(optionsArray, toExecute) {
  return new Promise(function toPromiseSerie(resolve, reject) {
    let promise = optionsArray.reduce(function toPromise(memo, options) {
      return memo.then(function executeNext() {
        return toExecute(options);
      });
    }, Promise.resolve());
    promise.then(resolve).catch(reject);
  });
}

function split(poolSize, optionsArray) {
  return optionsArray.reduce(function reduce(memo, options, index) {
    let numberOfElements = optionsArray.length / poolSize;
    let floatIndex = index / numberOfElements;
    let j = Math.floor(floatIndex);
    if (undefined === memo[j] || null === memo[j]) {
      memo[j] = [];
    }
    memo[j].push(options);
    return memo;
  }, []);
}
