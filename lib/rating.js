
/*
    Abstract equity rating which computes a score for a list of equities.
*/


(function() {
  var Rating,
    __slice = [].slice;

  Rating = (function() {

    function Rating() {}

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
    
        tick is an optional function which is called with two arguments (progress and total).
        Both arguments are integers. Total gives the total steps until the function finishes,
        whereas progress gives the number of steps already finished. The tick callback is useful to generate a progress bar.
    */


    Rating.prototype.getRating = function(equities, cb, tick) {
      cb(null, {});
      return this;
    };

    /*
        Static factory method
    */


    Rating.create = function() {
      var args, c, name;
      name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      c = require('./ratings/' + name.toLowerCase() + '.js');
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args), t = typeof result;
        return t == "object" || t == "function" ? result || child : child;
      })(c, args, function(){});
    };

    return Rating;

  })();

  module.exports = Rating;

}).call(this);
