/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('nd-jquery');
var __ = require('nd-i18n');

function sizePrettify(size) {
  var ENUM = [' B', ' KB', ' MB', ' GB', ' TB'];

  var i = 0,
    kilo = 1024;

  while (size > kilo) {
    size /= kilo;
    i++;
  }

  return size.toFixed(2).replace(/\.00|0$/g, '') + ENUM[i];
}

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  var hasErr;
  var restoreValue;
  var maxcount = host.get('maxcount');

  var _messages = {
    'Q_EMPTY': __('请选择上传文件'),
    // 目前不支持
    // 'Q_EXCEED_SIZE_LIMIT':  __('文件总大小不能大于 ') + host.get('maxbytesq'),
    // 队列
    'Q_EXCEED_NUM_LIMIT': __('最多允许上传 ') + maxcount + __(' 个文件'),
    'Q_TYPE_DENIED': __('只支持上传 ') + host.get('accept').mimeTypes + __(' 文件'),
    'Q_EMPTY_FILE': __('文件 {name} 不合格或是空文件'),
    // 文件
    'F_EXCEED_SIZE': __('文件大小不能大于 ') + sizePrettify(host.get('maxbytes')),
    'F_DUPLICATE': __('不允许重复选择文件')
  };

  var container = $('<div class="ui-upload-message" />')
    .on('mouseout', function(e) {
      setTimeout(function() {
        e.target.style.display = 'none';
        if (restoreValue) {
          restoreValue = false;
          host.set('value', '');
        }
      }, 500);
    })
    .appendTo(host.element);

  var showMessage = function(text) {
    if (!host.get('value')) {
      restoreValue = true;
      host.set('value', 'fake');
    }

    container.text(text).show();
  };

  var hideMessage = function(text) {
    container.text(text).hide();
    host._blurTrigger();
  };

  host.on('error', function(type, arg1) {
    var template = _messages[type];

    if (template) {
      if (/\{.+\}/.test(template)) {
        template = template.replace(/\{(.+?)\}/, function(_, $1) {
          return arg1 && arg1[$1] || '';
        });
      }
    }

    hasErr = true;
    showMessage(template || __('未知错误'));
  });

  host.on('upload beforeFileQueued', function() {
    if (hasErr) {
      hasErr = false;
      hideMessage('');
    }
  });

  // 当且仅当设置了最大数量
  if (maxcount) {
    // webuuploader 中 maxcount 不包括已上传文件
    // 实际应用时，maxcount 包括已上传文件。需要额外判断
    host.on('beforeFileQueued', function() {
      if (host.get('files').length >= maxcount) {
        host.trigger('error', 'Q_EXCEED_NUM_LIMIT');
        return false;
      }
    });
  }

  host.before('destroy', function() {
    container.off().remove();
  });

  // 通知就绪
  this.ready();
};
