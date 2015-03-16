/**
 * Description: index.js
 * Author: LinNing <565153851@qq.com>
 * Date: 2015-01-16 14:52:39
 */

'use strict';

var $ = require('jquery'),
  Widget = require('nd-widget'),
  Template = require('nd-template');

module.exports = Widget.extend({

  // 使用 handlebars
  Implements: [Template],

  attrs: {
    core: {},
    pick: {},
    swf: {
      value: null, // required
      getter: function (val, key) {
        if (typeof val !== 'string') {
          val = '' + this.get('trigger').getAttribute('swf');

          this.attrs[key].value = val;
        }

        return val;
      }
    },
    server: {
      value: null, // required
      getter: function (val, key) {
        if (typeof val !== 'string') {
          val = '' + this.get('trigger').getAttribute('server');

          this.attrs[key].value = val;
        }

        return val;
      }
    },
    title: {
      value: null, // required
      getter: function (val, key) {
        if (typeof val !== 'string') {
          val = '' + this.get('trigger').title;

          this.attrs[key].value = val;
        }

        return val;
      }
    },
    accept: {
      value: null, // required
      getter: function (val, key) {
        if (!val) {
          var _val = '' + this.get('trigger').accept;

          val = {
            title: this.get('title'),
            mimeTypes: _val,
            // 转换以供 core 正确识别
            extensions: _val.replace(/(,|^)\./g, '$1')
          };

          this.attrs[key].value = val;
        }

        return val;
      }
    },
    required: {
      value: null, // required
      getter: function (val, key) {
        if (typeof val !== 'boolean') {
          val = !!this.get('trigger').required;
          this.attrs[key].value = val;
        }

        return val;
      }
    },
    multiple: {
      value: null, // required
      getter: function (val, key) {
        if (typeof val !== 'boolean') {
          val = !!this.get('trigger').multiple;
          this.attrs[key].value = val;
        }

        return val;
      }
    },
    maxbytes: {
      value: null, // required
      getter: function (val, key) {
        if (typeof val !== 'number') {
          val = +this.get('trigger').getAttribute('maxbytes');
          this.attrs[key].value = val;
        }

        return val;
      }
    },
    maxcount: {
      value: null, // required
      getter: function (val, key) {
        if (typeof val !== 'number') {
          val = +this.get('trigger').getAttribute('maxcount');

          if (val === 0) {
            if (!this.get('multiple')) {
              val = 1;
            }
          }

          this.attrs[key].value = val;
        }

        return val;
      }
    },
    // accept: null,
    plugins: require('./src/plugins'),
    parentNode: {
      value: null, // required
      getter: function (val) {
        return val ? $(val) : $(this.get('trigger'));
      }
    },
    insertInto: function(element, parentNode) {
      element.insertAfter(parentNode);
    },
    // 模板
    classPrefix: 'ui-upload',
    template: require('./src/upload.handlebars')
  },

  setup: function() {
    this.initPlugins();

    var values = this.values = [];

    this.on('uploadSuccess', function(file, res) {
      res && res.url && values.push(res.url);
    });
  },

  initPlugins: function() {
    var that = this;

    // 插件
    $.each(this.get('plugins'), function(i, item) {
      if (!item.disabled) {
        that.addPlugin(item.name, item.plugin, item.callbacks);
      }
    });
  },

  execute: function(callback) {
    var that = this;

    this.once('uploadFinished', function() {
      var hasErr = false;

      if (that.get('required') && !that.values.length) {
        hasErr = true;
      } else {
        if (that.get('multiple')) {
          that.get('trigger').value = JSON.stringify(that.values);
        } else {
          that.get('trigger').value = that.values.slice(-1);
        }
      }

      callback && callback(hasErr);
    });

    this.getPlugin('uploadCore').exports.upload();
  }

});
