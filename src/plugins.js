'use strict';

module.exports = {
  uploadCore: {
    // disabled: true,
    name: 'uploadCore',
    plugin: require('./plugins/upload-core')
    // callbacks needed
  },
  uploadPick: {
    // disabled: true,
    name: 'uploadPick',
    plugin: require('./plugins/upload-pick')
    // callbacks needed
  },
  uploadQueue: {
    // disabled: true,
    name: 'uploadQueue',
    plugin: require('./plugins/upload-queue')
    // callbacks needed
  },
  uploadMessage: {
    // disabled: true,
    name: 'uploadMessage',
    plugin: require('./plugins/upload-message')
    // callbacks needed
  }
};
