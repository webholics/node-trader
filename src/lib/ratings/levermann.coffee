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
                    this.getIndicatorReturnOfEquity(equity),
                    this.getIndicatorEbitMargin(equity),
                    this.getIndicatorEquityRatio(equity),
                    this.getIndicatorPbRatio(equity),
                    this.getIndicatorPeRatio(equity),
                    this.getIndicatorPeRatioMean(equity),
                    this.getIndicatorPerformance12M(equity),
                    this.getIndicatorPerformance6M(equity),
                    this.getIndicatorPriceMomentum(equity),
                    this.getIndicator3MonthReversal(equity, index)
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

    getIndicatorEquityRatio: (equity) ->
        val = equity.latestFacts.equityRatio
        if val == null
            return new Error

        if val > 25
            return 1
        if val < 15
            return -1
        return 0

    getIndicatorPbRatio: (equity) ->
        val = equity.latestFacts.pbRatio
        if val == null
            return new Error

        if val < 0.6
            return 2
        if val < 0.9
            return 1
        if val < 1.3
            return 0
        return -1

    getIndicatorPeRatio: (equity) ->
        val = equity.latestFacts.peRatio
        if val == null
            return new Error

        if val < 12
            return 1
        if val > 16
            return -1
        return 0

    getIndicatorPeRatioMean: (equity) ->
        # the mean of the last 5 years
        numYears = 5

        val = 0
        if equity.latestFacts.peRatio == null
            return new Error
        else
            val += equity.latestFacts.peRatio

        if not equity.historicFacts or equity.historicFacts.length < numYears-1
            return new Error

        for facts, i in equity.historicFacts
            if i == numYears-1
                break
            if facts.peRatio == null
                return new Error
            val += facts.peRatio

        val /= numYears

        if val < 12
            return 1
        if val > 16
            return -1
        return 0

    getIndicatorPerformance12M: (equity) ->
        if not equity.latestPrice or not equity.monthlyPrices or equity.monthlyPrices.length < 12
            return new Error

        ratio =  equity.latestPrice / equity.monthlyPrices[11]

        if ratio > 1.05
            return 1
        if ratio < 0.95
            return -1
        return 0

    getIndicatorPerformance6M: (equity) ->
        if not equity.latestPrice or not equity.monthlyPrices or equity.monthlyPrices.length < 6
            return new Error

        ratio =  equity.latestPrice / equity.monthlyPrices[5]

        if ratio > 1.05
            return 1
        if ratio < 0.95
            return -1
        return 0

    getIndicatorPriceMomentum: (equity) ->
        score12M = this.getIndicatorPerformance12M equity
        score6M = this.getIndicatorPerformance6M equity

        if score12M instanceof Error or score6M instanceof Error
            return new Error

        if score6M == 1 and score12M <= 0
            return 1
        if score6M == -1 and score12M >= 0
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
