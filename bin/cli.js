#!/usr/bin/env node

(function() {
  var ProgressBar, Table, program, trader;

  trader = require('../lib/trader.js');

  ProgressBar = require('progress');

  Table = require('easy-table');

  program = require('commander');

  program.version('0.0.1').option('-p, --progress', 'show a progress bar if possible (do not use progress if you want to pipe the output)').option('-e, --endpoint <endpoint>', 'endpoint to fetch data from [finanzennet]', String, 'finanzennet').option('-o, --output <format>', 'choose output format [table]', String, 'table');

  program.command('indices').description('list available stock indices').action(function() {
    var endpoint;
    endpoint = trader.loadEndpoint(program.endpoint);
    return endpoint.getIndices(function(err, indices) {
      var table,
        _this = this;
      if (err) {
        process.stderr.write(err.message);
        process.exit(1);
      }
      table = new Table;
      indices.forEach(function(row) {
        table.cell('id', row.id);
        table.cell('name', row.name);
        return table.newRow();
      });
      process.stdout.write(table.print(indices));
      return process.exit(0);
    });
  });

  program.command('search <terms>').description('search one or multiple equities separated by comma (only the first result for each search term is returned)').action(function(terms) {
    var bar, cbCounter, endpoint, i, makeCb, output, results, term, _i, _len, _results;
    terms = terms.split(/\s*,\s*/);
    endpoint = trader.loadEndpoint(program.endpoint);
    output = trader.loadOutputFormatter(program.output);
    bar = null;
    if (program.progress && terms.length > 0) {
      bar = new ProgressBar('[:bar] :percent', {
        total: terms.length,
        width: 20,
        complete: '=',
        incomplete: ' '
      });
      bar.tick(0);
    }
    results = [];
    cbCounter = 0;
    makeCb = function(i) {
      return function(err, equity) {
        var cleanResults, result, _i, _len;
        if (err) {
          process.stderr.write(err.message + '\n');
          process.exit(1);
        }
        results[i] = equity;
        cbCounter++;
        if (bar) {
          bar.tick();
        }
        if (cbCounter === terms.length) {
          if (bar) {
            process.stdout.write('\n');
          }
          cleanResults = [];
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            result = results[_i];
            if (result) {
              cleanResults.push(result);
            }
          }
          if (cleanResults.length === 0) {
            process.stderr.write("No results found.");
          }
          process.stdout.write(output.equitiesToString(cleanResults));
          return process.exit(0);
        }
      };
    };
    _results = [];
    for (i = _i = 0, _len = terms.length; _i < _len; i = ++_i) {
      term = terms[i];
      _results.push(endpoint.searchEquity(term, makeCb(i)));
    }
    return _results;
  });

  program.command('index <index>').description('get all equities by index (one of the indices returned by `trader indices`)').action(function(index) {
    var bar, cb, endpoint, lastProgress, output, tick;
    endpoint = trader.loadEndpoint(program.endpoint);
    output = trader.loadOutputFormatter(program.output);
    tick = null;
    if (program.progress) {
      bar = null;
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
      if (tick) {
        process.stdout.write('\n');
      }
      if (err) {
        process.stderr.write(err.message + '\n');
        process.exit(1);
      }
      process.stdout.write(output.equitiesToString(equities));
      return process.exit(0);
    };
    return endpoint.getEquitiesByIndex(index, cb, tick);
  });

  program.parse(process.argv);

}).call(this);
