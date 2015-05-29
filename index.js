/**
 * Description: 基于 WebUploader 的上传组件
 * Author: crossjs <liwenfu@crossjs.com>
 * Date: 2015-01-16 14:52:39
 */

'use strict';

var $ = require('jquery');
var Widget = require('nd-widget');
var Template = require('nd-template');
var Alert = require('nd-alert');

var DENTRY_ID_PATTERN = /^[0-9a-f]{8}(\-[0-9a-f]{4}){3}\-[0-9a-f]{12}$/;

var Upload = Widget.extend({

  // 使用 handlebars
  Implements: [Template],

  attrs: {
    core: {},
    pick: {},
    swf: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'string') {
          val = this.get('trigger').getAttribute('swf');
          this.attrs[key].value = val || '';
        }

        return val;
      }
    },
    thumbSizes: [80, 120, 160, 240, 320, 480, 640, 960],
    server: {
      // locale is required
      // locale: {
      //   host: '',
      //   version: '',
      //   session: '',,
      //   formData: {
      //     // 存放路径
      //     path: ''
      //   }
      // },
      remote: {
        // host is required
        // host: '',
        version: 'v0.1',
        upload: 'upload?session={session}',
        download: 'download?session={session}&dentryId={dentryId}',
        formData: {
          scope: 1
        }
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
        if (Array.isArray(val)) {
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
          this.attrs[key].value = val = !!this.get('trigger').required;
        }

        return val;
      }
    },
    multiple: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'boolean') {
          this.attrs[key].value = val = !!this.get('trigger').multiple;
        }

        return val;
      }
    },
    maxbytes: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'number') {
          this.attrs[key].value = val = +this.get('trigger').getAttribute('maxbytes');
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
    plugins: require('./src/plugins'),
    parentNode: {
      value: null, // required
      getter: function(val) {
        return val || this.get('trigger');
      }
    },
    insertInto: function(element, parentNode) {
      element.insertAfter(parentNode);
    },
    classPrefix: 'ui-upload',
    // 模板
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
    },
    realpath: {
      value: null,
      getter: function(val, key) {
        if (typeof val !== 'boolean') {
          this.attrs[key].value = val = !!this.get('trigger').getAttribute('realpath');
        }

        return val;
      }
    }
  },

  initAttrs: function(config) {
    Upload.superclass.initAttrs.call(this, config);

    this.set('server', (function(val) {
      return val ? JSON.parse(val) : {};
    })(this.get('trigger').getAttribute('server')));
  },

  setup: function() {
    this.on('uploadSuccess', function(file, res) {
      this.get('processFile').call(this, file, res);
    });

    this.on('uploadError', function(file/*, res*/) {
      Alert.show(file.name + '上传失败，检查是否网络问题');
    });

    Upload.superclass.setup.call(this);
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
    var value = [];
    var realpath = this.get('realpath');

    files.length && files.forEach(function(file) {
      file.value && value.push(realpath ? this.getRemoteURL(file).src : file.value);
    }, this);

    return this.get('multiple') ? value : (value.pop() || '');
  },

  _blurTrigger: function() {
    $(this.get('trigger')).trigger('blur');
  },

  session: function(callback) {
    var proxy = this.get('proxy');

    if (!proxy) {
      console.error('缺少 proxy，无法获取 session ！');
      return callback(false);
    }

    var attrServerLocale = this.get('server').locale;

    proxy[attrServerLocale.method || 'POST']({
        baseUri: [
          attrServerLocale.host,
          attrServerLocale.version,
          attrServerLocale.session
        ],
        data: attrServerLocale.formData
      })
      .done(function(data) {
        callback(data);
      })
      .fail(function(error) {
        // error
        callback(false);
        Alert.show(error);
      });
  },

  // GET DOWNLOAD URL
  getRemoteURL: function(file, callback, size) {
    if (!DENTRY_ID_PATTERN.test(file.value)) {
      file.src = file.value;
      callback && callback(file);
      return file;
    }

    var remote = this.get('server').remote;

    var remoteUrl = [
      remote.host,
      remote.version,
      remote.download
    ].join('/');

    var isPublic = remote.formData && remote.formData.scope;

    file.src = remoteUrl.replace('{dentryId}', file.value);

    if (size && this.get('thumbSizes').indexOf(size) !== -1) {
      file.src += '&size=' + size;
    }

    if (isPublic) {
      file.src = file.src.replace('session={session}&', '');
      callback && callback(file);
    } else {
      this.session(function(data) {
        file.src = file.src.replace('{session}', data.session);
        callback && callback(file);
      });
    }

    return file;
  },

  // 暂时不做无 session 的情况
  execute: function(callback) {
    var that = this;

    if (this.get('trigger').getAttribute('data-skip') === 'true') {
      return callback();
    }

    this.session(function(data) {
      that.trigger('session', data);

      if (!data) {
        return;
      }

      that.once('uploadFinished', function() {
        var hasErr = false;

        that.set('value', this._getFilesValue());

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
        addWidget(field.name, new Upload($.extend(true, {
          trigger: field,
          proxy: host.get('proxy')
        }, plugin.getOptions('config'))).render());
      });
    };

    typeof host.use === 'function' &&
      plugin.on('export', function(instance) {
        host.use(function(next) {
          instance.execute(function(err) {
            if (!err) {
              next();
            }
          });
        });
      });

    host.after('render', plugin.execute);

    typeof host.addField === 'function' &&
      host.after('addField', plugin.execute);

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
