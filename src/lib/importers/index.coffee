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
        this.indexName = indexName
        this.stockMarket = stockMarket

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

        finanzennetEndpoint.getEquityUrlsByIndex this.indexName, (err, urls) =>
            if err
                cb err, null
                return

            if tick
                tick 0, urls.length

            equities = []
            callbackCounter = 0
            for url in urls
                finanzennetEndpoint.crawlEquity url, this.stockMarket, (err, equity) =>
                    if err
                        if callbackCounter < urls.length
                            callbackCounter = urls.length + 1 # prevent calling cb a second time
                            cb err, null
                        return

                    # fetch additional data from boersennews.de
                    boersennewsEndpoint.getEquityByIsin equity.isin, (err, equity2) =>
                        if err
                            if callbackCounter < urls.length
                                callbackCounter = urls.length + 1 # prevent calling cb a second time
                                cb err, null
                            return

                        # merge data
                        equity.latestFacts = equity2.latestFacts
                        equity.historicFacts = equity2.historicFacts

                        equities.push equity
                        callbackCounter++

                        if tick
                            tick callbackCounter, url.length

                        if callbackCounter == urls.length
                            cb null, equities
        this

module.exports = IndexImporter