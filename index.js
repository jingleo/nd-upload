/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var $ = require('nd-jquery')
var __ = require('nd-i18n')
var debug = require('nd-debug')
var Widget = require('nd-widget')
var Template = require('nd-template')

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
          val = this.get('trigger').getAttribute('swf')
          this.attrs[key].value = val || ''
        }

        return val
      }
    },
    title: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'string') {
          val = this.get('trigger').title
          this.attrs[key].value = val || ''
        }

        return val
      }
    },
    files: {
      value: null, // required
      getter: function(val, key) {
        if (!Array.isArray(val)) {
          val = this.get('value')

          if (val) {
            if (val.charAt(0) === '[' && val.slice(-1) === ']') {
              val = JSON.parse(val)
            } else {
              val = [val]
            }

            val = val.map(function(item) {
              return {
                // 用于移除判断
                id: item,
                // 用于提交数据
                value: item
              }
            })
          } else {
            val = []
          }

          this.attrs[key].value = val
        }

        return val
      }
    },
    value: {
      value: null, // required
      getter: function(val /*, key*/ ) {
        return val || this.get('trigger').getAttribute('value')
      },
      setter: function(val /*, key*/ ) {
        if (Array.isArray(val)) {
          val = JSON.stringify(val)
        }

        this.get('trigger').setAttribute('value', val || '')

        this._blurTrigger()

        return val
      }
    },
    accept: {
      value: null, // required
      getter: function(val, key) {
        if (!val) {
          var trigger = this.get('trigger')
          var _val = this.get('trigger').accept
          trigger.accept = ''

          val = {
            title: this.get('title'),
            mimeTypes: _val,
            // 转换以供 core 正确识别
            extensions: _val.replace(/(,|^)\./g, '$1')
          }

          this.attrs[key].value = val
        }

        return val
      }
    },
    required: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'boolean') {
          this.attrs[key].value = val = !!this.get('trigger').required
        }

        return val
      }
    },
    multiple: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'boolean') {
          this.attrs[key].value = val = !!this.get('trigger').multiple
        }

        return val
      }
    },
    draggable: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'boolean') {
          this.attrs[key].value = val = !!(this.get('trigger').getAttribute('draggable') || this.get('trigger').getAttribute('dragable'))
        }

        return val
      }
    },
    maxbytes: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'number') {
          this.attrs[key].value = val = +this.get('trigger').getAttribute('maxbytes')
        }

        return val
      }
    },
    maxcount: {
      value: null, // required
      getter: function(val, key) {
        if (typeof val !== 'number') {
          val = +this.get('trigger').getAttribute('maxcount')

          if (val === 0) {
            if (!this.get('multiple')) {
              val = 1
            }
          }

          this.attrs[key].value = val
        }

        return val
      }
    },
    plugins: require('./src/plugins'),
    parentNode: {
      value: null, // required
      getter: function(val) {
        return val || this.get('trigger')
      }
    },
    insertInto: function(element, parentNode) {
      element.insertAfter(parentNode)
    },
    classPrefix: 'ui-upload',
    // 模板
    template: require('./src/upload.handlebars'),
    processFile: function(file, res) {
      if (res && res['dentry_id']) {
        var files = this.get('files')
        // 将指定返回值赋与对应项
        for (var i = 0; i < files.length; i++) {
          if (files[i].id === file.id) {
            files[i].value = res['dentry_id']
            break
          }
        }
      }
    },
    realpath: {
      value: null,
      getter: function(val, key) {
        if (typeof val !== 'boolean') {
          this.attrs[key].value = val = !!this.get('trigger').getAttribute('realpath')
        }

        return val
      }
    },
    session: function(callback) {
      callback(false)
    },
    // detail: function(file, callback) {
    //   callback(false);
    // },
    // upload: function(callback) {
    //   callback(false);
    // },
    // download: function(file, data, callback) {
    //   callback(false);
    // },
    server: {
      value: null,
      setter: function(val/*, key*/) {
        if (val) {
          ['session', 'detail', 'upload', 'download']
          .forEach(function(key) {
            if (val[key]) {
              this.set(key, val[key].bind(val))
            }
          }, this)
        }
        return val
      }
    }
  },

  setup: function() {
    this.on('uploadSuccess', function(file, res) {
      this.get('processFile').call(this, file, res)
    })

    this.on('uploadError', function(file/*, res*/) {
      debug.error(__('文件 ') + file.name + __(' 上传失败，请检查网络连接'))
    })

    Upload.superclass.setup.call(this)

    if ($('[name="__ui_upload_download_iframe"]').length === 0) {
      // iframe for download
      $('<iframe class="webuploader-element-invisible" name="__ui_upload_download_iframe"></iframe>').appendTo(document.body)
    }
  },

  // 根据 ID 移除 attrs.files 中对应的文件
  // 不是移除队列文件
  removeFile: function(id) {
    var files = this.get('files')
    var i
    var n = files.length

    for (i = 0; i < n; i++) {
      if (files[i].id === id) {
        files.splice(i, 1)
        break
      }
    }
  },

  // 返回不为空的 file value
  _getFilesValue: function() {
    var files = this.get('files')
    var value = []
    var realpath = this.get('realpath')

    files.length && files.forEach(function(file) {
      file.value && value.push(realpath ? this.get('download')(file).src : file.value)
    }, this)

    return this.get('multiple') ? value : (value.pop() || '')
  },

  _blurTrigger: function() {
    $(this.get('trigger')).trigger('blur')
  },

  // 暂时不做无 session 的情况
  execute: function(callback) {
    var that = this
    var skip = +(this.get('trigger').getAttribute('data-skip') || '')

    // SKIP_SUBMIT === 1
    if (skip & 1) {
      return callback && callback()
    }

    function complete() {
      var hasErr = false
      var value = that._getFilesValue()

      that.set('value', value)

      if (that.get('required') && (!value || !value.length)) {
        hasErr = true
        that.trigger('error', 'Q_EMPTY')
        $(that.get('trigger')).trigger('blur')
      }

      callback && callback(hasErr)
    }

    // 如果队列文件为空
    if (!this.get('files').some(function(file) { return !!file.source })) {
      return complete()
    }

    this.once('uploadFinished', complete)

    this.upload()
  },

  upload: function() {
    var that = this

    this.get('upload')(function(data) {
      // for plugin
      that.trigger('upload', data)
    })
  },

  resortFiles: function(action, element, drop) {
    var files = this.get('files')
    var i
    var item = null
    var eleFile = null
    // var dropFile = null;
    var dropIndex = -1

    for (i = 0; i < files.length; i++) {
      item = files[i]
      if (item.id === element.id) {
        eleFile = files[i]
        break
      }
    }

    // 移除
    files.splice(i, 1)

    for (i = 0; i < files.length; i++) {
      item = files[i]
      if (item.id === drop.id) {
        // dropFile = files[i];
        dropIndex = i
        break
      }
    }
    //调整位置
    if (action === 'insertBefore') {
      files.splice(dropIndex, 0, eleFile)
    } else if (action === 'insertAfter') {
      files.splice(dropIndex + 1, 0, eleFile)
    }
  }

})

