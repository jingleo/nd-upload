/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');
var Widget = require('nd-widget');
var Template = require('nd-template');
var debug = require('nd-debug');

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
    // thumbSizes: [80, 120, 160, 240, 320, 480, 640, 960],
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
        detail: 'dentries/{dentryId}',
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
        return val || this.get('trigger').getAttribute('value');
      },
      setter: function(val /*, key*/ ) {
        if (Array.isArray(val)) {
          val = JSON.stringify(val);
        }

        this.get('trigger').setAttribute('value', val || '');

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

  initProps: function() {
    this.proxy = this.get('proxy');
  },

  setup: function() {
    this.on('uploadSuccess', function(file, res) {
      this.get('processFile').call(this, file, res);
    });

    this.on('uploadError', function(file/*, res*/) {
      debug.error('文件 ' + file.name + ' 上传失败，请检查网络连接');
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
      file.value && value.push(realpath ? this.getDownload(file).src : file.value);
    }, this);

    return this.get('multiple') ? value : (value.pop() || '');
  },

  _blurTrigger: function() {
    $(this.get('trigger')).trigger('blur');
  },

  getSession: function(callback) {
    var attrServerLocale = this.get('server').locale;

    this.proxy[attrServerLocale.method || 'POST']({
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
        debug.error(error);
      });
  },

  // GET FILE INFO
  getDetail: function(file, callback) {
    var that = this;

    this.getSession(function(data) {
      if (!data) {
        return callback(file);
      }

      var attrServerRemote = that.get('server').remote;

      that.proxy[attrServerRemote.method || 'GET']({
          baseUri: [
            attrServerRemote.host,
            attrServerRemote.version,
            attrServerRemote.detail
          ],
          replacement: {
            dentryId: file.value
          },
          data: {
            session: data.session
          }
        })
        .done(function(data) {
          if (data.inode) {
            file.type = data.inode.mime;
            file.size = data.inode.size;
          }
          if (data.name) {
            file.name = data.name;
          }
          callback(file);
        })
        .fail(function(error) {
          // error
          callback(file);
          debug.error(error);
        });
    });
  },

  // GET DOWNLOAD URL
  getDownload: function(file, data, callback) {
    if (!callback) {
      callback = data;
      data = null;
    }

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

    if (data) {
      Object.keys(data).forEach(function(key) {
        file.src += '&' + key + '=' + data[key];
      });
    }

    if (isPublic) {
      file.src = file.src.replace('session={session}&', '');
      callback && callback(file);
    } else {
      this.getSession(function(data) {
        file.src = file.src.replace('{session}', data.session);
        callback && callback(file);
      });
    }

    return file;
  },

  // 暂时不做无 session 的情况
  execute: function(callback) {
    var that = this;
    var skip = +(this.get('trigger').getAttribute('data-skip') || '');

    // SKIP_SUBMIT === 1
    if (skip & 1) {
      return callback();
    }

    this.getSession(function(data) {
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
          // destroyed
          if (!instance.element) {
            return next();
          }
          instance.execute(function(err) {
            if (!err) {
              next();
            }
          });
        }, 'Upload');
      });

    host.after('render', plugin.execute);

    typeof host.addField === 'function' &&
      host.after('addField', plugin.execute);

    typeof host.removeField === 'function' &&
      host.before('removeField', function(name) {
        if (name in _widgets) {
          _widgets[name].destroy();
        }
      });

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
