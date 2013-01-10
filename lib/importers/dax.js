(function() {
  var DaxImporter, IndexImporter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  IndexImporter = require('./index.js');

  /*
  Import all 30 equities of the DAX with prices of Frankfurt Stock Exchange in Euro
  */


  DaxImporter = (function(_super) {

    __extends(DaxImporter, _super);

    function DaxImporter() {
      DaxImporter.__super__.constructor.call(this, 'DAX', 'FSE');
    }

    return DaxImporter;

  })(IndexImporter);

  module.exports = DaxImporter;

}).call(this);
