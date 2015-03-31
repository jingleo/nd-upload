/**
 * @module: nd-upload
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-13 16:12:15
 */

'use strict';

var $ = require('jquery');

var WebUploader = require('../vendor/webuploader');

if (!WebUploader.Uploader.support()) {
  alert('WebUploader 不支持您的浏览器！如果您使用的是 IE 浏览器，请尝试升级 Flash 播放器。');
  throw new Error('WebUploader does not support the browser you are using.');
}

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  // OPTIONS: {
    // swf: './vendor/uploader.swf',
    // server: '',
    // dnd: undefined
    // disableGlobalDnd: false
    // paste: undefined
    // pick:  {
    //   id: id/class/dom
    //   innerHTML: 指定按钮文字
    //   multiple: true/false
    // },
    // pick: undefined
    // accept:  {
    //   title: 文字描述
    //   extensions: 允许的文件后缀，不带点，多个用逗号分割
    //   mimeTypes: 多个用逗号分割
    // },
    // accept: null,
    // thumb: {
    //   width: 110,
    //   height: 110,
    //   quality: 70,
    //   allowMagnify: true,
    //   crop: true,
    //   type: 'image/jpeg'
    // },
    // compress: {
    //   width: 1600,
    //   height: 1600,
    //   quality: 90,
    //   allowMagnify: false,
    //   crop: false,
    //   preserveHeaders: true,
    //   noCompressIfLarger: false,
    //   compressSize: 0
    // },
    // auto: false,
    // runtimeOrder: 'html5, flash',
    // prepareNextFile: false
    // chunked: false
    // chunkSize: 5242880
    // chunkRetry: 2
    // threads: 3
    // formData: {}
    // fileVal: 'file'
    // method: 'POST'
    // sendAsBinary: false
    // fileNumLimit: undefined,
    // fileSizeLimit: undefined,
    // fileSingleSizeLimit: undefined,
    // duplicate: undefined
    // disableWidgets: []
  // }

  // EVENTS: {
    // dndAccept
    // beforeFileQueued
    // fileQueued
    // filesQueued
    // fileDequeued
    // reset
    // startUpload
    // stopUpload
    // uploadFinished
    // uploadStart
    // uploadBeforeSend
    // uploadAccept
    // uploadProgress
    // uploadError
    // uploadSuccess
    // uploadComplete
    // error
    //    Q_EXCEED_NUM_LIMIT
    //    Q_EXCEED_SIZE_LIMIT
    //    Q_EXCEED_SIZE_LIMIT
    //    Q_TYPE_DENIED
    //    Q_EMPTY_FILE
  // }

  plugin.exports = WebUploader.create($.extend(true, {
    thumb: {
      width: 100,
      height: 100,
      quality: 100,
      // 必须 jpeg 否则 flash 环境下无法显示 png
      type: 'jpeg'
    },
    swf: host.get('swf'),
    server: host.get('server'),
    // runtimeOrder: 'flash, html5',
    accept: host.get('accept'),
    // fileSizeLimit: host.get('maxbytes'),
    fileSingleSizeLimit: host.get('maxbytes'),
    fileNumLimit: host.get('maxcount')
  }, host.get('core')))
    .on('all', function() {
      // 所有事件同步到 host
      return host.trigger.apply(host, arguments);
    });

  // 通知就绪
  this.ready();
};
