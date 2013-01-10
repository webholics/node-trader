should = require 'should'

describe 'Endpoint', ->
    FinanzennetEndpoint = require '../lib/endpoints/finanzennet.js'
    Endpoint = require '../lib/endpoint.js'

    describe 'create()', ->
        it 'should return instance of FinanzennetEndpoint', ->
            e = Endpoint.create 'finanzennet'
            e.should.be.an.instanceOf FinanzennetEndpoint