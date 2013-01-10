
/*
Abstract output formatter to convert equities to string
*/


(function() {
  var OutputFormatter,
    __slice = [].slice;

  OutputFormatter = (function() {

    function OutputFormatter() {}

    /*
        Convert an array of equities to string
    */


    OutputFormatter.prototype.equitiesToString = function(equities) {
      return '';
    };

    /*
        Static factory method
    */


    OutputFormatter.create = function() {
      var args, c, name;
      name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      c = require('./outputformatters/' + name.toLowerCase() + '.js');
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args), t = typeof result;
        return t == "object" || t == "function" ? result || child : child;
      })(c, args, function(){});
    };

    return OutputFormatter;

  })();

  module.exports = OutputFormatter;

}).call(this);
