#!/usr/bin/env node

(function() {
  var ProgressBar, bar, cb, importer, lastProgress, list, name, opts, output, program, tick, trader, _ref, _ref1, _ref2, _ref3,
    __slice = [].slice;

  trader = require('../lib/trader.js');

  ProgressBar = require('progress');

  program = require('commander');

  list = function(val) {
    return val.split(':');
  };

  program.version('0.0.1').option('-p, --progress', 'show a progress bar if possible (do not use progress if you want to pipe the output)').option('-i, --import <importer>', 'importer to use to fetch equities [dax]', list, list('dax')).option('-o, --output <format>', 'choose output format [table]', list, list('table')).parse(process.argv);

  _ref = program["import"], name = _ref[0], opts = 2 <= _ref.length ? __slice.call(_ref, 1) : [];

  importer = (_ref1 = trader.Importer).create.apply(_ref1, [name].concat(__slice.call(opts)));

  _ref2 = program.output, name = _ref2[0], opts = 2 <= _ref2.length ? __slice.call(_ref2, 1) : [];

  output = (_ref3 = trader.OutputFormatter).create.apply(_ref3, [name].concat(__slice.call(opts)));

  tick = null;

  bar = null;

  if (program.progress) {
    lastProgress = 0;
    tick = function(progress, total) {
      if (!bar) {
        bar = new ProgressBar('[:bar] :percent', {
          total: total,
          width: 20,
          complete: '=',
          incomplete: ' '
        });
      }
      bar.tick(progress - lastProgress);
      return lastProgress = progress;
    };
  }

  cb = function(err, equities) {
    if (bar) {
      process.stdout.write('\n');
    }
    if (err) {
      process.stderr.write(err.message + '\n');
      process.exit(1);
    }
    process.stdout.write(output.equitiesToString(equities));
    return process.exit(0);
  };

  importer.getEquities(cb, tick);

}).call(this);
