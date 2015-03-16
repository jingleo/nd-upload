/**
 * @module: nd-upload
 * @author: crossjs <liwenfu@crossjs.com> - 2015-03-13 16:12:15
 */

'use strict';

var Widget = require('nd-widget'),
  Template = require('nd-template');

module.exports = Widget.extend({

  // 使用 handlebars
  Implements: [Template],

  attrs: {
    // 模板
    classPrefix: 'ui-upload-queue',
    template: require('./upload-queue.handlebars')
  },

  append: function(item) {
    this.element.append(item.element);
  },

  prepend: function(item) {
    this.element.prepend(item.element);
  }

});
