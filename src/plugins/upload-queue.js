/**
 * @module: nd-upload
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-13 16:12:15
 */

'use strict';

var UploadQueue = require('../modules/upload-queue');
var UploadFile = require('../modules/upload-file');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  var uploader = host.getPlugin('uploadCore').exports;

  var uploadQueue = new UploadQueue({
    parentNode: host.element,
    insertInto: function(element, parentNode) {
      element.prependTo(parentNode);
    }
  }).render();

  /* helpers */
  function appendFile(file) {
    uploadQueue.append(new UploadFile({
      model: file
    }).before('destroy', function() {
      // model === WUFile
      uploader.removeFile(this.get('model'), true);
    }).render());
  }

  host.on('fileQueued', function(file) {
    // 缩略图
    if (/^image\//.test(file.type)) {
      host.getPlugin('uploadCore')
          .exports
          .makeThumb(file, function(err, src) {
            if (err) {
              console.log(err);
            } else {
              file.src = src;
              appendFile(file);
            }
          });
    } else {
      appendFile(file);
    }
  });

  // 通知就绪
  this.ready();
};
