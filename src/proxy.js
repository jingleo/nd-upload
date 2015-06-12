/**
 * @module Upload
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var Base = require('nd-base');
var RESTful = require('nd-restful');
var ajax = require('nd-ajax');

module.exports = Base.extend({

  Implements: [RESTful],

  attrs: {
    // FOR RESTful
    proxy: ajax()
  }

});
