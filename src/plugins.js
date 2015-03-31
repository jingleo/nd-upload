'use strict';

module.exports = {
  uploadCore: {
    name: 'uploadCore',
    plugin: require('./plugins/upload-core')
  },
  uploadPick: {
    name: 'uploadPick',
    plugin: require('./plugins/upload-pick')
  },
  uploadQueue: {
    name: 'uploadQueue',
    plugin: require('./plugins/upload-queue')
  },
  uploadMessage: {
    name: 'uploadMessage',
    plugin: require('./plugins/upload-message')
  }
};
