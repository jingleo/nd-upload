/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');
var __ = require('nd-i18n');

var WebUploader = require('../vendor/webuploader');

module.exports = function() {
  if (!WebUploader.Uploader.support()) {
    alert(__('您无法进行下一步操作，因为文件上传功能需要更高版本（或支持 Flash 播放器）的浏览器。'));
    throw new Error('WebUploader does not support the browser you are using.');
  }

  var plugin = this,
    host = plugin.host;

  var core = plugin.exports = WebUploader.create($.extend(true, {
      thumb: {
        // 内容服务，仅支持 80,120,160,240,320,480,640,960
        width: 120,
        height: 120,
        quality: 100,
        // 必须 jpeg 否则 flash 环境下无法显示 png
        type: 'jpeg'
      },
      swf: host.get('swf'),
      // runtimeOrder: 'flash, html5',
      accept: host.get('accept'),
      fileSingleSizeLimit: host.get('maxbytes'),
      fileNumLimit: host.get('maxcount')
    }, host.get('core')))
    .on('all', function() {
      // 所有事件同步到 host
      return host.trigger.apply(host, arguments);
    });

  // 上传
  host.on('upload', function(data) {
    core.option('server', data.server);
    core.option('formData', data.formData);
    core.upload();
  });

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  // 通知就绪
  this.ready();
};
