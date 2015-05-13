/**
 * @module: nd-upload
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-13 16:12:15
 */

'use strict';

var $ = require('jquery');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  var uploader = host.getPlugin('uploadCore').exports;

  var pickElem = $('<div class="ui-upload-pick"></div>');

  uploader
    .addButton($.extend(true, {
      id: host.element[0],
      innerHTML: '选择',
      button: pickElem,
      multiple: host.get('multiple'),
      // 移除默认 name="file"
      name: null
    }, host.get('pick')));

  var maxcount = host.get('maxcount');

  // 文件最大数限制
  if (maxcount) {
    (function() {
      var files = host.get('files');

      function togglePick() {
        pickElem.toggleClass(
          'webuploader-element-invisible', files.length >= maxcount);

        host.set('value', files.length ? 'fake' : '');
      }

      host.on('fileQueued', function(file) {
        if (file.type) {
          files.push({
            id: file.id
          });
        }

        togglePick();
      });

      host.on('fileDequeued', function(file) {
        host.removeFile(file.id);

        togglePick();
      });
    })();
  }

  // 通知就绪
  this.ready();
};
