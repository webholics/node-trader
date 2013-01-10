IndexImporter = require './index.js'

###
Import all 30 equities of the DAX with prices of Frankfurt Stock Exchange in Euro
###
class DaxImporter extends IndexImporter
    constructor: ->
        super 'DAX', 'FSE'

module.exports = DaxImporter