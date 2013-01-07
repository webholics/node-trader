
/*
Trader main module with helper functions to work with endpoints, output formatters and ratings
*/


(function() {
  var __slice = [].slice;

  exports.loadEndpoint = function() {
    var Endpoint, args, name;
    name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    Endpoint = require('./endpoints/' + name.toLowerCase() + '.js');
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args), t = typeof result;
      return t == "object" || t == "function" ? result || child : child;
    })(Endpoint, args, function(){});
  };

  exports.loadOutputFormatter = function() {
    var OutputFormatters, args, name;
    name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    OutputFormatters = require('./outputformatters/' + name.toLowerCase() + '.js');
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args), t = typeof result;
      return t == "object" || t == "function" ? result || child : child;
    })(OutputFormatters, args, function(){});
  };

}).call(this);
