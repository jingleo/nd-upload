/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict'

var UploadQueue = require('../modules/upload-queue')
var UploadFile = require('../modules/upload-file')

var MIME_TYPES = require('../vendor/mimetypes')

var BLANK = require('../assets/blank.gif')

module.exports = function() {
  var plugin = this,
    host = plugin.host

  var uploader = host.getPlugin('uploadCore').exports

  var uploadQueue = plugin.exports = new UploadQueue({
    draggable: host.get('draggable'),
    parentNode: host.element,
    insertInto: function(element, parentNode) {
      element.prependTo(parentNode)
    }
  }).on('drop', function(action, eleFile, dropFile) {
    host.resortFiles(action, eleFile.get('model'), dropFile.get('model'))
  }).render()

  var optThumb = uploader.option('thumb')

  function prettySize(size) {
    if (!size) {
      return ''
    }

    var ENUM = [' B', ' KB', ' MB', ' GB', ' TB']

    var i = 0,
      kilo = 1024

    while (size > kilo) {
      size /= kilo
      i++
    }

    return size.toFixed(2).replace(/\.00|0$/g, '') + ENUM[i]
  }

  function iconType(type, ext) {
    if (type && (type in MIME_TYPES)) {
      return MIME_TYPES[type]
    }

    if (ext && (ext in MIME_TYPES)) {
      return MIME_TYPES[ext]
    }

    return 'unknown'
  }

  function makeThumb(file, widget) {
    // 文件最大数限制
    var files = host.get('files')

    function update() {
      widget.update(file)
      file.widget = widget
      host.trigger('fileRendered', file)

      if(host.get('quick') && file.source) {
        makeMd5()
      } else {
        file.source && files.push({
          source: file.source,
          id: file.id
        })
        host.trigger('fileAnalysis')
      }
    }

    function makeMd5() {
      host.trigger('md5Start', file);
      uploader.md5File(file)
      .progress(function(percentage) {
        host.trigger('md5Progress', file, percentage);
      })
      .then(function(md5){
        files.push({
          source: file.source,
          name: file.name,
          md5: md5,
          id: file.id
        });
        host.trigger('fileAnalysis');
        host.trigger('md5Success', file);
      });
    }

    if (file.isImage) {
      if (file.source) {
        uploader.makeThumb(file, function(err, src) {
          file.src = err ? BLANK : src

          update()
        })
      } else {
        update()
      }
    }
    // 其它
    else {
      file.name || (file.name = file.src)

      if (!file.ext) {
        file.ext = file.name.match(/\.(.+)?$/)

        if (file.ext && file.ext[1].length < 6) {
          file.ext = file.ext[1]
        }
      }

      file.iconType = iconType(file.type, file.ext)
      file.prettySize = prettySize(file.size)

      update()
    }
  }

  /* helpers */
  function appendFile(file) {
    file.width = optThumb.width
    file.height = optThumb.height

    uploadQueue.addFile(new UploadFile({
      model: file
    }).after('render', function() {
      var widget = this

      host.get('detail')(file, function(file) {
        var isImage = file.type && /^image\//.test(file.type)
        var options = {
          attachment: true,
          name: file.name || file.id
        }

        if (isImage) {
          options.size = 120
        }

        host.get('download')(file, options, function(file) {
          if (file.src) {
            file.srcDownload = file.src
            if (isImage) {
              file.srcDownload = file.srcDownload.replace('&size=120', '')
            }
          }
          file.isImage = isImage
          makeThumb(file, widget)
        })
      })

    }).before('destroy', function() {
      // model === WUFile === file === this.get('model')
      if (file.source) {
        uploader.removeFile(file, true)
      } else {
        host.trigger('fileDequeued', file)
      }

      // this 就是当前 UploadFile 对象
      uploadQueue.removeFile(this)
    }).render(), host.getPlugin('uploadPick').exports)
  }

  // 缩略图
  host.on('fileQueued', function(file) {
    appendFile(file)
  })

  host.before('destroy', function() {
    uploadQueue.destroy()
  })

  var currentFiles = host.get('files')

  // 已有的图片（场景：如编辑）
  if (currentFiles.length) {
    // 异步，确保 plugins/upload-pick 先行
    setTimeout(function() {
      currentFiles.forEach(function(file) {
        host.trigger('fileQueued', file)
      })
    }, 0)
  }

  // 通知就绪
  this.ready()
}
