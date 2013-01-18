###
    Abstract equity rating which computes a score for a list of equities.
###
class Rating
    constructor: ->

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

    tick is an optional function which is called with two arguments (progress and total).
    Both arguments are integers. Total gives the total steps until the function finishes,
    whereas progress gives the number of steps already finished. The tick callback is useful to generate a progress bar.
    ###
    getRating: (equities, cb, tick) ->
        cb null, {}
        this

    ###
    Static factory method
    ###
    @create = (name, args...) ->
        c = require './ratings/' + name.toLowerCase() + '.js'
        new c(args...)

module.exports = Rating