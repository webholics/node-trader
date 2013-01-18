Endpoint = require '../endpoint.js'
Crawler = require('crawler').Crawler

###
Fetch stock data from boersennews.de
###
class BoersennewsEndpoint extends Endpoint
    constructor: ->
        this.baseUrl = 'http://www.boersennews.de'
        this.crawler = new Crawler
            forceUTF8: true
            #debug: true
            maxConnections: 10
            # Means if we request the same URI twice it is not crawled again.
            # But callback will be called!
            # This means you have to create a new endpoint if you want to flush the cash!
            cache: true

    ###
    Retrieve a single equity by ISIN
    ###
    getEquityByIsin: (isin, cb) ->
        isin = isin.toLowerCase()

        # search supports GET requests
        url = 'http://www.boersennews.de/markt/search/simple/key/' + encodeURIComponent(isin) + '/category/sto'
        this.crawler.queue [
            uri: url
            callback: (error, result, $) =>
                if error
                    cb new Error('Could not load boersennews.de!'), null
                    return

                url = null
                for row in $('table.tabList.lastLine tr:has(td)')
                    tds = $(row).find('td')
                    if $(tds[2]).text().toLowerCase() == isin
                        url = this.baseUrl + $(tds[0]).find('a').attr('href').replace("/profile", "/fundamental")
                        break

                if not url
                    cb null, null
                    return

                this.crawlEquity url, cb
            ]
        this

    ###
    Crawl an equity by its URL on boersennews.de
    This methods crawls only stock facts page.

    @param {String} url URL of an equity "Fundamentale Daten" page on boersennews.de
    @param {Function} cb Callback is called with Error|null and Object, the crawled equity
    ###
    crawlEquity: (url, cb) ->
        this.crawler.queue [
            uri: url
            callback: (error, result, $) =>
                if error
                    cb new Error('Could not load boersennews.de!'), null
                    return

                if not this._isValidEquityUrl(result.request.href)
                    cb new Error('Not a valid equity URL!'), null
                    return

                equity =
                    name: $('h2').text().replace(' Fundamentale Daten', '')

                # WKN and ISIN
                matches = /ISIN:\s([^\s]+)\s\|\sWKN:\s([^\s]+)/.exec($('.instrumentInfos h3').text())
                equity.isin = matches[1]
                equity.wkn = matches[2]

                # find available years
                colsMap = {}
                for col, i in $('.tabList tr').eq(0).find('th')
                    if /^\d+$/.test $(col).text()
                        colsMap[$(col).text()] = i

                # create facts per year with null values
                factsPerYear = {}
                for year, i of colsMap
                    factsPerYear[year] =
                        year: year
                        pbRatio: null
                        peRatio: null
                        dividendPerStock: null
                        returnOfEquity: null
                        ebit: null
                        ebitda: null
                        ebitMargin: null
                        ebitdaMargin: null
                        equityRatio: null
                        marketCap: null

                # helper function
                fillFacts = (cols, key) =>
                    for year, colIndex of colsMap
                        # parse number
                        matches = /([0-9,\.-]+)/.exec(cols.eq(colIndex).text())
                        if matches and matches[1] != '-'
                            num = parseFloat matches[1].replace('.', '').replace(',', '.')
                            factsPerYear[year][key] = num

                #iterate over table rows and fill as much facts as possible
                for row in $('.tabList tr:has(td)')
                    cols = $(row).find('td')
                    label = cols.eq(0).text()

                    if /^\s*Marktkapitalisierung\/EBITDA/.test label
                        fillFacts cols, 'marketCapPerEbitda'
                        continue
                    if /^\s*KGV/.test label
                        fillFacts cols, 'peRatio'
                        continue
                    if /^\s*KBV/.test label
                        fillFacts cols, 'pbRatio'
                        continue
                    if /^\s*Dividende je Aktie/.test label
                        fillFacts cols, 'dividendPerStock'
                        continue
                    if /^\s*Eigenkapitalrendite/.test label
                        fillFacts cols, 'returnOfEquity'
                        continue
                    if /^\s*Eigenkapitalquote/.test label
                        fillFacts cols, 'equityRatio'
                        continue
                    if /^\s*EBIT-Marge/.test label
                        fillFacts cols, 'ebitMargin'
                        continue
                    if /^\s*EBITDA-Marge/.test label
                        fillFacts cols, 'ebitdaMargin'
                        continue
                    if /^\s*EBITDA/.test label
                        fillFacts cols, 'ebitda'
                        continue
                    if /^\s*EBIT/.test label
                        fillFacts cols, 'ebit'
                        continue

                # compute additional facts
                for i, obj of factsPerYear
                    if obj.marketCapPerEbitda != null and obj.ebitda != null
                        obj.marketCap = obj.marketCapPerEbitda * obj.ebitda

                facts = []
                for i, obj of factsPerYear
                    # remove unnecessary facts
                    delete obj['marketCapPerEbitda']

                    facts.push obj
                facts.sort (a,b) -> b.year - a.year

                equity.latestFacts = facts.shift()
                equity.historicFacts = facts

                cb null, equity
            ]
        this

    _isValidEquityUrl: (url) -> /^http:\/\/www\.boersennews\.de\/markt\/aktien\/[^\/]+\/[^\/]+\/fundamental$/.test(url)

module.exports = BoersennewsEndpoint