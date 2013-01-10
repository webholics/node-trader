###
Abstract output formatter to convert equities to string
###
class OutputFormatter
    constructor: ->

    ###
    Convert an array of equities to string
    ###
    equitiesToString: (equities) ->
        ''

    ###
    Static factory method
    ###
    @create = (name, args...) ->
        c = require './outputformatters/' + name.toLowerCase() + '.js'
        new c(args...)

module.exports = OutputFormatter