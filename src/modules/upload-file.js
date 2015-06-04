/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var Widget = require('nd-widget');
var Template = require('nd-template');

module.exports = Widget.extend({

  // 使用 handlebars
  Implements: [Template],

  attrs: {
    // 模板
    classPrefix: 'ui-upload-file',
    template: require('./upload-file.handlebars')
  },

  events: {
    'click [data-role="remove-file"]': 'destroy'
  }

});
