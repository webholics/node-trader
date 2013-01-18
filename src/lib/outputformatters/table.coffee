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
        table = new Table

        equities.forEach (equity) =>
            table.cell 'Name', equity.name
            table.cell 'ISIN', equity.isin
            table.cell 'WKN', equity.wkn
            table.cell 'Latest Price', equity.latestPrice, Table.Number(2)

            if equity['rating']
                table.cell 'Score', equity.rating.score, Table.Number(2)
                table.cell 'Certainty, %', equity.rating.certainty * 100, Table.Number(2)

            table.newRow()
        table.toString()

module.exports = TableOutputFormatter