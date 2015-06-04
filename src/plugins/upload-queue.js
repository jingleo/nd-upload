/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var UploadQueue = require('../modules/upload-queue');
var UploadFile = require('../modules/upload-file');

var MIME_TYPES = require('../vendor/mimetypes');

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
    if (type) {
      if (type in MIME_TYPES) {
        return MIME_TYPES[type];
      }
    }

    return ext || 'unknown';
  }

  function makeupFile(file, callback) {
    if (/^image\//.test(file.type)) {
      file.isImage = true;
      return callback();
    }

    var image = new Image();
    image.src = file.src;
    image.onerror = function() {
      file.isImage = false;

      file.name || (file.name = file.src);

      if (!file.ext) {
        file.ext = file.name.match(/\.(.+)?$/);
        if (file.ext) {
          file.ext = file.ext[1];
        }
      }

      file.iconType = iconType(file.type, file.ext);
      file.prettySize = prettySize(file.size);

      callback();
    };
    image.onload = function() {
      file.isImage = true;
      callback();
    };
  }

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
    makeupFile(file, function() {
      // 图片
      if (file.isImage) {
        uploader.makeThumb(file, function(err, src) {
          file.src = err ? BLANK : src;

          appendFile(file);
        });
      }
      // 其它
      else {
        appendFile(file);
      }
    });
  });

  host.before('destroy', function() {
    uploadQueue.destroy();
  });

  // 已有的图片（场景：如编辑）
  host.get('files').forEach(function(file) {
    host.getRemoteURL(file, function(file) {
      host.trigger('fileQueued', {
        id: file.id,
        src: file.src
      });
    }, 120);
  });

  // 通知就绪
  this.ready();
};
