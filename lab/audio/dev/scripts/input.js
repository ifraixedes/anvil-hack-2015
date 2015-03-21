'use strict';

module.exports = start;

function start(getUserMedia) {
  return new Promise(function (resolve, reject) {
    getUserMedia({ audio: true }, function(stream) {
      resolve(accessAccepted(stream));
    }, reject);
  });
}

function accessAccepted(stream) {
}
