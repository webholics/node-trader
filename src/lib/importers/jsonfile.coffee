Importer = require '../importer.js'
fs = require 'fs'

###
Import equities from a JSON file.
The JSON file needs to have the format of the JsonOutputFormatter.
###
class JsonfileImporter
    constructor: (filename) ->
        @filename = filename

    ###
    Retrieve the list of all equities of the index.

    callback is called with Error|null and Array
    ###
    getEquities: (cb) ->
        fs.readFile @filename, (err, data) =>
            if err
                cb err, null
                return
            cb null, JSON.parse(data)
        this

module.exports = JsonfileImporter