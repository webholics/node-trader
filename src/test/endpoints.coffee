assert = require 'assert'

assertIndex = (index, name) ->
    assert.ok index

    if name
        assert.strictEqual index.name, name
    else
        assert.ok index.name

    assert.ok(index.currentPrice > 0)

    assert.strictEqual index.dailyPrices.length, 30
    for p in index.dailyPrices
        assert.ok(p > 0)

    assert.strictEqual index.monthlyPrices.length, 12
    for p in index.monthlyPrices
        assert.ok(p > 0)

assertEquity = (equity, name) ->
    assert.ok equity

    if name
        assert.strictEqual equity.name, name
    else
        assert.ok equity.name

describe 'FinanzennetEndpoint', ->
    Endpoint = require '../lib/endpoints/finanzennet.js'
    endpoint = new Endpoint

    describe 'searchIndex()', ->
        it 'should return null when no index can be found', (done) ->
            endpoint.searchIndex '123456789foobar', (err, index) ->
                if err
                    done(err)
                assert.strictEqual index, null
                done()

        it 'should return valid index object when searching for dax', (done) ->
            endpoint.searchIndex 'dax', (err, index) ->
                if err
                    done(err)
                assertIndex index, 'DAX'
                done()

    describe 'getEquityByIsin()', ->
        it 'should return null when no equity can be found', (done) ->
            endpoint.getEquityByIsin '123456789foobar', (err, equity) ->
                if err
                    done(err)
                assert.strictEqual equity, null
                done()

        it 'should return valid equity object when searching for DE0005140008', (done) ->
            endpoint.getEquityByIsin 'DE0005140008', (err, equity) ->
                if err
                    done(err)
                assertEquity equity, 'Deutsche Bank AG'
                done()

    describe 'searchEquity()', ->
        it 'should return null when no equity can be found', (done) ->
            endpoint.searchEquity '123456789foobar', (err, equity) ->
                if err
                    done(err)
                assert.strictEqual equity, null
                done()

        it 'should return valid equity object when searching for Deutsche Bank AG', (done) ->
            endpoint.searchEquity 'Deutsche Bank AG', (err, equity) ->
                if err
                    done(err)
                assertEquity equity, 'Deutsche Bank AG'
                done()


    describe 'getEquitiesByIndex()', ->
        it 'should raise error when index unknown', (done) ->
            endpoint.getEquitiesByIndex '123456789foobar', (err, equities) ->
                assert.ok(err instanceof Error)
                done()

        it 'should return 30 valid equity objects when searching for DAX', (done) ->
            endpoint.getEquitiesByIndex 'DAX', (err, equities) ->
                if err
                    done(err)
                assert.strictEqual equities.length, 30
                for equity in equities
                    assertEquity equity
                done()

        it 'should call tick multiple times if callback is set', (done) ->
            totalLength = null
            numOfCallsTick = 0
            tick = (progress, total) =>
                numOfCallsTick++

                 # this value should be set only once, progress bar length should never change
                assert.ok(totalLength == null or totalLength == total)

                assert.ok(progress >= 0 and progress <= total)

            cb = (err, equities) =>
                if err
                    done(err)
                assert.ok(numOfCallsTick > 0)
                done()

            endpoint.getEquitiesByIndex 'DAX', cb, tick
