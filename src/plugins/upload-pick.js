/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var __ = require('nd-i18n');
var $ = require('nd-jquery');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  var uploader = host.getPlugin('uploadCore').exports;

  var pickElem = plugin.exports = $('<div class="ui-upload-pick"></div>');

  var uploadQueue = host.getPlugin('uploadQueue').exports;

  uploader
    .addButton($.extend(true, {
      id: uploadQueue ? uploadQueue.element[0] : host.element[0],
      innerHTML: host.get('trigger').placeholder || __('＋'),
      button: pickElem,
      multiple: host.get('multiple'),
      // 移除默认 name="file"
      name: null
    }, host.get('pick')));

  var maxcount = host.get('maxcount');

  // 文件最大数限制
  var files = host.get('files');

  function togglePick() {
    pickElem.toggleClass(
      'webuploader-element-invisible', files.length >= maxcount);

    host.set('value', files.length ? 'fake' : '');
  }

  host.on('fileQueued', function(file) {
    // 来自文件系统选取
    if (file.source) {
      files.push({
        source: file.source,
        id: file.id
      });
    }

    maxcount && togglePick();
  });

  host.on('fileDequeued', function(file) {
    host.removeFile(file.id);

    maxcount && togglePick();
  });

  // 通知就绪
  this.ready();
};
