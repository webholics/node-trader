trader = require '../lib/trader.js'
ProgressBar = require 'progress'
Table = require 'easy-table'
program = require 'commander'

program
    .version('0.0.1')
    .option('-p, --progress', 'show a progress bar if possible (do not use progress if you want to pipe the output)')
    .option('-e, --endpoint <endpoint>', 'endpoint to fetch data from [finanzennet]', String, 'finanzennet')
    .option('-o, --output <format>', 'choose output format [table]', String, 'table')

# list indices
program
    .command('indices')
    .description('list available stock indices')
    .action ->
        endpoint = trader.loadEndpoint(program.endpoint)
        endpoint.getIndices (err, indices) ->
            if err
                process.stderr.write err.message
                process.exit 1

            #process.stdout.write "#{ i.id }\t#{ i.name }\n" for i in indices
            table = new Table
            indices.forEach (row) =>
                table.cell 'id', row.id
                table.cell 'name', row.name
                table.newRow()
            process.stdout.write(table.print(indices))

            # speed up exit due to crawler pool this would take some seconds otherwise
            process.exit 0

# search equity
program
    .command('search <terms>')
    .description('search one or multiple equities separated by comma (only the first result for each search term is returned)')
    .action (terms) ->
        terms = terms.split(/\s*,\s*/)
        endpoint = trader.loadEndpoint(program.endpoint)
        output = trader.loadOutputFormatter(program.output)

        bar = null
        if program.progress and terms.length > 0
            bar = new ProgressBar('[:bar] :percent',
                total: terms.length
                width: 20
                complete: '='
                incomplete: ' '
            )
            bar.tick(0)

        results = []
        cbCounter = 0
        makeCb = (i) ->
            (err, equity) ->
                if err
                    process.stderr.write err.message + '\n'
                    process.exit 1

                results[i] = equity
                cbCounter++
                if bar
                    bar.tick()

                if cbCounter == terms.length
                    if bar
                        process.stdout.write '\n'

                    # cleanup results (there could be nulls in the array)
                    cleanResults = []
                    for result in results
                        if result
                            cleanResults.push result
                    if cleanResults.length == 0
                        process.stderr.write "No results found."

                    process.stdout.write(output.equitiesToString(cleanResults))

                    #speed up exit due to crawler pool this would take some seconds otherwise
                    process.exit 0

        for term, i in terms
            endpoint.searchEquity term, makeCb(i)

# get all equities by index
program
    .command('index <index>')
    .description('get all equities by index (one of the indices returned by `trader indices`)')
    .action (index) ->
        endpoint = trader.loadEndpoint(program.endpoint)
        output = trader.loadOutputFormatter(program.output)

        tick = null
        if program.progress
            bar = null
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
            if tick
                process.stdout.write '\n'

            if err
                process.stderr.write err.message + '\n'
                process.exit 1

            process.stdout.write(output.equitiesToString(equities))

            #speed up exit due to crawler pool this would take some seconds otherwise
            process.exit 0

        endpoint.getEquitiesByIndex index, cb, tick

program.parse process.argv