should = require 'should'

assertIndex = (index, name) ->
    should.exist index
    index.should.have.keys 'name', 'url', 'currentPrice', 'dailyPrices', 'monthlyPrices'

    if name
        index.name.should.equal name

    (index.currentPrice > 0).should.be.ok

    index.dailyPrices.length.should.equal 30
    for p in index.dailyPrices
        (p > 0).should.be.ok

    index.monthlyPrices.length.should.equal 12
    for p in index.monthlyPrices
        (p > 0).should.be.ok

assertEquity = (equity, name) ->
    should.exist equity
    equity.should.have.keys 'name', 'isin', 'wkn', 'currentPrice', 'dailyPrices', 'monthlyPrices'

    if name
        equity.name.should.equal name

describe 'FinanzennetEndpoint', ->
    Endpoint = require '../../lib/endpoints/finanzennet.js'
    endpoint = new Endpoint

    describe 'searchIndex()', ->
        it 'should return null when no index can be found', (done) ->
            endpoint.searchIndex '123456789foobar', (err, index) ->
                if err
                    done err
                should.not.exist index
                done()

        it 'should return valid index object when searching for dax', (done) ->
            endpoint.searchIndex 'dax', (err, index) ->
                if err
                    done err
                assertIndex index, 'DAX'
                done()

    describe 'getEquityByIsin()', ->
        it 'should return null when no equity can be found', (done) ->
            endpoint.getEquityByIsin '123456789foobar', 'FSE', (err, equity) ->
                if err
                    done err
                should.not.exist equity
                done()

        it 'should raise error when stock market is unknown or not available for this equity'

        it 'should return valid equity object when searching for DE0005140008', (done) ->
            endpoint.getEquityByIsin 'DE0005140008', 'FSE', (err, equity) ->
                if err
                    done err
                assertEquity equity, 'Deutsche Bank AG'
                done()

    describe 'searchEquity()', ->
        it 'should return null when no equity can be found', (done) ->
            endpoint.searchEquity '123456789foobar', 'FSE', (err, equity) ->
                if err
                    done err
                should.not.exist equity
                done()

        it 'should raise error when stock market is unknown or not available for this equity'

        it 'should return valid equity object when searching for Deutsche Bank AG', (done) ->
            endpoint.searchEquity 'Deutsche Bank AG', 'FSE', (err, equity) ->
                if err
                    done err
                assertEquity equity, 'Deutsche Bank AG'
                done()

    describe 'getEquityUrlsByIndex()', ->
        it 'should raise error when index unknown', (done) ->
            endpoint.getEquityUrlsByIndex '123456789foobar', (err, urls) ->
                err.should.be.instanceOf Error
                done()

        it 'should return 30 valid equity URLs when searching for DAX', (done) ->
            endpoint.getEquityUrlsByIndex 'DAX', (err, urls) ->
                if err
                    done err

                urls.length.should.equal 30

                equityUrlRegex = /http:\/\/www\.finanzen\.net\/aktien\/[^\/]+$/
                for url in urls
                    equityUrlRegex.test(url).should.be.ok
                done()

    describe 'crawlIndex()', ->
        it 'should raise error when URL is wrong', (done) ->
            endpoint.crawlIndex 'http://www.finanzen.net/aktien/adidas-Aktie', (err, index) ->
                err.should.be.instanceOf Error
                done()

        it 'should return a valid index object', (done) ->
            endpoint.crawlIndex 'http://www.finanzen.net/index/DAX', (err, index) ->
                if err
                    done err
                assertIndex index, 'DAX'
                done()

    describe 'crawlEquity()', ->
        it 'should raise error when URL is wrong', (done) ->
            endpoint.crawlEquity 'http://www.finanzen.net/index/DAX', 'FSE', (err, equity) ->
                err.should.be.instanceOf Error
                done()

        it 'should raise error when stock market is unknown or not available for this equity'

        it 'should return a valid equity object', (done) ->
            endpoint.crawlEquity 'http://www.finanzen.net/aktien/adidas-Aktie', 'FSE', (err, equity) ->
                if err
                    done err
                assertEquity equity, 'adidas AG'
                done()


###
    describe 'getEquitiesByIndex()', ->
        it 'should raise error when index unknown', (done) ->
            endpoint.getEquitiesByIndex '123456789foobar', (err, equities) ->
                assert.ok(err instanceof Error)
                done()

        it 'should return 30 valid equity objects when searching for DAX', (done) ->
            endpoint.getEquitiesByIndex 'DAX', (err, equities) ->
                if err
                    done err
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
                    done err
                assert.ok(numOfCallsTick > 0)
                done()

            endpoint.getEquitiesByIndex 'DAX', cb, tick

###