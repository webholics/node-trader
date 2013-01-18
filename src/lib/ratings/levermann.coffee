Rating = require '../rating.js'
Endpoint = require '../endpoint.js'

###
Compute scores according to Susanne Levermann's book "Der entspannte Weg zum Reichtum".
###
class LevermannRating extends Rating
    ###
    @param {String} indexName Name of the index used for perfomance comparison, uses search on finanzen.net to find the actual index
    ###
    constructor: (indexName) ->
        this.indexName = indexName
        this.finanzennetEndpoint = Endpoint.create 'finanzennet'

    ###
    Compute the rating for a list of equities.

    callback is called with Error|null and Object of the form:
    {
        [isin]: {
            score: Some float or integer, the higher the better
            certainty: 0-1 (a percentage) This value is equal to 1 if no value necessary for the rating process was missing. Therefore it gives the percentage of necessary equity facts which were available.
        }
        ...
    }
    ###
    getRating: (equities, cb) ->
        # we need to load the index first
        this.finanzennetEndpoint.searchIndex this.indexName, (err, index) =>
            if err
                cb err, null
                return

            # combine indicators
            ratings = {}
            for equity in equities
                totalScore = 0
                totalErrors = 0

                scores = [
                    this.getIndicatorReturnOfEquity equity,
                    this.getIndicator3MonthReversal equity, index
                ]
                for score in scores
                    if score instanceof Error
                        totalErrors++
                    else
                        totalScore += score

                ratings[equity.isin] =
                    score: totalScore
                    certainty: (scores.length - totalErrors) / scores.length

            cb null, ratings
        this

    getIndicatorReturnOfEquity: (equity) ->
        val = equity.latestFacts.returnOfEquity
        if val == null
            return new Error

        if val > 20
            return 1
        if val < 10
            return -1
        return 0

    getIndicatorEbitMargin: (equity) ->
        val = equity.latestFacts.ebitMargin
        if val == null
            return new Error

        if val > 12
            return 1
        if val < 6
            return -1
        return 0

    getIndicator3MonthReversal: (equity, index) ->
        if not this.isLargeCap
            return 0

        if not equity.monthlyPrices or equity.monthlyPrices.length < numMonths+1
            return new Error

        if not index.monthlyPrices or index.monthlyPrices.length < numMonths+1
            return new Error

        # the number of month to compare the performance of the index to the equity
        numMonths = 3
        more = 0
        less = 0

        for i in [0..(numMonths-1)]
            equityPerformance = equity.monthlyPrices[i] / equity.monthlyPrices[i+1]
            indexPerformance = index.monthlyPrices[i] / index.monthlyPrices[i+1]

            if equityPerformance < indexPerformance
                less++
            else if equityPerformance > indexPerformance
                more++

        if less == numMonths
            return 1
        if more == numMonths
            return -1
        return 0

    isLargeCap: (equity) ->
        if equity.latestFacts.marketCap == null
            return false

        # market cap needs to be in Euro
        equity.latestFacts.marketCap > (5 * Math.pow(10, 9))

module.exports = LevermannRating
