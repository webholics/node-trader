(function() {
  var Importer, JsonfileImporter, fs;

  Importer = require('../importer.js');

  fs = require('fs');

  /*
  Import equities from a JSON file.
  The JSON file needs to have the format of the JsonOutputFormatter.
  */


  JsonfileImporter = (function() {

    function JsonfileImporter(filename) {
      this.filename = filename;
    }

    /*
        Retrieve the list of all equities of the index.
    
        callback is called with Error|null and Array
    */


    JsonfileImporter.prototype.getEquities = function(cb) {
      var _this = this;
      fs.readFile(this.filename, function(err, data) {
        if (err) {
          cb(err, null);
          return;
        }
        return cb(null, JSON.parse(data));
      });
      return this;
    };

    return JsonfileImporter;

  })();

  module.exports = JsonfileImporter;

}).call(this);
