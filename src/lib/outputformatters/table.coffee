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

        nullEquities = 0
        equities.forEach (equity) =>
            if not equity
                # count number of null equities (those equities where data could not be retrieved)
                nullEquities++
                return

            table.cell 'Name', equity.name
            table.cell 'ISIN', equity.isin
            table.cell 'WKN', equity.wkn
            table.cell 'Latest Price (' + equity.currency + ')', equity.latestPrice, Table.Number(2)

            if equity['rating']
                table.cell 'Score', equity.rating.score, Table.Number(2)
                table.cell 'Certainty, %', equity.rating.certainty * 100, Table.Number(2)

            table.newRow()

        output = table.toString()

        if nullEquities > 0
            output += '\n' + nullEquities + ' equities missing!'

        output

module.exports = TableOutputFormatter