Upload.pluginEntry = {
  name: 'Upload',
  starter: function() {
    var plugin = this,
      host = plugin.host

    var _widgets = plugin.exports = {}

    function addWidget(name, instance) {
      _widgets[name] = instance

      plugin.trigger('export', instance, name)
    }

    plugin.execute = function() {
      host.$('[type="file"][name]').each(function(i, field) {
        field.type = 'hidden'
        addWidget(field.name, new Upload($.extend(true, {
          trigger: field
        }, plugin.getOptions('config'))).render())
      })
    }

    typeof host.use === 'function' &&
      plugin.on('export', function(instance) {
        host.use(function(next) {
          // destroyed
          if (!instance.element) {
            return next()
          }
          instance.execute(function(err) {
            if (!err) {
              next()
            }
          })
        }, 'Upload')
      })

    host.after('render', plugin.execute)

    typeof host.addField === 'function' &&
      host.after('addField', plugin.execute)

    typeof host.removeField === 'function' &&
      host.before('removeField', function(name) {
        if (name in _widgets) {
          _widgets[name].destroy()
        }
      })

    host.before('destroy', function() {
      Object.keys(_widgets).forEach(function(key) {
        _widgets[key].destroy()
      })
    })

    plugin.getWidget = function(name) {
      return _widgets[name]
    }

    // 通知就绪
    this.ready()
  }
}

module.exports = Upload
