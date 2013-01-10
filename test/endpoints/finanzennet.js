(function() {
  var assertEquity, assertIndex, should;

  should = require('should');

  assertIndex = function(index, name) {
    var p, _i, _j, _len, _len1, _ref, _ref1, _results;
    should.exist(index);
    index.should.have.keys('name', 'url', 'currentPrice', 'dailyPrices', 'monthlyPrices');
    if (name) {
      index.name.should.equal(name);
    }
    (index.currentPrice > 0).should.be.ok;
    index.dailyPrices.length.should.equal(30);
    _ref = index.dailyPrices;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      (p > 0).should.be.ok;
    }
    index.monthlyPrices.length.should.equal(12);
    _ref1 = index.monthlyPrices;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      p = _ref1[_j];
      _results.push((p > 0).should.be.ok);
    }
    return _results;
  };

  assertEquity = function(equity, name) {
    should.exist(equity);
    equity.should.have.keys('name', 'isin', 'wkn', 'currentPrice', 'dailyPrices', 'monthlyPrices');
    if (name) {
      return equity.name.should.equal(name);
    }
  };

  describe('FinanzennetEndpoint', function() {
    var Endpoint, endpoint;
    Endpoint = require('../../lib/endpoints/finanzennet.js');
    endpoint = new Endpoint;
    describe('searchIndex()', function() {
      it('should return null when no index can be found', function(done) {
        return endpoint.searchIndex('123456789foobar', function(err, index) {
          if (err) {
            done(err);
          }
          should.not.exist(index);
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
        return endpoint.getEquityByIsin('123456789foobar', 'FSE', function(err, equity) {
          if (err) {
            done(err);
          }
          should.not.exist(equity);
          return done();
        });
      });
      it('should raise error when stock market is unknown or not available for this equity');
      return it('should return valid equity object when searching for DE0005140008', function(done) {
        return endpoint.getEquityByIsin('DE0005140008', 'FSE', function(err, equity) {
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
        return endpoint.searchEquity('123456789foobar', 'FSE', function(err, equity) {
          if (err) {
            done(err);
          }
          should.not.exist(equity);
          return done();
        });
      });
      it('should raise error when stock market is unknown or not available for this equity');
      return it('should return valid equity object when searching for Deutsche Bank AG', function(done) {
        return endpoint.searchEquity('Deutsche Bank AG', 'FSE', function(err, equity) {
          if (err) {
            done(err);
          }
          assertEquity(equity, 'Deutsche Bank AG');
          return done();
        });
      });
    });
    describe('getEquityUrlsByIndex()', function() {
      it('should raise error when index unknown', function(done) {
        return endpoint.getEquityUrlsByIndex('123456789foobar', function(err, urls) {
          err.should.be.instanceOf(Error);
          return done();
        });
      });
      return it('should return 30 valid equity URLs when searching for DAX', function(done) {
        return endpoint.getEquityUrlsByIndex('DAX', function(err, urls) {
          var equityUrlRegex, url, _i, _len;
          if (err) {
            done(err);
          }
          urls.length.should.equal(30);
          equityUrlRegex = /http:\/\/www\.finanzen\.net\/aktien\/[^\/]+$/;
          for (_i = 0, _len = urls.length; _i < _len; _i++) {
            url = urls[_i];
            equityUrlRegex.test(url).should.be.ok;
          }
          return done();
        });
      });
    });
    describe('crawlIndex()', function() {
      it('should raise error when URL is wrong', function(done) {
        return endpoint.crawlIndex('http://www.finanzen.net/aktien/adidas-Aktie', function(err, index) {
          err.should.be.instanceOf(Error);
          return done();
        });
      });
      return it('should return a valid index object', function(done) {
        return endpoint.crawlIndex('http://www.finanzen.net/index/DAX', function(err, index) {
          if (err) {
            done(err);
          }
          assertIndex(index, 'DAX');
          return done();
        });
      });
    });
    return describe('crawlEquity()', function() {
      it('should raise error when URL is wrong', function(done) {
        return endpoint.crawlEquity('http://www.finanzen.net/index/DAX', 'FSE', function(err, equity) {
          err.should.be.instanceOf(Error);
          return done();
        });
      });
      it('should raise error when stock market is unknown or not available for this equity');
      return it('should return a valid equity object', function(done) {
        return endpoint.crawlEquity('http://www.finanzen.net/aktien/adidas-Aktie', 'FSE', function(err, equity) {
          if (err) {
            done(err);
          }
          assertEquity(equity, 'adidas AG');
          return done();
        });
      });
    });
  });

  /*
      describe 'getEquitiesByIndex()', ->
          it 'should raise error when index unknown', (done) ->
              endpoint.getEquitiesByIndex '123456789foobar', (err, equities) ->
                  assert.ok(err instanceof Error)
                  done()
  
          it 'should return 30 valid equity objects when searching for DAX', (done) ->
              endpoint.getEquitiesByIndex 'DAX', (err, equities) ->
                  if err
                      done err
                  assert.strictEqual equities.length, 30
                  for equity in equities
                      assertEquity equity
                  done()
  
          it 'should call tick multiple times if callback is set', (done) ->
              totalLength = null
              numOfCallsTick = 0
              tick = (progress, total) =>
                  numOfCallsTick++
  
                   # this value should be set only once, progress bar length should never change
                  assert.ok(totalLength == null or totalLength == total)
  
                  assert.ok(progress >= 0 and progress <= total)
  
              cb = (err, equities) =>
                  if err
                      done err
                  assert.ok(numOfCallsTick > 0)
                  done()
  
              endpoint.getEquitiesByIndex 'DAX', cb, tick
  */


}).call(this);
