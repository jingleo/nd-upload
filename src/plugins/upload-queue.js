/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var UploadQueue = require('../modules/upload-queue');
var UploadFile = require('../modules/upload-file');

var MIME_TYPES = require('../vendor/mimetypes');

var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  var uploader = host.getPlugin('uploadCore').exports;

  var uploadQueue = plugin.exports = new UploadQueue({
    parentNode: host.element,
    insertInto: function(element, parentNode) {
      element.prependTo(parentNode);
    }
  }).render();

  var optThumb = uploader.option('thumb');

  function prettySize(size) {
    if (!size) {
      return '';
    }

    var ENUM = [' B', ' KB', ' MB', ' GB', ' TB'];

    var i = 0, kilo = 1024;

    while (size > kilo) {
      size /= kilo;
      i++;
    }

    return size.toFixed(2).replace(/\.00|0$/g, '') + ENUM[i];
  }

  function iconType(type, ext) {
    if (type && (type in MIME_TYPES)) {
      return MIME_TYPES[type];
    }

    if (ext && (ext in MIME_TYPES)) {
      return MIME_TYPES[ext];
    }

    return 'unknown';
  }

  /* helpers */
  function appendFile(file) {
    file.width = optThumb.width;
    file.height = optThumb.height;

    uploadQueue.append(new UploadFile({
      model: file
    }).before('destroy', function() {
      // model === WUFile === file === this.get('model')
      if (file.source) {
        uploader.removeFile(file, true);
      } else {
        host.trigger('fileDequeued', file);
      }
    }).render(), host.getPlugin('uploadPick').exports);
  }

  // 缩略图
  host.on('fileQueued', function(file) {
    file.isImage || (file.isImage = file.type && /^image\//.test(file.type));

    if (file.isImage) {
      if (file.source) {
        uploader.makeThumb(file, function(err, src) {
          file.src = err ? BLANK : src;

          appendFile(file);
        });
      } else {
        appendFile(file);
      }
    }
    // 其它
    else {
      file.name || (file.name = file.src);

      if (!file.ext) {
        file.ext = file.name.match(/\.(.+)?$/);

        if (file.ext && file.ext < 6) {
          file.ext = file.ext[1];
        }
      }

      file.iconType = iconType(file.type, file.ext);
      file.prettySize = prettySize(file.size);

      appendFile(file);
    }
  });

  host.before('destroy', function() {
    uploadQueue.destroy();
  });

  // 已有的图片（场景：如编辑）
  host.get('files').forEach(function(file) {
    host.get('detail')(file, function(file) {
      if ((file.type && /^image\//.test(file.type))) {
        host.get('download')(file, {
          size: 120
        }, function(file) {
          file.isImage = true;
          host.trigger('fileQueued', file);
        });
      } else {
        host.get('download')(file, {
          attachment: true,
          name: file.name
        }, function(file) {
          file.canDownload = true;
          host.trigger('fileQueued', file);
        });
      }
    });
  });

  // 通知就绪
  this.ready();
};
