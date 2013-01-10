(function() {
  var assert, assertEquity, assertIndex;

  assert = require('assert');

  assertIndex = function(index, name) {
    var p, _i, _j, _len, _len1, _ref, _ref1, _results;
    assert.ok(index);
    if (name) {
      assert.strictEqual(index.name, name);
    } else {
      assert.ok(index.name);
    }
    assert.ok(index.currentPrice > 0);
    assert.strictEqual(index.dailyPrices.length, 30);
    _ref = index.dailyPrices;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      assert.ok(p > 0);
    }
    assert.strictEqual(index.monthlyPrices.length, 12);
    _ref1 = index.monthlyPrices;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      p = _ref1[_j];
      _results.push(assert.ok(p > 0));
    }
    return _results;
  };

  assertEquity = function(equity, name) {
    assert.ok(equity);
    if (name) {
      return assert.strictEqual(equity.name, name);
    } else {
      return assert.ok(equity.name);
    }
  };

  describe('FinanzennetEndpoint', function() {
    var Endpoint, endpoint;
    Endpoint = require('../lib/endpoints/finanzennet.js');
    endpoint = new Endpoint;
    describe('searchIndex()', function() {
      it('should return null when no index can be found', function(done) {
        return endpoint.searchIndex('123456789foobar', function(err, index) {
          if (err) {
            done(err);
          }
          assert.strictEqual(index, null);
          return done();
        });
      });
      return it('should return valid index object when searching for dax', function(done) {
        return endpoint.searchIndex('dax', function(err, index) {
          if (err) {
            done(err);
          }
          assertIndex(index, 'DAX');
          return done();
        });
      });
    });
    describe('getEquityByIsin()', function() {
      it('should return null when no equity can be found', function(done) {
        return endpoint.getEquityByIsin('123456789foobar', function(err, equity) {
          if (err) {
            done(err);
          }
          assert.strictEqual(equity, null);
          return done();
        });
      });
      return it('should return valid equity object when searching for DE0005140008', function(done) {
        return endpoint.getEquityByIsin('DE0005140008', function(err, equity) {
          if (err) {
            done(err);
          }
          assertEquity(equity, 'Deutsche Bank AG');
          return done();
        });
      });
    });
    describe('searchEquity()', function() {
      it('should return null when no equity can be found', function(done) {
        return endpoint.searchEquity('123456789foobar', function(err, equity) {
          if (err) {
            done(err);
          }
          assert.strictEqual(equity, null);
          return done();
        });
      });
      return it('should return valid equity object when searching for Deutsche Bank AG', function(done) {
        return endpoint.searchEquity('Deutsche Bank AG', function(err, equity) {
          if (err) {
            done(err);
          }
          assertEquity(equity, 'Deutsche Bank AG');
          return done();
        });
      });
    });
    return describe('getEquitiesByIndex()', function() {
      it('should raise error when index unknown', function(done) {
        return endpoint.getEquitiesByIndex('123456789foobar', function(err, equities) {
          assert.ok(err instanceof Error);
          return done();
        });
      });
      it('should return 30 valid equity objects when searching for DAX', function(done) {
        return endpoint.getEquitiesByIndex('DAX', function(err, equities) {
          var equity, _i, _len;
          if (err) {
            done(err);
          }
          assert.strictEqual(equities.length, 30);
          for (_i = 0, _len = equities.length; _i < _len; _i++) {
            equity = equities[_i];
            assertEquity(equity);
          }
          return done();
        });
      });
      return it('should call tick multiple times if callback is set', function(done) {
        var cb, numOfCallsTick, tick, totalLength,
          _this = this;
        totalLength = null;
        numOfCallsTick = 0;
        tick = function(progress, total) {
          numOfCallsTick++;
          assert.ok(totalLength === null || totalLength === total);
          return assert.ok(progress >= 0 && progress <= total);
        };
        cb = function(err, equities) {
          if (err) {
            done(err);
          }
          assert.ok(numOfCallsTick > 0);
          return done();
        };
        return endpoint.getEquitiesByIndex('DAX', cb, tick);
      });
    });
  });

}).call(this);
