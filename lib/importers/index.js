(function() {
  var Endpoint, Importer, IndexImporter;

  Importer = require('../importer.js');

  Endpoint = require('../endpoint.js');

  /*
  Import all equities of an index
  */


  IndexImporter = (function() {
    /*
        @param {String} indexName Name of the index, uses search on finanzen.net to find the actual index
        @param {String} stockMarket The finanzen.net string for a stock market (e.g. FSE for Frankfurt Stock Exchange)
    */

    function IndexImporter(indexName, stockMarket) {
      this.indexName = indexName;
      this.stockMarket = stockMarket;
    }

    /*
        Retrieve the list of all equities of the index.
    
        callback is called with Error|null and Array
    
        tick is an optional function which is called with two arguments (progress and total).
        Both arguments are integers. Total gives the total steps until getEquitiesByIndex finishes,
        whereas progress gives the number of steps already finished. The tick callback is useful to generate a progress bar.
    */


    IndexImporter.prototype.getEquities = function(cb, tick) {
      var finanzennetEndpoint,
        _this = this;
      finanzennetEndpoint = Endpoint.create('finanzennet');
      finanzennetEndpoint.getEquityUrlsByIndex(this.indexName, function(err, urls) {
        var callbackCounter, equities, url, _i, _len, _results;
        if (err) {
          cb(err, null);
          return;
        }
        if (tick) {
          tick(0, urls.length);
        }
        equities = [];
        callbackCounter = 0;
        _results = [];
        for (_i = 0, _len = urls.length; _i < _len; _i++) {
          url = urls[_i];
          _results.push(finanzennetEndpoint.crawlEquity(url, _this.stockMarket, function(err, equity) {
            if (err) {
              if (callbackCounter < urls.length) {
                callbackCounter = urls.length + 1;
                cb(err, null);
              }
              return;
            }
            equities.push(equity);
            callbackCounter++;
            if (tick) {
              tick(callbackCounter, url.length);
            }
            if (callbackCounter === urls.length) {
              return cb(null, equities);
            }
          }));
        }
        return _results;
      });
      return this;
    };

    return IndexImporter;

  })();

  module.exports = IndexImporter;

}).call(this);
