#!/usr/bin/env node

(function() {
  var ProgressBar, importer, importerCb, list, makeTick, name, opts, output, program, rating, trader, _ref, _ref1, _ref2, _ref3, _ref4, _ref5,
    __slice = [].slice;

  trader = require('../lib/trader.js');

  ProgressBar = require('progress');

  program = require('commander');

  list = function(val) {
    return val.split(':');
  };

  program.version('0.0.1').option('-p, --progress', 'show a progress bar if possible (do not use progress if you want to pipe the output)').option('-i, --import <importer>', 'importer to use to fetch equities [dax]', list, list('dax')).option('-o, --output <format>', 'choose output format [table]', list, list('table')).option('-r, --rating <type>', 'choose rating system [none]', list, null).parse(process.argv);

  _ref = program["import"], name = _ref[0], opts = 2 <= _ref.length ? __slice.call(_ref, 1) : [];

  importer = (_ref1 = trader.Importer).create.apply(_ref1, [name].concat(__slice.call(opts)));

  _ref2 = program.output, name = _ref2[0], opts = 2 <= _ref2.length ? __slice.call(_ref2, 1) : [];

  output = (_ref3 = trader.OutputFormatter).create.apply(_ref3, [name].concat(__slice.call(opts)));

  rating = null;

  if (program.rating) {
    _ref4 = program.rating, name = _ref4[0], opts = 2 <= _ref4.length ? __slice.call(_ref4, 1) : [];
    rating = (_ref5 = trader.Rating).create.apply(_ref5, [name].concat(__slice.call(opts)));
  }

  makeTick = function(title) {
    var bar, lastProgress;
    bar = null;
    lastProgress = 0;
    return function(progress, total) {
      if (!bar) {
        bar = new ProgressBar(title + ' [:bar] :percent', {
          total: total,
          width: 20,
          complete: '=',
          incomplete: ' '
        });
      }
      bar.tick(progress - lastProgress);
      lastProgress = progress;
      if (progress === total) {
        return process.stdout.write('\n');
      }
    };
  };

  importerCb = function(err, equities) {
    var ratingCb;
    if (err) {
      process.stderr.write(err.message + '\n');
      process.exit(1);
    }
    if (!rating) {
      process.stdout.write(output.equitiesToString(equities));
      process.exit(0);
    }
    ratingCb = function(err, ratings) {
      var e, _i, _len;
      for (_i = 0, _len = equities.length; _i < _len; _i++) {
        e = equities[_i];
        e.rating = ratings[e.isin];
      }
      equities.sort(function(a, b) {
        if (a.rating.score === b.rating.score) {
          return b.rating.certainty - a.rating.certainty;
        }
        return b.rating.score - a.rating.score;
      });
      process.stdout.write(output.equitiesToString(equities));
      return process.exit(0);
    };
    return rating.getRating(equities, ratingCb);
  };

  importer.getEquities(importerCb, (program.progress ? makeTick('Importing equities:\t') : void 0));

}).call(this);
