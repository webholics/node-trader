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
        this.isin = isin
        this.stockMarket = stockMarket

    ###
    Retrieve the equity.

    callback is called with Error|null and Array
    ###
    getEquities: (cb, tick) ->
        finanzennetEndpoint = Endpoint.create 'finanzennet'
        boersennewsEndpoint = Endpoint.create 'boersennews'

        if tick
            tick 0, 1

        finanzennetEndpoint.getEquityByIsin this.isin, this.stockMarket, (err, equity) =>
            if err
                cb err, null
                return

            # fetch additional data from boersennews.de
            boersennewsEndpoint.getEquityByIsin equity.isin, (err, equity2) =>
                if err
                    cb err, null
                    return

                # merge data
                equity.latestFacts = equity2.latestFacts
                equity.historicFacts = equity2.historicFacts

                if tick
                    tick 1, 1

                cb null, [equity]
        this

module.exports = IsinImporter