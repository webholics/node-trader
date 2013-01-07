###
Trader main module with helper functions to work with endpoints, output formatters and ratings
###

# Endpoints
# ----------------------------------------------

exports.loadEndpoint = (name, args...) ->
    Endpoint = require './endpoints/' + name.toLowerCase() + '.js'
    new Endpoint(args...)

# Output Formatters
# ----------------------------------------------

exports.loadOutputFormatter = (name, args...) ->
    OutputFormatters = require './outputformatters/' + name.toLowerCase() + '.js'
    new OutputFormatters(args...)