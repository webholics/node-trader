(function() {
  var assertEquity, should;

  should = require('should');

  assertEquity = function(equity, name) {
    var f, _i, _len, _ref, _results;
    should.exist(equity);
    equity.should.have.keys('name', 'isin', 'wkn', 'latestFacts', 'historicFacts');
    if (name) {
      equity.name.should.equal(name);
    }
    equity.latestFacts.should.be.a('object');
    equity.historicFacts.should.be.an.instanceOf(Array);
    _ref = equity.historicFacts;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      f = _ref[_i];
      _results.push(f.should.be.a('object'));
    }
    return _results;
  };

  describe('BoersennewsEndpoint', function() {
    var Endpoint, endpoint;
    Endpoint = require('../../lib/endpoints/boersennews.js');
    endpoint = new Endpoint;
    describe('getEquityByIsin()', function() {
      it('should return null when no equity can be found', function(done) {
        return endpoint.getEquityByIsin('123456789foobar', function(err, equity) {
          if (err) {
            done(err);
          }
          should.not.exist(equity);
          return done();
        });
      });
      return it('should return valid equity object when searching for DE0005140008', function(done) {
        return endpoint.getEquityByIsin('DE0005140008', function(err, equity) {
          if (err) {
            done(err);
          }
          assertEquity(equity, 'DEUTSCHE BANK');
          return done();
        });
      });
    });
    return describe('crawlEquity()', function() {
      it('should raise error when URL is wrong', function(done) {
        return endpoint.crawlEquity('http://www.boersennews.de/markt/indizes/dax-performance-index-de0008469008/20735/profile', function(err, equity) {
          err.should.be.instanceOf(Error);
          return done();
        });
      });
      return it('should return a valid equity object', function(done) {
        return endpoint.crawlEquity('http://www.boersennews.de/markt/aktien/adidas-ag-na-on-de000a1ewww0/36714349/fundamental', function(err, equity) {
          if (err) {
            done(err);
          }
          assertEquity(equity, 'ADIDAS');
          return done();
        });
      });
    });
  });

}).call(this);
