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
    var files = this.get('files');
    var dns = this.get('dns');
    var dragable = this.get('dragable');
    files.push(uploadFile);
    this.append(uploadFile.render(), uploadPick);
    // 如果可拖曳，添加到拖曳列表
    if (dns && dragable) {
      dns.addElement(uploadFile.element[0]);
      dns.addDrop(uploadFile.element[0]);
    }
  },
  removeFile: function(uploadFile) {
    if (!uploadFile) {
      return;
    }

    var files = this.get('files');
    var dns = this.get('dns');
    var i = 0;
    var dragable = this.get('dragable');
    // 移除拖动列表中的对应项
    if (dns && dragable) {
      dns.removeDrop(uploadFile.element[0]);
    }
    // 移除出队列
    for(i=0; i<files.length; i++) {
      if (files[i] == uploadFile) {
        break;
      }
    }
    files.splice(i, 1);
  },
  render: function() {
    UploadQueue.superclass.render.call(this);

    var dns = null;
    var that = this;
    var dragable = this.get('dragable');
    if (dragable) {
      dns = new Dns({
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
    var i = 0;
    var eleFile = null;
    var dropFile = null;
    var dropIndex = -1;
    for (i=0; i<files.length; i++) {
      if (files[i].element[0] == $element[0]) {
        eleFile = files[i];
        break;
      }
    }
    // 先移除element File
    files.splice(i, 1);

    for (i=0; i<files.length; i++) {
      if (files[i].element[0] == $drop[0]) {
        dropFile = files[i];
        dropIndex = i;
        break;
      }
    }
    if (dataTransfer.action === 'insertBefore') {
      files.splice(dropIndex, 0, eleFile);
    } else if(dataTransfer.action === 'insertAfter') {
      files.splice(dropIndex+1, 0, eleFile);
    }

    this.trigger('drop', dataTransfer.action, eleFile, dropFile);
  },
  destroy: function() {
    //销毁dns对象
    var dns = this.get('dns');
    if (dns) {
      dns.destroy();
    }

    // 销毁files对象
    var files = this.get('files');
    var i = 0;
    for(i=0; i<files.length; i++) {
      files[i].destroy();
    }

    // 清除属性对象
    this.attrs.dns = null;
    this.attrs.files = [];

    UploadQueue.superclass.destroy.call(this);
  }
});

module.exports = UploadQueue;
