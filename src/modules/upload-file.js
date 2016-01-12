/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var Widget = require('nd-widget');
var Template = require('nd-template');

var UploadFile = Widget.extend({

  // 使用 handlebars
  Implements: [Template],

  templatePartials: {
    content: require('./upload-file-content.handlebars')
  },

  attrs: {
    // 模板
    classPrefix: 'ui-upload-file',
    template: require('./upload-file.handlebars')
  },

  events: {
    'click [data-role="remove-file"]': 'remove'
  },

  remove: function() {
    // 通知容器对象UploadQueue执行清除动作
    this.trigger('remove');
    //销毁该对象
    UploadFile.superclass.destroy.call(this);
  },

  _onRenderModel: function(model) {
    this._renderPartial(model);
  },

  _renderPartial: function(file) {
    this.renderPartialTemplate('content', file);
  }

});

module.exports = UploadFile;
