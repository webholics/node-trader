(function() {
  var OutputFormatter, Table, TableOutputFormatter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  OutputFormatter = require('../outputformatter.js');

  Table = require('easy-table');

  /*
  Output equities as an ASCII table
  */


  TableOutputFormatter = (function(_super) {

    __extends(TableOutputFormatter, _super);

    function TableOutputFormatter() {}

    /*
        Convert an array of equities to string
    */


    TableOutputFormatter.prototype.equitiesToString = function(equities) {
      return Table.printArray(equities);
    };

    return TableOutputFormatter;

  })(OutputFormatter);

  module.exports = TableOutputFormatter;

}).call(this);
