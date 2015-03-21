'use strict';

require('es6-promise').polyfill();
var helpers = require('./helpers');
var input = require('./input');

var getUserMedia = helpers.hasGetUserMedia();

if (getUserMedia) {
  input(getUserMedia);
} else {
  /* eslint-disable no-alert*/
  alert('getUserMedia() is not supported in your browser');
  /* eslint-enable no-alert*/
}
