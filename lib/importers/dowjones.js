(function() {
  var DowjonesImporter, IndexImporter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  IndexImporter = require('./index.js');

  /*
  Import all 30 equities of DOW Jones 30 Industrial with prices of Frankfurt Stock Exchange in Euro
  */


  DowjonesImporter = (function(_super) {

    __extends(DowjonesImporter, _super);

    function DowjonesImporter() {
      DowjonesImporter.__super__.constructor.call(this, '969420', 'FSE');
    }

    return DowjonesImporter;

  })(IndexImporter);

  module.exports = DowjonesImporter;

}).call(this);
