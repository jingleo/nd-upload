'use strict'

// var $ = require('nd-jquery')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var Upload = require('../index')

var expect = chai.expect
// var sinon = window.sinon

chai.use(sinonChai)

/*globals describe,it*/

describe('Upload', function() {

  it('new Upload', function() {
    expect(Upload).to.be.a('function')
    expect(new Upload).to.be.a('object')
  })

})
