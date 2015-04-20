/**
 * Description: 基于 WebUploader 的上传组件
 * Author: crossjs <liwenfu@crossjs.com>
 * Date: 2015-01-16 14:52:39
 */

'use strict';

var $ = require('jquery'),
  Widget = require('nd-widget'),
  Template = require('nd-template'),
  RESTful = require('nd-restful');

var Upload = Widget.extend({

  // 使用 handlebars
  Implements: [Template, RESTful],

  attrs: {
    core: {},
    pick: {},
    swf: {
      value: null, // required
      getter: function (val, key) {
        if (typeof val !== 'string') {
          val = this.get('trigger').getAttribute('swf');
          this.attrs[key].value = val || '';
        }

        return val;
      }
    },
    baseUri: {
      value: null, // required
      getter: function (val, key) {
        if (!val) {
          val = this.get('session');
          val = val ? val.baseUri : [];
          this.attrs[key].value = val;
        }

        return val;
      }
    },
    session: {
      value: null, // required
      getter: function (val, key) {
        if (!val) {
          val = this.get('trigger').getAttribute('session');
          val = val ? JSON.parse(val) : {};
          this.attrs[key].value = val;
        }

        return val;
      }
    },
    server: {
      value: null, // required
      getter: function (val, key) {
        if (typeof val !== 'string') {
          val = this.get('trigger').getAttribute('server');
          this.attrs[key].value = val || '';
        }

        return val;
      }
    },
    title: {
      value: null, // required
      getter: function (val, key) {
        if (typeof val !== 'string') {
          val = this.get('trigger').title;
          this.attrs[key].value = val || '';
        }

        return val;
      }
    },
    files: {
      value: null, // required
      getter: function (val, key) {
        if (!$.isArray(val)) {
          val = this.get('value');

          if (val) {
            if (val.charAt(0) === '[' && val.slice(-1) === ']') {
              val = JSON.parse(val);
            } else {
              val = [val];
            }

            $.each(val, function(i, item) {
              val[i] = {
                // 用于移除判断
                id: item,
                // 用于提交数据
                value: item
              };
            });
          } else {
            val = [];
          }

          this.attrs[key].value = val;
        }

        return val;
      }
    },
    value: {
      value: null, // required
      getter: function (val/*, key*/) {
        return val || this.get('trigger').value;
      },
      setter: function (val/*, key*/) {
        if ($.isArray(val)) {
          val = JSON.stringify(val);
        }

        this.get('trigger').value = val || '';

        this._blurTrigger();

        return val;
      }
    },
    accept: {
      value: null, // required
      getter: function (val, key) {
        if (!val) {
          var _val = this.get('trigger').accept;

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
    formData: {
      value: null, // required
      getter: function (val, key) {
        if (!val) {
          val = this.get('trigger').getAttribute('formdata');
          val = val ? JSON.parse(val) : {};
          this.attrs[key].value = val;
        }

        return val;
      }
    },
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
    template: require('./src/upload.handlebars'),
    processFile: function(file, res) {
      if (res && res.url) {
        var files = this.get('files');
        // 将指定返回值赋与对应项
        for (var i = 0; i < files.length; i++) {
          if (files[i].id === file.id) {
            files[i].value = res.url;
            break;
          }
        }
      }
    }
  },

  setup: function() {
    this.on('uploadSuccess', function(file, res) {
      this.get('processFile').call(this, file, res);
    });
  },

  // 根据 ID 移除 attrs.files 中对应的文件
  // 不是移除队列文件
  removeFile: function(id) {
    var files = this.get('files');
    var i;
    var n = files.length;

    for (i = 0; i < n; i++) {
      if (files[i].id === id) {
        files.splice(i, 1);
        break;
      }
    }
  },

  // 返回不为空的 file value
  _getFilesValue: function() {
    var files = this.get('files');
    var i;
    var n = files.length;
    var value = [];

    for (i = 0; i < n; i++) {
      if (files[i].value) {
        value.push(files[i].value);
      }
    }

    return value;
  },

  _blurTrigger: function() {
    $(this.get('trigger')).trigger('blur');
  },

  execute: function(callback) {
    var that = this;
    var baseUri = this.get('baseUri');
    var session = this.get('session');

    if (baseUri.length) {
      this.GET(null, session.data)
        .done(function(data) {
          that.getPlugin('uploadCore').exports
              .option('server',
                  that.get('server').replace('{session}', data.session));
          that._execute(callback);
        })
        .fail(function() {
          // error
          callback(true);
        });
    } else {
      this._execute(callback);
    }
  },

  _execute: function(callback) {
    var that = this;

    that.trigger('valid');

    this.once('uploadFinished', function() {
      var hasErr = false;
      var files = that.get('files');
      var n = files.length;

      if (n) {
        if (that.get('multiple')) {
          that.set('value', that._getFilesValue());
        } else {

          // 如果非多选，仅取最后一个
          that.set('value', files[n - 1].value);
        }
      } else {
        that.set('value', '');
      }

      if (that.get('required') && !that.get('value')) {
        hasErr = true;
        $(this.get('trigger')).trigger('blur');
      }

      callback && callback(hasErr);
    });

    // 执行上传
    this.getPlugin('uploadCore').exports.upload();
  }

});

Upload.pluginEntry = {
  name: 'Upload',
  starter: function() {
    var plugin = this,
      host = plugin.host;

    var _widgets = plugin.exports = {};

    function addWidget(name, instance) {
      _widgets[name] = instance;

      plugin.trigger('export', instance, name);
    }

    plugin.execute = function() {
      host.$('[type="file"]').each(function(i, field) {
        field.type = 'hidden';
        addWidget(field.name, new Upload({
          trigger: field,
          proxy: host.get('proxy')
        }).render());
      });
    };

    host.after('render', plugin.execute);
    // host.after('addField', plugin.execute);

    host.before('destroy', function() {
      Object.keys(_widgets).forEach(function(key) {
        _widgets[key].destroy();
      });
    });

    plugin.getWidget = function(name) {
      return _widgets[name];
    };

    // 通知就绪
    this.ready();
  }
};

module.exports = Upload;
