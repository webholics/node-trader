###
    Abstract data endpoint to fetch equity Data

    All endpoints basically define their own methods to retrieve data.
    Because retrievable data is heavily depends on the individual data endpoint.

    A single endpoint does not need to retrieve all equity attributes needed for rating.
    It is totally up to the importer to combine different endpoints in a way to retrieve all necessary attributes.
###
class Endpoint
    constructor: ->

    ###
    Static factory method
    ###
    @create = (name, args...) ->
        c = require './endpoints/' + name.toLowerCase() + '.js'
        new c(args...)

module.exports = Endpoint