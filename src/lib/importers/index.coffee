Importer = require '../importer.js'
Endpoint = require '../endpoint.js'

###
Import all equities of an index
###
class IndexImporter
    ###
    @param {String} indexName Name of the index, uses search on finanzen.net to find the actual index
    @param {String} stockMarket The finanzen.net string for a stock market (e.g. FSE for Frankfurt Stock Exchange)
    ###
    constructor: (indexName, stockMarket = 'FSE') ->
        @indexName = indexName
        @stockMarket = stockMarket

    ###
    Retrieve the list of all equities of the index.

    callback is called with Error|null and Array

    tick is an optional function which is called with two arguments (progress and total).
    Both arguments are integers. Total gives the total steps until getEquitiesByIndex finishes,
    whereas progress gives the number of steps already finished. The tick callback is useful to generate a progress bar.
    ###
    getEquities: (cb, tick) ->
        finanzennetEndpoint = Endpoint.create 'finanzennet'
        boersennewsEndpoint = Endpoint.create 'boersennews'

        finanzennetEndpoint.getEquityUrlsByIndex @indexName, (err, urls) =>
            if err
                cb err, null
                return

            if tick
                tick 0, urls.length

            equities = []
            callbackCounter = 0
            countEquity = =>
                callbackCounter++
                if tick
                    tick callbackCounter, urls.length
                if callbackCounter == urls.length
                    cb null, equities

            for url in urls
                finanzennetEndpoint.crawlEquity url, @stockMarket, (err, equity) =>
                    if err
                        equities.push null
                        countEquity()
                        return

                    # fetch additional data from boersennews.de
                    boersennewsEndpoint.getEquityByIsin equity.isin, (err, equity2) =>
                        if not err
                            # merge data
                            equity.latestFacts = if equity2 then equity2.latestFacts else {}
                            equity.historicFacts = if equity2 then equity2.historicFacts else []

                        equities.push equity
                        countEquity()
        this

    getStockMarket: -> return @stockMarket
    getIndexName: -> return @indexName

module.exports = IndexImporter