Endpoint = require '../endpoint.js'
Crawler = require('crawler').Crawler

###
Fetch stock data from finanzen.net
###
class FinanzennetEndpoint extends Endpoint
    constructor: ->
        this.baseUrl = 'http://www.finanzen.net'
        this.crawler = new Crawler
            forceUTF8: true
            #debug: true
            maxConnections: 10
            # Means if we request the same URI twice it is not crawled again.
            # But callback will be called!
            # This means you have to create a new endpoint if you want to flush the cash!
            cache: true

    ###
    Retrieve a single index by some search.
    This method always returns only one result. The one that fits the search term best.
    ###
    searchIndex: (name, cb) ->
        that = this

        # fetch indicies
        this.crawler.queue [
            uri: 'http://www.finanzen.net/suchergebnis.asp?strSuchString=' + encodeURIComponent(name) + '&strKat=Indizes'
            callback: (error, result, $) =>
                if error
                    cb(new Error('Could not load finanzen.net!'), null)
                    return

                # if search has a unique result finanzen.net redirects directly to the equity page
                if this._isValidIndexUrl(result.request.href)
                    this.crawlIndex(url, cb)
                else
                    url = $('.main').first().find('table tr').eq(1).find('a').attr('href')
                    if not url
                        cb(null, null)
                    else
                        this.crawlIndex(this.baseUrl + url, cb)
            ]
        this

    ###
    Retrieve a single equity by ISIN
    ###
    getEquityByIsin: (isin, stockMarket, cb) ->
        # we just use search here
        this.searchEquity(isin, stockMarket, cb)
        this

    ###
    Retrieve a single equity by some search.
    This method always returns only one result. The one that fits the search term best.
    ###
    searchEquity: (name, stockMarket, cb) ->
        # search supports GET requests
        url = 'http://www.finanzen.net/suchergebnis.asp?strSuchString=' + encodeURIComponent(name) + '&strKat=Aktien'
        this.crawler.queue [
            uri: url
            callback: (error, result, $) =>
                if error
                    cb new Error('Could not load finanzen.net!'), null
                    return

                # if search has a unique result finanzen.net redirects directly to the equity page
                if this._isValidEquityUrl result.request.href
                    this.crawlEquity url, stockMarket, cb
                else
                    url = $('.main').first().find('table tr').eq(1).find('a').attr('href')
                    if not url
                        cb null, null
                    else
                        this.crawlEquity this.baseUrl + url, stockMarket, cb
            ]
        this

    ###
    Get all equity URLs of an index
    ###
    getEquityUrlsByIndex: (indexName, cb) ->

        this.searchIndex indexName, (err, index) =>
            if err
                cb err, null
                return

            if index == null
                cb new Error('Index not found!'), null
                return

            # fetch first index page to crawl pagination
            this.crawler.queue [
                uri: index.url + '/Werte'
                callback: (err, result, $) =>
                    if err
                        cb new Error('Could not load finanzen.net!'), null
                        return

                    paginationLinks = $('.paging a:not(:last-child)')
                    numPages = paginationLinks.length + 1
                    pageCounter = 0
                    urls = []

                    indexPageCallback = (err, result, $) =>
                        if err
                            if pageCounter < numPages
                                pageCounter = numPages + 1 # prevent calling cb a second time
                                cb new Error('Could not load finanzen.net!'), null
                            return

                        for row, i in $('.main').last().find('table tr')
                            # ignore head row of table
                            if i > 0
                                urls.push this.baseUrl + $(row).find('td:first-child a').attr('href')

                        pageCounter++
                        if pageCounter == numPages
                            cb null, urls

                    # fetch all index pages
                    indexPageCallback(err, result, $) # first page
                    for a in paginationLinks
                        this.crawler.queue [
                            uri: this.baseUrl + $(a).attr('href')
                            callback: indexPageCallback
                        ]
            ]
        this

    ###
    Crawl an equity by its URL on finanzen.net

    @param {String} url URL of an equity on finanzen.net
    @param {String} stockMarket Unique string of a stock market on finanzen.net (e.g. FSE for Frankfurt Stock Exchange)
    @param {Function} cb Callback is called with Error|null and Object, the crawled equity
    ###
    crawlEquity: (url, stockMarket, cb) ->

        # use correct stock market
        url = url.replace(/@stBoerse_.*/, '') + '@stBoerse_' + stockMarket

        this.crawler.queue [
            uri: url
            callback: (error, result, $) =>
                if error
                    cb new Error('Could not load finanzen.net!'), null
                    return

                if not this._isValidEquityUrl(result.request.href)
                    cb new Error('Not a valid equity URL!'), null
                    return

                equity =
                    name: $('.pricebox h2').first().text().replace(/Aktienkurs\s/, '').replace(/\sin.*/, '')

                # WKN and ISIN
                matches = /WKN:\s([^\s]+)\s\/\sISIN:\s([^\]]+)/.exec($('h1').text())
                equity.wkn = matches[1]
                equity.isin = matches[2]

                # current price
                equity.currentPrice = parseFloat($('.pricebox .content table').eq(0).find('th:first-child').text().replace('.', '').replace(',','.'))

                # find finanzen.net equity ID
                finanzennetId = null
                finanzennetIdRegexp = /pkAktieNr=(\d+)/
                for a in $('.infobox a')
                    matches = finanzennetIdRegexp.exec($(a).attr('href'))
                    if finanzennetId == null and matches
                        finanzennetId = matches[1]
                        break

                if finanzennetId == null
                    cb new Error('Problem while parsing equity page!'), null

                now = new Date
                this.crawler.queue [
                    uri: 'http://www.finanzen.net/kurse/kurse_historisch.asp'
                    method: 'POST',
                    form:
                        dtTag1: 1
                        dtMonat1: 1
                        dtJahr1: now.getFullYear() - 2
                        dtTag2: now.getDate()
                        dtMonat2: now.getMonth()
                        dtJahr2: now.getFullYear()
                        strBoerse: stockMarket
                        pkAktieNr: finanzennetId
                    callback: (err, result, $) =>
                        if err
                            cb new Error('Could not load finanzen.net!'), null
                            return

                        rows = $('.table_quotes tr:has(td)');

                        # daily prices
                        dailyPrices = []
                        for row in rows
                            dailyPrices.push parseFloat($(row).find('td').eq(1).text().replace('.', '').replace(',','.'))
                            if dailyPrices.length == 30
                                break
                        equity.dailyPrices = dailyPrices

                        # monthly prices
                        monthlyPrices = []
                        lastMonth = null
                        lastValue = null
                        for row in rows
                            tds = $(row).find('td')
                            month = parseInt(tds.eq(0).text().split('.')[1])
                            value = parseFloat(tds.eq(1).text().replace('.', '').replace(',','.'))
                            if lastMonth != null and lastMonth != month
                                monthlyPrices.push value
                            lastMonth = month
                            lastValue = value
                            if monthlyPrices.length == 12
                                break
                        equity.monthlyPrices = monthlyPrices

                        cb null, equity
                ]
            ]
        this

    ###
    Crawl an index by its URL on finanzen.net
    ###
    crawlIndex: (url, cb) ->
        this.crawler.queue [
            uri: url
            callback: (err, result, $) =>
                if err
                    cb new Error('Could not load finanzen.net!'), null
                    return

                if not this._isValidIndexUrl(result.request.href)
                    cb new Error('Not a valid index URL!'), null
                    return

                # name
                name = null
                nameRegex = /Marktberichte\szum\s(.+)/
                for h2 in $('.content_box h2')
                    matches = nameRegex.exec($(h2).text())
                    if matches
                        name = matches[1]
                        break

                index =
                    name: name
                    url: result.request.href

                # current price
                index.currentPrice = parseFloat($('.pricebox .content table').eq(0).find('th:first-child').text().replace('.', '').replace(',','.'))

                now = new Date
                this.crawler.queue [
                    uri: url + '/Historisch'
                    method: 'POST',
                    form:
                        dtTag1: 1
                        dtMonat1: 1
                        dtJahr1: now.getFullYear() - 2
                        dtTag2: now.getDate()
                        dtMonat2: now.getMonth()
                        dtJahr2: now.getFullYear()
                    callback: (err, result, $) =>
                        if err
                            cb(new Error('Could not load finanzen.net!'), null)
                            return

                        rows = $('.table_quotes tr:has(td)');

                        # daily prices
                        dailyPrices = []
                        for row in rows
                            dailyPrices.push parseFloat($(row).find('td').eq(1).text().replace('.', '').replace(',','.'))
                            if dailyPrices.length == 30
                                break
                        index.dailyPrices = dailyPrices

                        # monthly prices
                        monthlyPrices = []
                        lastMonth = null
                        lastValue = null
                        for row in rows
                            tds = $(row).find('td')
                            month = parseInt(tds.eq(0).text().split('.')[1])
                            value = parseFloat(tds.eq(1).text().replace('.', '').replace(',','.'))
                            if lastMonth != null and lastMonth != month
                                monthlyPrices.push value
                            lastMonth = month
                            lastValue = value
                            if monthlyPrices.length == 12
                                break
                        index.monthlyPrices = monthlyPrices

                        cb null, index
                ]
            ]
        this

    _isValidEquityUrl: (url) -> /http:\/\/www\.finanzen\.net\/aktien\/[^\/]+$/.test(url)
    _isValidIndexUrl: (url) -> /http:\/\/www\.finanzen\.net\/index\/[^\/]+$/.test(url)

module.exports = FinanzennetEndpoint