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
    .option('-r, --rating <type>', 'choose rating system [none]', list, null)
    .parse(process.argv)

[name, opts...] = program.import
importer = trader.Importer.create name, opts...
[name, opts...] = program.output
output = trader.OutputFormatter.create name, opts...

rating = null
if program.rating
    [name, opts...] = program.rating
    rating = trader.Rating.create name, opts...

makeTick = (title) ->
    bar = null
    lastProgress = 0
    return (progress, total) ->
        # init bar on first call
        if not bar
            bar = new ProgressBar(title + ' [:bar] :percent',
                total: total
                width: 20
                complete: '='
                incomplete: ' '
            )
        bar.tick(progress - lastProgress)
        lastProgress = progress

        if progress == total
            process.stdout.write '\n'

importerCb = (err, equities) ->
    if err
        process.stderr.write err.message + '\n'
        process.exit 1

    if not rating
        process.stdout.write output.equitiesToString(equities)
        #speed up exit due to crawler pool this would take some seconds otherwise
        process.exit 0

    ratingCb = (err, ratings) ->
        for e in equities
            e.rating = ratings[e.isin]

        # order by score descendin
        equities.sort (a, b) ->
            if a.rating.score == b.rating.score
                return b.rating.certainty - a.rating.certainty
            return b.rating.score - a.rating.score

        process.stdout.write output.equitiesToString(equities)
        #speed up exit due to crawler pool this would take some seconds otherwise
        process.exit 0

    rating.getRating equities, ratingCb

importer.getEquities importerCb, (makeTick('Importing equities:\t') if program.progress)
