(function() {
  var JsonOutputFormatter, OutputFormatter, Table,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  OutputFormatter = require('../outputformatter.js');

  Table = require('easy-table');

  /*
  Output equities as JSON
  */


  JsonOutputFormatter = (function(_super) {

    __extends(JsonOutputFormatter, _super);

    /*
        @param {Boolean} min Whether to minimize the JSON output
    */


    function JsonOutputFormatter(min) {
      this.min = min ? true : false;
    }

    /*
        Convert an array of equities to string
    */


    JsonOutputFormatter.prototype.equitiesToString = function(equities) {
      if (this.min) {
        return JSON.stringify(equities);
      } else {
        return JSON.stringify(equities, null, 2);
      }
    };

    return JsonOutputFormatter;

  })(OutputFormatter);

  module.exports = JsonOutputFormatter;

}).call(this);
