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
      if (file.type) {
        uploader.removeFile(file, true);
      } else {
        host.trigger('fileDequeued', file);
      }
    }).render());
  }

  // 缩略图
  host.on('fileQueued', function(file) {
    // 来自上传
    if (file.type) {
      // 图片
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
      // 其它
      else {
        appendFile(file);
      }
    }
    // 来自已有（场景：如编辑）
    else {
      appendFile(file);
    }
  });

  // host.before('destroy', function() {
  //   uploadQueue.destroy();
  // });

  (function() {
    var remote = host.get('server').remote;
    var remoteUrl = [remote.host, remote.version, remote.download].join('/');

    function addFile(file, session) {
      host.trigger('fileQueued', {
        id: file.id,
        src: remoteUrl.replace('{session}', session)
                      .replace('{dentryId}', file.value)
      });
    }

    // 已有的图片（场景：如编辑）
    host.get('files').forEach(function(file) {
      // file.value = '24f7d1f5-83d7-4a5a-bc0e-6a3b9dc9faa1';
      if (remote.scope) {
        addFile(file, '');
      } else {
        host.session(function(data) {
          addFile(file, data.session);
        });
      }
    });
  })();

  // 通知就绪
  this.ready();
};
