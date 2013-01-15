###
    Abstract data importer to fetch equities

    Equity:
    ---------
    An equity object should contain the following attributes:
    {
        isin: The ISIN unique equity id
        name: The name of the equity
        latestPrice: The current price (as realtime as possible)
        monthlyPrices: [...] Array of monthly prices of the first day in each month of the last 12 months starting with the price at the beginning of the current month.
        dailyPrices: [...] Array of daily prices at the beginning of each day in the last 30 trading(!) days starting with the price of the last ended trading day.
        latestFacts: {
            year: The year of the facts
            pbRatio: P/B ratio (german: KBV)
            peRatio: P/E ratio (german: KGV)
        }
        historicFacts: [{},...] Array containing the same objects as latestFacts but with facts of the last years, latestFacts is not included in this list
    }

    The following attributes are optional:
    {
        wkn: The WKN unique equity id
    }

    If some values cannot be retrieved they will be null.
###
class Importer
    constructor: ->

    ###
    Retrieve a list of equities.
    The importer defines which equities this list contains.

    callback is called with Error|null and Array

    tick is an optional function which is called with two arguments (progress and total).
    Both arguments are integers. Total gives the total steps until getEquitiesByIndex finishes,
    whereas progress gives the number of steps already finished. The tick callback is useful to generate a progress bar.
    ###
    getEquities: (cb, tick) ->
        cb(null, [])
        this

    ###
    Static factory method
    ###
    @create = (name, args...) ->
        c = require './importers/' + name.toLowerCase() + '.js'
        new c(args...)

module.exports = Importer