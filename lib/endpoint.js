
/*
    Abstract data endpoint to fetch equity Data

    All endpoints basically define their own methods to retrieve data.
    Because retrievable data is heavily depends on the individual data endpoint.

    A single endpoint does not need to retrieve all equity attributes needed for rating.
    It is totally up to the importer to combine different endpoints in a way to retrieve all necessary attributes.
*/


(function() {
  var Endpoint,
    __slice = [].slice;

  Endpoint = (function() {

    function Endpoint() {}

    /*
        Static factory method
    */


    Endpoint.create = function() {
      var args, c, name;
      name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      c = require('./endpoints/' + name.toLowerCase() + '.js');
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args), t = typeof result;
        return t == "object" || t == "function" ? result || child : child;
      })(c, args, function(){});
    };

    return Endpoint;

  })();

  module.exports = Endpoint;

}).call(this);
