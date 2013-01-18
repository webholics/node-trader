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
      var table,
        _this = this;
      table = new Table;
      equities.forEach(function(equity) {
        table.cell('Name', equity.name);
        table.cell('ISIN', equity.isin);
        table.cell('WKN', equity.wkn);
        table.cell('Latest Price', equity.latestPrice, Table.Number(2));
        if (equity['rating']) {
          table.cell('Score', equity.rating.score, Table.Number(2));
          table.cell('Certainty, %', equity.rating.certainty * 100, Table.Number(2));
        }
        return table.newRow();
      });
      return table.toString();
    };

    return TableOutputFormatter;

  })(OutputFormatter);

  module.exports = TableOutputFormatter;

}).call(this);
