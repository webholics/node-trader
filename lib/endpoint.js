
/*
    Abstract data endpoint to fetch equity Data

    Equity:
    ---------
    An equity object must contain the following attributes:
    {
        isin: The ISIN unique equity id
        name: The name of the equity
    }

    The following attributes are optional:
    {
        wkn: The WKN unique equity id
    }

    Index:
    --------
    An index object must contain the following attributes:
    {
        id: Some id for the index.
        name: The name of the index.
        currentPrice: The current price (as realtime as possible)
        monthlyPrices: [...] Array of monthly prices of the first day in each month of the last 12 months starting with the price at the beginning of the current month.
        dailyPrices: [...] Array of daily prices at the beginning of each day in the last 30 trading(!) days starting with the price of today.
    }
    An endpoint may deliver more attributes.
*/


(function() {
  var Endpoint;

  Endpoint = (function() {

    function Endpoint() {}

    /*
        Retrieve a single index by some search.
        This method always returns only one result. The one that fits the search term best.
    */


    Endpoint.prototype.searchIndex = function(name, cb) {
      cb(null, null);
      return this;
    };

    /*
        Retrieve a single equity by ISIN
    */


    Endpoint.prototype.getEquityByIsin = function(isin, cb) {
      cb(null, null);
      return this;
    };

    /*
        Retrieve a single equity by some search.
        This method always returns only one result. The one that fits the search term best.
    */


    Endpoint.prototype.searchEquity = function(name, cb) {
      cb(null, null);
      return this;
    };

    /*
        Retrieve all equities of an index
    
        Index is searched via searchIndex()!
    
        tick is an optional function which is called with two arguments (progress and total).
        Both arguments are integers. Total gives the total steps until getEquitiesByIndex finishes,
        whereas progress gives the number of steps already finished. The tick callback is useful to generate a progress bar.
    */


    Endpoint.prototype.getEquitiesByIndex = function(index, cb, tick) {
      cb(null, []);
      return this;
    };

    return Endpoint;

  })();

  module.exports = Endpoint;

}).call(this);