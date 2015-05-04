/**
 * Description: 基于 WebUploader 的上传组件
 * Author: crossjs <liwenfu@crossjs.com>
 * Date: 2015-01-16 14:52:39
 */

'use strict';

var $ = require('jquery');
var Widget = require('nd-widget');
var Template = require('nd-template');

var Upload = Widget.extend({

  // 使用 handlebars
  Implements: [Template],

  attrs: {
    core: {},
    pick: {},
    // swf: {
    //   value: null, // required
    //   getter: function(val, key) {
    //     if (typeof val !== 'string') {
    //       val = this.get('trigger').getAttribute('swf');
    //       this.attrs[key].value = val || '';
    //     }

    //     return val;
    //   }
    // },
    // baseUri: {
    //   value: null, // required
    //   getter: function(val, key) {
    //     if (!val) {
    //       val = this.get('session');
    //       val = val ? (val.baseUri || []) : [];
    //       this.attrs[key].value = val;
    //     }

    //     return val;
    //   }
    // },
    server: {
      // locale is required
      // locale: {
      //   host: '',
      //   version: '',
      //   session: '',
      //   // 存放路径
      //   path: ''
      // },
      remote: {
        // host is required
        // host: '',
        version: 'v0.1',
        upload: 'upload?session={session}',
        download: 'download?session={session}&dentryId={dentryId}',
        scope: 1
      }
    },
    title: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'string') {
          val = this.get('trigger').title;
          this.attrs[key].value = val || '';
        }

        return val;
      }
    },
    files: {
      value: null, // required
      getter: function(val, key) {
        if (!Array.isArray(val)) {
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
      getter: function(val /*, key*/ ) {
        return val || this.get('trigger').value;
      },
      setter: function(val /*, key*/ ) {
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
      getter: function(val, key) {
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
      getter: function(val, key) {
        if (typeof val !== 'boolean') {
          this.attrs[key].value = !!this.get('trigger').required;
        }

        return val;
      }
    },
    multiple: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'boolean') {
          this.attrs[key].value = !!this.get('trigger').multiple;
        }

        return val;
      }
    },
    maxbytes: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'number') {
          this.attrs[key].value = +this.get('trigger').getAttribute('maxbytes');
        }

        return val;
      }
    },
    maxcount: {
      value: null, // required
      getter: function(val, key) {
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
      getter: function(val, key) {
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
      getter: function(val) {
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
      if (res && res['dentry_id']) {
        var files = this.get('files');
        // 将指定返回值赋与对应项
        for (var i = 0; i < files.length; i++) {
          if (files[i].id === file.id) {
            files[i].value = res['dentry_id'];
            break;
          }
        }
      }
    }
  },

  initAttrs: function(config) {
    Upload.superclass.initAttrs.call(this, config);

    this.on('uploadSuccess', function(file, res) {
      this.get('processFile').call(this, file, res);
    });

    this.set('server', (function(val) {
      return val ? JSON.parse(val) : {};
    })(this.get('trigger').getAttribute('server')));

    this.set('formData', {
      scope: this.get('server').remote.scope
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

  session: function(callback) {
    var proxy = this.get('proxy');

    if (!proxy) {
      console.error('缺少 proxy，无法获取 session ！');
      return callback({});
    }

    var locale = this.get('server').locale;

    proxy.POST({
        baseUri: [locale.host, locale.version, locale.session],
        data: {
          path: locale.path
        }
      })
      .done(function(data) {
        callback(data);
      })
      .fail(function() {
        // error
        callback({});
      });
  },

  // 暂时不做无 session 的情况
  execute: function(callback) {
    var that = this;

    this.session(function(data) {
      that.trigger('session', data);

      that.once('uploadFinished', function() {
        var hasErr = false;
        var files = that.get('files');
        var count = files.length;

        if (count) {
          if (that.get('multiple')) {
            that.set('value', that._getFilesValue());
          } else {

            // 如果非多选，仅取最后一个
            that.set('value', files[count - 1].value);
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

      that.upload();
    });
  },

  upload: function() {
    // WHY HERE IS A TRIGGER?
    // COMMENTS OUT FIRST
    // this.trigger('valid');

    // for plugin
    this.trigger('upload');
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
