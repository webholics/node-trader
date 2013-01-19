IndexImporter = require './index.js'

###
Import all 30 equities of DOW Jones 30 Industrial with prices of Frankfurt Stock Exchange in Euro
###
class DowjonesImporter extends IndexImporter
    constructor: ->
        super '969420', 'FSE'

module.exports = DowjonesImporter