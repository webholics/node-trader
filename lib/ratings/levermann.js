(function() {
  var Endpoint, LevermannRating, Rating,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Rating = require('../rating.js');

  Endpoint = require('../endpoint.js');

  /*
  Compute scores according to Susanne Levermann's book "Der entspannte Weg zum Reichtum".
  */


  LevermannRating = (function(_super) {

    __extends(LevermannRating, _super);

    /*
        @param {String} indexName Name of the index used for perfomance comparison, uses search on finanzen.net to find the actual index
    */


    function LevermannRating(indexName) {
      this.indexName = indexName;
      this.finanzennetEndpoint = Endpoint.create('finanzennet');
    }

    /*
        Compute the rating for a list of equities.
    
        callback is called with Error|null and Object of the form:
        {
            [isin]: {
                score: Some float or integer, the higher the better
                certainty: 0-1 (a percentage) This value is equal to 1 if no value necessary for the rating process was missing. Therefore it gives the percentage of necessary equity facts which were available.
            }
            ...
        }
    */


    LevermannRating.prototype.getRating = function(equities, cb) {
      var _this = this;
      this.finanzennetEndpoint.searchIndex(this.indexName, function(err, index) {
        var equity, ratings, score, scores, totalErrors, totalScore, _i, _j, _len, _len1;
        if (err) {
          cb(err, null);
          return;
        }
        ratings = {};
        for (_i = 0, _len = equities.length; _i < _len; _i++) {
          equity = equities[_i];
          totalScore = 0;
          totalErrors = 0;
          scores = [_this.getIndicatorReturnOfEquity(equity), _this.getIndicatorEbitMargin(equity), _this.getIndicatorEquityRatio(equity), _this.getIndicatorPbRatio(equity), _this.getIndicatorPeRatio(equity), _this.getIndicatorPeRatioMean(equity), _this.getIndicatorPerformance12M(equity), _this.getIndicatorPerformance6M(equity), _this.getIndicatorPriceMomentum(equity), _this.getIndicator3MonthReversal(equity, index)];
          for (_j = 0, _len1 = scores.length; _j < _len1; _j++) {
            score = scores[_j];
            if (score instanceof Error) {
              totalErrors++;
            } else {
              totalScore += score;
            }
          }
          ratings[equity.isin] = {
            score: totalScore,
            certainty: (scores.length - totalErrors) / scores.length
          };
        }
        return cb(null, ratings);
      });
      return this;
    };

    LevermannRating.prototype.getIndicatorReturnOfEquity = function(equity) {
      var val;
      val = equity.latestFacts.returnOfEquity;
      if (val === null) {
        return new Error;
      }
      if (val > 20) {
        return 1;
      }
      if (val < 10) {
        return -1;
      }
      return 0;
    };

    LevermannRating.prototype.getIndicatorEbitMargin = function(equity) {
      var val;
      val = equity.latestFacts.ebitMargin;
      if (val === null) {
        return new Error;
      }
      if (val > 12) {
        return 1;
      }
      if (val < 6) {
        return -1;
      }
      return 0;
    };

    LevermannRating.prototype.getIndicatorEquityRatio = function(equity) {
      var val;
      val = equity.latestFacts.equityRatio;
      if (val === null) {
        return new Error;
      }
      if (val > 25) {
        return 1;
      }
      if (val < 15) {
        return -1;
      }
      return 0;
    };

    LevermannRating.prototype.getIndicatorPbRatio = function(equity) {
      var val;
      val = equity.latestFacts.pbRatio;
      if (val === null) {
        return new Error;
      }
      if (val < 0.6) {
        return 2;
      }
      if (val < 0.9) {
        return 1;
      }
      if (val < 1.3) {
        return 0;
      }
      return -1;
    };

    LevermannRating.prototype.getIndicatorPeRatio = function(equity) {
      var val;
      val = equity.latestFacts.peRatio;
      if (val === null) {
        return new Error;
      }
      if (val < 12) {
        return 1;
      }
      if (val > 16) {
        return -1;
      }
      return 0;
    };

    LevermannRating.prototype.getIndicatorPeRatioMean = function(equity) {
      var facts, i, numYears, val, _i, _len, _ref;
      numYears = 5;
      val = 0;
      if (equity.latestFacts.peRatio === null) {
        return new Error;
      } else {
        val += equity.latestFacts.peRatio;
      }
      if (!equity.historicFacts || equity.historicFacts.length < numYears - 1) {
        return new Error;
      }
      _ref = equity.historicFacts;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        facts = _ref[i];
        if (i === numYears - 1) {
          break;
        }
        if (facts.peRatio === null) {
          return new Error;
        }
        val += facts.peRatio;
      }
      val /= numYears;
      if (val < 12) {
        return 1;
      }
      if (val > 16) {
        return -1;
      }
      return 0;
    };

    LevermannRating.prototype.getIndicatorPerformance12M = function(equity) {
      var ratio;
      if (!equity.latestPrice || !equity.monthlyPrices || equity.monthlyPrices.length < 12) {
        return new Error;
      }
      ratio = equity.latestPrice / equity.monthlyPrices[11];
      if (ratio > 1.05) {
        return 1;
      }
      if (ratio < 0.95) {
        return -1;
      }
      return 0;
    };

    LevermannRating.prototype.getIndicatorPerformance6M = function(equity) {
      var ratio;
      if (!equity.latestPrice || !equity.monthlyPrices || equity.monthlyPrices.length < 6) {
        return new Error;
      }
      ratio = equity.latestPrice / equity.monthlyPrices[5];
      if (ratio > 1.05) {
        return 1;
      }
      if (ratio < 0.95) {
        return -1;
      }
      return 0;
    };

    LevermannRating.prototype.getIndicatorPriceMomentum = function(equity) {
      var score12M, score6M;
      score12M = this.getIndicatorPerformance12M(equity);
      score6M = this.getIndicatorPerformance6M(equity);
      if (score12M instanceof Error || score6M instanceof Error) {
        return new Error;
      }
      if (score6M === 1 && score12M <= 0) {
        return 1;
      }
      if (score6M === -1 && score12M >= 0) {
        return -1;
      }
      return 0;
    };

    LevermannRating.prototype.getIndicator3MonthReversal = function(equity, index) {
      var equityPerformance, i, indexPerformance, less, more, numMonths, _i, _ref;
      if (!this.isLargeCap) {
        return 0;
      }
      if (!equity.monthlyPrices || equity.monthlyPrices.length < numMonths + 1) {
        return new Error;
      }
      if (!index.monthlyPrices || index.monthlyPrices.length < numMonths + 1) {
        return new Error;
      }
      numMonths = 3;
      more = 0;
      less = 0;
      for (i = _i = 0, _ref = numMonths - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        equityPerformance = equity.monthlyPrices[i] / equity.monthlyPrices[i + 1];
        indexPerformance = index.monthlyPrices[i] / index.monthlyPrices[i + 1];
        if (equityPerformance < indexPerformance) {
          less++;
        } else if (equityPerformance > indexPerformance) {
          more++;
        }
      }
      if (less === numMonths) {
        return 1;
      }
      if (more === numMonths) {
        return -1;
      }
      return 0;
    };

    LevermannRating.prototype.isLargeCap = function(equity) {
      if (equity.latestFacts.marketCap === null) {
        return false;
      }
      return equity.latestFacts.marketCap > (5 * Math.pow(10, 9));
    };

    return LevermannRating;

  })(Rating);

  module.exports = LevermannRating;

}).call(this);
