should = require 'should'

assertEquity = (equity, name) ->
    should.exist equity
    equity.should.have.keys 'name', 'isin', 'wkn', 'latestFacts', 'historicFacts'

    if name
        equity.name.should.equal name

describe 'BoersennewsEndpoint', ->
    Endpoint = require '../../lib/endpoints/boersennews.js'
    endpoint = new Endpoint

    describe 'getEquityByIsin()', ->
        it 'should return null when no equity can be found', (done) ->
            endpoint.getEquityByIsin '123456789foobar', (err, equity) ->
                if err
                    done err
                should.not.exist equity
                done()

        it 'should return valid equity object when searching for DE0005140008', (done) ->
            endpoint.getEquityByIsin 'DE0005140008', (err, equity) ->
                if err
                    done err
                assertEquity equity, 'DEUTSCHE BANK'
                done()

    describe 'crawlEquity()', ->
        it 'should raise error when URL is wrong', (done) ->
            endpoint.crawlEquity 'http://www.boersennews.de/markt/indizes/dax-performance-index-de0008469008/20735/profile', (err, equity) ->
                err.should.be.instanceOf Error
                done()

        it 'should return a valid equity object', (done) ->
            endpoint.crawlEquity 'http://www.boersennews.de/markt/aktien/adidas-ag-na-on-de000a1ewww0/36714349/fundamental', (err, equity) ->
                if err
                    done err
                assertEquity equity, 'ADIDAS'
                done()
