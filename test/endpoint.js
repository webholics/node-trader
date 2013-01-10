(function() {
  var should;

  should = require('should');

  describe('Endpoint', function() {
    var Endpoint, FinanzennetEndpoint;
    FinanzennetEndpoint = require('../lib/endpoints/finanzennet.js');
    Endpoint = require('../lib/endpoint.js');
    return describe('create()', function() {
      return it('should return instance of FinanzennetEndpoint', function() {
        var e;
        e = Endpoint.create('finanzennet');
        return e.should.be.an.instanceOf(FinanzennetEndpoint);
      });
    });
  });

}).call(this);
