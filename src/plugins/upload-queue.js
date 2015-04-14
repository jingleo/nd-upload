/**
 * @module: nd-upload
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-13 16:12:15
 */

'use strict';

var UploadQueue = require('../modules/upload-queue');
var UploadFile = require('../modules/upload-file');

var BLANK = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D';

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

  var optThumb = uploader.option('thumb');

  /* helpers */
  function appendFile(file) {
    file.width = optThumb.width;
    file.height = optThumb.height;

    uploadQueue.append(new UploadFile({
      model: file
    }).before('destroy', function() {
      // model === WUFile === file === this.get('model')
      if (/^image\//.test(file.type)) {
        uploader.removeFile(file, true);
      } else {
        host.trigger('fileDequeued', file);
      }
    }).render());
  }

  // 缩略图
  host.on('fileQueued', function(file) {
    // 来自上传
    if (/^image\//.test(file.type)) {
      uploader.makeThumb(file, function(err, src) {
        if (err) {
          file.src = BLANK;
        } else {
          file.src = src;
        }

        appendFile(file);
      });
    }
    // 来自已有
    else {
      appendFile(file);
    }
  });

  // host.before('destroy', function() {
  //   uploadQueue.destroy();
  // });

  (function() {
    // 已有的图片
    var files = host.get('files');
    var n = files.length;

    if (n) {
      var i;

      for (i = 0; i < n; i++) {
        host.trigger('fileQueued', {
          id: files[i].id,
          src: files[i].value
        });
      }
    }
  })();

  // 通知就绪
  this.ready();
};
