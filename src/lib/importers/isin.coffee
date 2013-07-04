Importer = require '../importer.js'
Endpoint = require '../endpoint.js'

###
Import a single equity by ISIN
###
class IsinImporter
    ###
    @param {String} isin ISIN equity identifier
    @param {String} stockMarket The finanzen.net string for a stock market (e.g. FSE for Frankfurt Stock Exchange)
    ###
    constructor: (isin, stockMarket = 'FSE') ->
        @isin = isin
        @stockMarket = stockMarket

    ###
    Retrieve the equity.

    callback is called with Error|null and Array
    ###
    getEquities: (cb, tick) ->
        finanzennetEndpoint = Endpoint.create 'finanzennet'
        boersennewsEndpoint = Endpoint.create 'boersennews'

        if tick
            tick 0, 1

        finanzennetEndpoint.getEquityByIsin @isin, @stockMarket, (err, equity) =>
            if err
                cb err, null
                return

            # fetch additional data from boersennews.de
            boersennewsEndpoint.getEquityByIsin equity.isin, (err, equity2) =>
                if not err
                    # merge data
                    equity.latestFacts = if equity2 then equity2.latestFacts else {}
                    equity.historicFacts = if equity2 then equity2.historicFacts else []

                if tick
                    tick 1, 1

                cb null, [equity]
        this

module.exports = IsinImporter