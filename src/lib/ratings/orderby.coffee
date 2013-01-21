Rating = require '../rating.js'

###
Compute scores in a way to sort equities by a single facts ascending or descending.
###
class OrderbyRating extends Rating
    ###
    @param {String} factName Name of the fact to sort equities with. Must be a fact available in equity.latestFacts
    ###
    constructor: (factName, descending = true) ->
        this.factName = factName
        this.descending = descending

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
        ratings = {}

        for equity in equities
            if not equity.latestFacts.hasOwnProperty(this.factName) or equity.latestFacts[this.factName] == null
                ratings[equity.isin] =
                    score: 0
                    certainty: 0
            else
                score = equity.latestFacts[this.factName]
                if not this.descending
                    score *= -1
                ratings[equity.isin] =
                    score: score
                    certainty: 1

        cb null, ratings
        this

module.exports = OrderbyRating
