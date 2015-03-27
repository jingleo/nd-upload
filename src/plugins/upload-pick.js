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

  if (maxcount) {
    host.on('fileQueued fileDequeued', function() {
      var count = uploader.getFiles().length;

      pickElem.css((count < maxcount) ? {
        top: 'auto'
      } : {
        top: '-99999px'
      });

      host.get('trigger').value = count ? 'fake' : '';
    });
  }

  // 通知就绪
  this.ready();
};
