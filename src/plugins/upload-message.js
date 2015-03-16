/**
 * @module: nd-upload
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-13 16:12:15
 */

'use strict';

var $ = require('jquery');

function sizePrettify(size) {
  var ENUM = [' B', ' KB', ' MB', ' GB', ' TB'];

  var i = 0, kilo = 1024;

  while (size > kilo) {
    size /= kilo;
    i++;
  }

  return size.toFixed(2).replace(/\.00|0$/g, '') + ENUM[i];
}

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  var _messages = {
    // 队列
    'Q_EXCEED_NUM_LIMIT':   '最多允许上传 ' + host.get('maxcount') + ' 个文件',
    // 目前不支持
    // 'Q_EXCEED_SIZE_LIMIT':  '文件总大小不能大于 ' + host.get('maxbytesq'),
    'Q_TYPE_DENIED':        '只支持上传 ' + host.get('accept').mimeTypes + ' 文件',
    'Q_EMPTY_FILE':         '文件 {name} 不合格或是空文件',
    // 文件
    'F_EXCEED_SIZE':        '文件大小不能大于 ' + sizePrettify(host.get('maxbytes')),
    'F_DUPLICATE':          '不允许重复选择文件'
  };

  var _container = $('<div />')
      .on('mouseout', function(e) {
        setTimeout(function() {
          e.target.style.display = 'none';
        }, 500);
      })
      .appendTo(host.element);

  host.on('error', function(type, arg1) {
    var template = _messages[type];

    if (template) {
      if (/\{.+\}/.test(template)) {
        template = template.replace(/\{(.+?)\}/, function(_, $1) {
          return arg1 && arg1[$1] || '';
        });
      }
    }

    _container.text(template || '未知错误').show();
  });

  // 通知就绪
  this.ready();
};
