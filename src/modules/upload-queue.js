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
    classPrefix: 'ui-upload-queue',
    template: require('./upload-queue.handlebars')
  },

  append: function(item, before) {
    if (before) {
      item.element.insertBefore(before);
    } else {
      this.element.append(item.element);
    }
  },

  prepend: function(item, after) {
    if (after) {
      item.element.insertAfter(after);
    } else {
      this.element.prepend(item.element);
    }
  }

});
