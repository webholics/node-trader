(function() {
  var Endpoint, Importer, IsinImporter;

  Importer = require('../importer.js');

  Endpoint = require('../endpoint.js');

  /*
  Import a single equity by ISIN
  */


  IsinImporter = (function() {
    /*
        @param {String} isin ISIN equity identifier
        @param {String} stockMarket The finanzen.net string for a stock market (e.g. FSE for Frankfurt Stock Exchange)
    */

    function IsinImporter(isin, stockMarket) {
      if (stockMarket == null) {
        stockMarket = 'FSE';
      }
      this.isin = isin;
      this.stockMarket = stockMarket;
    }

    /*
        Retrieve the equity.
    
        callback is called with Error|null and Array
    */


    IsinImporter.prototype.getEquities = function(cb, tick) {
      var boersennewsEndpoint, finanzennetEndpoint,
        _this = this;
      finanzennetEndpoint = Endpoint.create('finanzennet');
      boersennewsEndpoint = Endpoint.create('boersennews');
      if (tick) {
        tick(0, 1);
      }
      finanzennetEndpoint.getEquityByIsin(this.isin, this.stockMarket, function(err, equity) {
        if (err) {
          cb(err, null);
          return;
        }
        return boersennewsEndpoint.getEquityByIsin(equity.isin, function(err, equity2) {
          if (!err) {
            equity.latestFacts = equity2 ? equity2.latestFacts : {};
            equity.historicFacts = equity2 ? equity2.historicFacts : [];
          }
          if (tick) {
            tick(1, 1);
          }
          return cb(null, [equity]);
        });
      });
      return this;
    };

    return IsinImporter;

  })();

  module.exports = IsinImporter;

}).call(this);
