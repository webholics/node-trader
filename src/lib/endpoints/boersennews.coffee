Endpoint = require '../endpoint.js'
Crawler = require('crawler').Crawler

###
Fetch stock data from boersennews.de

Attention: This endpoint returns all facts in currency EUR!
###
class BoersennewsEndpoint extends Endpoint
    constructor: ->
        @baseUrl = 'http://www.boersennews.de'
        @crawler = new Crawler
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
        @crawler.queue [
            uri: url
            callback: (error, result, $) =>
                if error or result.statusCode != 200
                    cb new Error('Could not load boersennews.de!'), null
                    return

                url = null
                for row in $('table.tabList.lastLine tr:has(td)')
                    tds = $(row).find('td')
                    if $(tds[2]).text().toLowerCase() == isin
                        url = @baseUrl + $(tds[0]).find('a').attr('href').replace("/profile", "/fundamental")
                        break

                if not url
                    cb null, null
                    return

                @crawlEquity url, cb
            ]
        this

    ###
    Crawl an equity by its URL on boersennews.de
    This methods crawls only stock facts page.

    @param {String} url URL of an equity "Fundamentale Daten" page on boersennews.de
    @param {Function} cb Callback is called with Error|null and Object, the crawled equity
    ###
    crawlEquity: (url, cb) ->
        @crawler.queue [
            uri: url
            callback: (error, result, $) =>
                if error or result.statusCode != 200
                    cb new Error('Could not load boersennews.de!'), null
                    return

                if not @_isValidEquityUrl(result.request.href)
                    cb new Error('Not a valid equity URL!'), null
                    return

                equity =
                    name: $('h1').text().replace(' Fundamentale Daten', '')

                # WKN and ISIN
                matches = /ISIN:\s+([^\s]+)\s+\|\s+WKN:\s+([^\s]+)/.exec($('.instrumentInfos .attLine').text())
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
                        fillFacts cols, 'dividendPerShare'
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
                    if /^\s*Ergebnis je Aktie/.test label
                        fillFacts cols, 'earningsPerShare'
                        continue
                    if /^\s*Dynamisches KGV/.test label
                        fillFacts cols, 'dynamicPeRatio'
                        continue
                    if /^\s*Cashflow je Aktie/.test label
                        fillFacts cols, 'cashflowPerShare'
                        continue
                    if /^\s*KCV/.test label
                        fillFacts cols, 'pcfRatio'
                        continue
                    if /^\s*KUV/.test label
                        fillFacts cols, 'psRatio'
                        continue
                    if /^\s*Marktkapitalisierung je Mitarbeiter/.test label
                        fillFacts cols, 'marketCapPerEmployee'
                        continue
                    if /^\s*Gewinnwachstum/.test label
                        fillFacts cols, 'profitGrowth'
                        continue
                    if /^\s*Umsatzwachstum/.test label
                        fillFacts cols, 'salesGrowth'
                        continue
                    if /^\s*Dividendenrendite/.test label
                        fillFacts cols, 'dividendYield'
                        continue
                    if /^\s*Brutto-Umsatzrendite/.test label
                        fillFacts cols, 'returnOnSales'
                        continue
                    if /^\s*Anzahl Mitarbeiter/.test label
                        fillFacts cols, 'employees'
                        continue
                    if /^\s*Umsatz je Mitarbeiter/.test label
                        fillFacts cols, 'salesPerEmployee'
                        continue
                    if /^\s*Cashflow-Marge/.test label
                        fillFacts cols, 'cashflowMargin'
                        continue
                    if /^\s*Verschuldungsgrad/.test label
                        fillFacts cols, 'debtEquityRatio'
                        continue
                    if /^\s*Dynamischer Verschuldungsgrad/.test label
                        fillFacts cols, 'dynamicDebtEquityRatio'
                        continue
                    if /^\s*CFROI/.test label
                        fillFacts cols, 'cfroi'
                        continue

                # compute additional facts
                for i, obj of factsPerYear
                    if obj.marketCapPerEmployee != null and obj.employees != null
                        obj.marketCap = obj.marketCapPerEmployee * obj.employees

                    if obj.salesPerEmployee != null and obj.employees != null
                        obj.sales = obj.salesPerEmployee * obj.employees

                facts = []
                for i, obj of factsPerYear
                    # remove unnecessary facts
                    delete obj.marketCapPerEmployee
                    delete obj.salesPerEmployee

                    facts.push obj
                facts.sort (a,b) -> b.year - a.year

                equity.latestFacts = facts.shift()
                equity.historicFacts = facts

                cb null, equity
            ]
        this

    _isValidEquityUrl: (url) -> /^http:\/\/www\.boersennews\.de\/markt\/aktien\/[^\/]+\/[^\/]+\/fundamental$/.test(url)

module.exports = BoersennewsEndpoint