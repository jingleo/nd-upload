/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var Widget = require('nd-widget');
var Template = require('nd-template');
var Dns = require('nd-dns');

var UploadQueue = Widget.extend({

  // 使用 handlebars
  Implements: [Template],

  attrs: {
    // 模板
    classPrefix: 'ui-upload-queue',
    template: require('./upload-queue.handlebars'),
    // 保存uploadFile对象
    files: [],
    // 保存dns对象
    dns: null
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
  },

  addFile: function(uploadFile, uploadPick) {
    if (!uploadFile) {
      return;
    }

    this.get('files').push(uploadFile);
    this.append(uploadFile, uploadPick);

    var dns = this.get('dns');
    var draggable = this.get('draggable');

    // 如果可拖曳，添加到拖曳列表
    if (dns && draggable) {
      dns.addElement(uploadFile.element[0]);
      dns.addDrop(uploadFile.element[0]);
    }
  },

  removeFile: function(uploadFile) {
    if (!uploadFile) {
      return;
    }

    var dns = this.get('dns');
    var draggable = this.get('draggable');

    // 移除拖动列表中的对应项
    if (dns && draggable) {
      dns.removeDrop(uploadFile.element[0]);
    }

    var files = this.get('files');

    if (files) {
      files.some(function(file, index) {
        if (file === uploadFile) {
          // 移除出队列
          files.splice(index, 1);
          return true;
        }
      });
    }
  },

  render: function() {
    UploadQueue.superclass.render.call(this);

    var draggable = this.get('draggable');

    if (draggable) {
      var that = this;
      var dns = new Dns({
        containment: this.element,
        elements: [],
        drops: [],
        axis: '',
        dropCursor: 'move',
        canDrag: function(target) {
          return !/^INPUT|SELECT|TEXTAREA|BUTTON$/.test(target.tagName);
        }
      }).on('drop', function(dataTransfer, $element, $drop) {
        that.resortFiles(dataTransfer, $element, $drop);
      });

      Dns.open();

      this.set('dns', dns);
    }

    return this;
  },

  resortFiles: function(dataTransfer, $element, $drop) {
    if (!$element) {
      return;
    }

    if (!$drop) {
      return;
    }

    var files = this.get('files');
    var eleFile = null;
    var dropFile = null;
    var dropIndex = -1;

    if (files) {
      files.some(function(file, index) {
        if (file.element[0] === $element[0]) {
          // 移除并赋值
          eleFile = files.splice(index, 1)[0];
          return true;
        }
      });

      files.some(function(file, index) {
        if (file.element[0] === $drop[0]) {
          dropFile = file;
          dropIndex = index;
          return true;
        }
      });
    }

    if (eleFile && dropFile) {
      if (dataTransfer.action === 'insertBefore') {
        files.splice(dropIndex, 0, eleFile);
      } else if (dataTransfer.action === 'insertAfter') {
        files.splice(dropIndex + 1, 0, eleFile);
      }

      this.trigger('drop', dataTransfer.action, eleFile, dropFile);
    }
  },

  destroy: function() {
    //销毁dns对象
    var dns = this.get('dns');

    if (dns) {
      dns.destroy();
    }

    // 销毁files对象
    var files = this.get('files');

    if (files) {
      files.forEach(function(file, index) {
        file && file.destroy && file.destroy();
      });
    }

    // 清除属性对象
    this.attrs.dns = null;
    this.attrs.files = [];

    UploadQueue.superclass.destroy.call(this);
  }

});

module.exports = UploadQueue;
