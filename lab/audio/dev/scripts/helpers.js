'use strict';

module.exports = {
  hasGetUserMedia: hasGetUserMedia
};

function hasGetUserMedia() {
  var getter = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia || null;

  if (getter) {
    getter = getter.bind(navigator);
  }

  return getter;
}
