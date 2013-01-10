trader = require '../lib/trader.js'
ProgressBar = require 'progress'
program = require 'commander'

# parse a list separated by :
list = (val) -> val.split(':')

program
    .version('0.0.1')
    .option('-p, --progress', 'show a progress bar if possible (do not use progress if you want to pipe the output)')
    .option('-i, --import <importer>', 'importer to use to fetch equities [dax]', list, list('dax'))
    .option('-o, --output <format>', 'choose output format [table]', list, list('table'))
    .parse(process.argv)

[name, opts...] = program.import
importer = trader.Importer.create name, opts...
[name, opts...] = program.output
output = trader.OutputFormatter.create name, opts...

tick = null
bar = null
if program.progress
    lastProgress = 0
    tick = (progress, total) ->
        # init bar on first call
        if not bar
            bar = new ProgressBar('[:bar] :percent',
                total: total
                width: 20
                complete: '='
                incomplete: ' '
            )
        bar.tick(progress - lastProgress)
        lastProgress = progress


cb = (err, equities) ->
    if bar
        process.stdout.write '\n'

    if err
        process.stderr.write err.message + '\n'
        process.exit 1

    process.stdout.write output.equitiesToString(equities)

    #speed up exit due to crawler pool this would take some seconds otherwise
    process.exit 0

importer.getEquities cb, tick
