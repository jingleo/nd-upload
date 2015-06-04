/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var Widget = require('nd-widget'),
  Template = require('nd-template');

var mimetypes = require('../vendor/mimetypes');

module.exports = Widget.extend({

  // 使用 handlebars
  Implements: [Template],

  attrs: {
    // 模板
    classPrefix: 'ui-upload-file',
    template: require('./upload-file.handlebars'),
    templateHelpers: {
      sizePrettify: function(size) {
        if (!size) {
          return '';
        }

        var ENUM = [' B', ' KB', ' MB', ' GB', ' TB'];

        var i = 0, kilo = 1024;

        while (size > kilo) {
          size /= kilo;
          i++;
        }

        return size.toFixed(2).replace(/\.00|0$/g, '') + ENUM[i];
      },
      iconType: function(type, name) {
        var l;

        if (type) {
          if (type in mimetypes) {
            return mimetypes[type] || 'unknown';
          }
        }

        if (name) {
          l = name.lastIndexOf('.');

          if (l !== -1) {
            return name.substring(l + 1);
          }
        }

        return 'unknown';
      }
    }
  },

  events: {
    'click [data-role=remove-file]': 'destroy'
  }

});
