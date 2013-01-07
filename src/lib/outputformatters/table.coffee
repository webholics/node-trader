OutputFormatter = require '../outputformatter.js'
Table = require 'easy-table'

###
Output equities as an ASCII table
###
class TableOutputFormatter extends OutputFormatter
    constructor: ->

    ###
    Convert an array of equities to string
    ###
    equitiesToString: (equities) ->
        #table = new Table

        #equities.forEach (equity) =>
        #    table.cell('ISIN', equity.isin)
        #    table.cell('Name', equity.name)
        #    table.cell('WKN', equity.wkn)
        #    table.newRow()

        Table.printArray equities

module.exports = TableOutputFormatter