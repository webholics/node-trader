OutputFormatter = require '../outputformatter.js'
Table = require 'easy-table'

###
Output equities as JSON
###
class JsonOutputFormatter extends OutputFormatter
    ###
    @param {Boolean} min Whether to minimize the JSON output
    ###
    constructor: (min) ->
        this.min = if min then true else false

    ###
    Convert an array of equities to string
    ###
    equitiesToString: (equities) ->
        if this.min
            return JSON.stringify equities
        else
            return JSON.stringify equities, null, 2

module.exports = JsonOutputFormatter