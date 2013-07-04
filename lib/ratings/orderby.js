(function() {
  var OrderbyRating, Rating,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Rating = require('../rating.js');

  /*
  Compute scores in a way to sort equities by a single facts ascending or descending.
  */


  OrderbyRating = (function(_super) {

    __extends(OrderbyRating, _super);

    /*
        @param {String} factName Name of the fact to sort equities with. Must be a fact available in equity.latestFacts
    */


    function OrderbyRating(factName, descending) {
      if (descending == null) {
        descending = true;
      }
      this.factName = factName;
      this.descending = descending;
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


    OrderbyRating.prototype.getRating = function(equities, cb) {
      var equity, ratings, score, _i, _len;
      ratings = {};
      for (_i = 0, _len = equities.length; _i < _len; _i++) {
        equity = equities[_i];
        if (!equity) {
          continue;
        }
        if (!equity.latestFacts.hasOwnProperty(this.factName) || equity.latestFacts[this.factName] === null) {
          ratings[equity.isin] = {
            score: 0,
            certainty: 0
          };
        } else {
          score = equity.latestFacts[this.factName];
          if (!this.descending) {
            score *= -1;
          }
          ratings[equity.isin] = {
            score: score,
            certainty: 1
          };
        }
      }
      cb(null, ratings);
      return this;
    };

    return OrderbyRating;

  })(Rating);

  module.exports = OrderbyRating;

}).call(this);
