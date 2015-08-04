'use strict';

module.exports = [
  {
    name: 'uploadCore',
    starter: require('./plugins/upload-core')
  },
  {
    name: 'uploadQueue',
    starter: require('./plugins/upload-queue')
  },
  {
    name: 'uploadPick',
    starter: require('./plugins/upload-pick')
  },
  {
    name: 'uploadProgress',
    starter: require('./plugins/upload-progress')
  },
  {
    name: 'uploadMessage',
    starter: require('./plugins/upload-message')
  }
];
