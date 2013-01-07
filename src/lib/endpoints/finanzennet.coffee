Endpoint = require '../endpoint.js'
Crawler = require('crawler').Crawler

###
Fetch stock data from finanzen.net
###
class FinanzennetEndpoint extends Endpoint
    constructor: ->
        @baseUrl = 'http://www.finanzen.net'
        @crawler = new Crawler
            forceUTF8: true
            #debug: true
            maxConnections: 10
            # Means if we request the same URI twice it is not crawled again.
            # But callback will be called!
            # This means you have to create a new endpoint if you want to flush the cash!
            cache: true

    # Retrieve a list of available stock indices.
    getIndices: (cb) ->
        that = this

        # fetch indicies
        @crawler.queue [
            uri: 'http://www.finanzen.net/indizes/Alle'
            callback: (error, result, $) =>
                if error
                    cb(new Error('Could not load finanzen.net!'), null)
                    return

                indices = []
                $("#idSortTable tr").each ->
                    cols = $('td', this)
                    if cols.length > 0
                        a = $('a', cols[0])
                        td = $(cols[0]).clone()
                        td.children('a').remove()
                        td.children('br').remove()
                        country = td.text()

                        lastValue = parseFloat(
                            $(cols[1]).text()
                                .replace(/<br>.*/, '').replace(/\./g, '').replace(/,/g, '.')
                        )

                        parts = a.attr('href').split('/')
                        id = parts[parts.length - 1].toLowerCase()

                        indices.push
                            id: id
                            name: a.text()
                            url: that.baseUrl + a.attr('href')
                            country: td.text(),
                            lastValue: lastValue

                cb(null, indices)
            ]
        this

    ###
    Retrieve a single equity by ISIN
    ###
    getEquityByIsin: (isin, cb) ->
        # we just use search here
        this.searchEquity(isin, cb)
        this

    ###
    Retrieve a single equity by some search.
    This method always returns only one result. The one that fits the search term best.
    ###
    searchEquity: (name, cb) ->
        # search supports GET requests
        url = 'http://www.finanzen.net/suchergebnis.asp?strSuchString=' + encodeURIComponent(name) + '&strKat=Aktien'
        @crawler.queue [
            uri: url
            callback: (error, result, $) =>
                if error
                    cb(new Error('Could not load finanzen.net!'), null)
                    return

                # if search has a unique result finanzen.net redirects directly to the equity page
                if this._isValidEquityUrl(result.request.href)
                    this._crawlEquity(url, cb)
                else
                    url = @baseUrl + $('.main').first().find('table tr').eq(1).find('a').attr('href')
                    if not url
                        cb(null, null)
                    else
                        this._crawlEquity(url, cb)
            ]
        this

    ###
    Retrieve all equities of an Index

    indexId has to exist in the result set of getIndices() of the same endpoint!
    ###
    getEquitiesByIndex: (indexId, cb, tick) ->
        # helper method to fetch all equity urls of an index
        getEquityUrls = (indexUrl, cb) =>
            # fetch first index page to crawl pagination
            @crawler.queue [
                uri: indexUrl
                callback: (err, result, $) =>
                    if err
                        cb(new Error('Could not load finanzen.net!'), null)
                        return

                    paginationLinks = $('.paging a:not(:last-child)')
                    numPages = paginationLinks.length + 1
                    pageCounter = 0
                    urls = []

                    indexPageCallback = (err, result, $) =>
                        if err
                            if pageCounter < numPages
                                pageCounter = numPages + 1 # prevent calling cb a second time
                                cb(new Error('Could not load finanzen.net!'), null)
                            return

                        for row, i in $('.main').last().find('table tr')
                            # ignore head row of table
                            if i > 0
                                urls.push @baseUrl + $(row).find('td:first-child a').attr('href')

                        pageCounter++
                        if pageCounter == numPages
                            cb(null, urls)

                    # fetch all index pages
                    indexPageCallback(err, result, $) # first page
                    for a in paginationLinks
                        @crawler.queue [
                            uri: @baseUrl + $(a).attr('href')
                            callback: indexPageCallback
                        ]
            ]

        # here it begins
        this.getIndices (err, indices) =>
            if err
                cb(err)
                return

            # find indexId in list
            indexId = indexId.toLowerCase()
            index = null
            for i in indices
                if i.id == indexId
                    index = i
                    break

            if not index
                cb(new Error('Given index not available!'))
                return

            getEquityUrls index.url + '/Werte', (err, urls) =>
                if err
                    cb(err, null)
                    return

                if tick
                    tick(0, urls.length)

                equities = []
                callbackCounter = 0
                for url in urls
                    this._crawlEquity url, (err, equity) =>
                        if err
                            if callbackCounter < urls.length
                                callbackCounter = urls.length + 1 # prevent calling cb a second time
                                cb(err, null)
                            return

                        equities.push equity
                        callbackCounter++

                        if tick
                            tick(callbackCounter, url.length)

                        if callbackCounter == urls.length
                            cb(null, equities)

        this

    _crawlEquity: (url, cb) ->
        # fetch indicies
        @crawler.queue [
            uri: url
            callback: (error, result, $) =>
                if error
                    cb(new Error('Could not load finanzen.net!'), null)
                    return

                if not this._isValidEquityUrl(result.request.href)
                    cb(new Error('Not a valid equity URL!'), null)

                equity =
                    name: $('.pricebox h2').first().text().replace(/Aktienkurs\s/, '').replace(/\sin.*/, '')

                # WKN and ISIN
                matches = /WKN:\s([^\s]+)\s\/\sISIN:\s([^\]]+)/.exec($('h1').text())
                equity.wkn = matches[1]
                equity.isin = matches[2]

                cb(null, equity)
            ]
        this

    _isValidEquityUrl: (url) -> /http:\/\/www\.finanzen\.net\/aktien\/[^\/]+/.test(url)

module.exports = FinanzennetEndpoint