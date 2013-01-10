(function() {
  var Crawler, Endpoint, FinanzennetEndpoint,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Endpoint = require('../endpoint.js');

  Crawler = require('crawler').Crawler;

  /*
  Fetch stock data from finanzen.net
  */


  FinanzennetEndpoint = (function(_super) {

    __extends(FinanzennetEndpoint, _super);

    function FinanzennetEndpoint() {
      this.getEquityUrls = __bind(this.getEquityUrls, this);
      this.baseUrl = 'http://www.finanzen.net';
      this.crawler = new Crawler({
        forceUTF8: true,
        maxConnections: 10,
        cache: true
      });
    }

    /*
        Retrieve a single index by some search.
        This method always returns only one result. The one that fits the search term best.
    */


    FinanzennetEndpoint.prototype.searchIndex = function(name, cb) {
      var that,
        _this = this;
      that = this;
      this.crawler.queue([
        {
          uri: 'http://www.finanzen.net/suchergebnis.asp?strSuchString=' + encodeURIComponent(name) + '&strKat=Indizes',
          callback: function(error, result, $) {
            var url;
            if (error) {
              cb(new Error('Could not load finanzen.net!'), null);
              return;
            }
            if (_this._isValidIndexUrl(result.request.href)) {
              return _this.crawlIndex(url, cb);
            } else {
              url = $('.main').first().find('table tr').eq(1).find('a').attr('href');
              if (!url) {
                return cb(null, null);
              } else {
                return _this.crawlIndex(_this.baseUrl + url, cb);
              }
            }
          }
        }
      ]);
      return this;
    };

    /*
        Retrieve a single equity by ISIN
    */


    FinanzennetEndpoint.prototype.getEquityByIsin = function(isin, stockMarket, cb) {
      this.searchEquity(isin, stockMarket, cb);
      return this;
    };

    /*
        Retrieve a single equity by some search.
        This method always returns only one result. The one that fits the search term best.
    */


    FinanzennetEndpoint.prototype.searchEquity = function(name, stockMarket, cb) {
      var url,
        _this = this;
      url = 'http://www.finanzen.net/suchergebnis.asp?strSuchString=' + encodeURIComponent(name) + '&strKat=Aktien';
      this.crawler.queue([
        {
          uri: url,
          callback: function(error, result, $) {
            if (error) {
              cb(new Error('Could not load finanzen.net!'), null);
              return;
            }
            if (_this._isValidEquityUrl(result.request.href)) {
              return _this.crawlEquity(url, stockMarket, cb);
            } else {
              url = $('.main').first().find('table tr').eq(1).find('a').attr('href');
              if (!url) {
                return cb(null, null);
              } else {
                return _this.crawlEquity(_this.baseUrl + url, stockMarket, cb);
              }
            }
          }
        }
      ]);
      return this;
    };

    /*
        Get all equity URLs of an index
    */


    FinanzennetEndpoint.prototype.getEquityUrls = function(indexUrl, cb) {
      var _this = this;
      return this.crawler.queue([
        {
          uri: indexUrl,
          callback: function(err, result, $) {
            var a, indexPageCallback, numPages, pageCounter, paginationLinks, urls, _i, _len, _results;
            if (err) {
              cb(new Error('Could not load finanzen.net!'), null);
              return;
            }
            paginationLinks = $('.paging a:not(:last-child)');
            numPages = paginationLinks.length + 1;
            pageCounter = 0;
            urls = [];
            indexPageCallback = function(err, result, $) {
              var i, row, _i, _len, _ref;
              if (err) {
                if (pageCounter < numPages) {
                  pageCounter = numPages + 1;
                  cb(new Error('Could not load finanzen.net!'), null);
                }
                return;
              }
              _ref = $('.main').last().find('table tr');
              for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                row = _ref[i];
                if (i > 0) {
                  urls.push(_this.baseUrl + $(row).find('td:first-child a').attr('href'));
                }
              }
              pageCounter++;
              if (pageCounter === numPages) {
                return cb(null, urls);
              }
            };
            indexPageCallback(err, result, $);
            _results = [];
            for (_i = 0, _len = paginationLinks.length; _i < _len; _i++) {
              a = paginationLinks[_i];
              _results.push(_this.crawler.queue([
                {
                  uri: _this.baseUrl + $(a).attr('href'),
                  callback: indexPageCallback
                }
              ]));
            }
            return _results;
          }
        }
      ]);
    };

    /*
        Crawl an equity by its URL on finanzen.net
    
        @param {String} url URL of an equity on finanzen.net
        @param {String} stockMarket Unique string of a stock market on finanzen.net (e.g. FSE for Frankfurt Stock Exchange)
        @param {Function} cb Callback is called with Error|null and Object, the crawled equity
    */


    FinanzennetEndpoint.prototype.crawlEquity = function(url, stockMarket, cb) {
      var _this = this;
      url = url.replace(/@stBoerse_.*/, '') + '@stBoerse_' + stockMarket;
      this.crawler.queue([
        {
          uri: url,
          callback: function(error, result, $) {
            var a, equity, finanzennetId, finanzennetIdRegexp, matches, now, _i, _len, _ref;
            if (error) {
              cb(new Error('Could not load finanzen.net!'), null);
              return;
            }
            if (!_this._isValidEquityUrl(result.request.href)) {
              cb(new Error('Not a valid equity URL!'), null);
              return;
            }
            equity = {
              name: $('.pricebox h2').first().text().replace(/Aktienkurs\s/, '').replace(/\sin.*/, '')
            };
            matches = /WKN:\s([^\s]+)\s\/\sISIN:\s([^\]]+)/.exec($('h1').text());
            equity.wkn = matches[1];
            equity.isin = matches[2];
            equity.currentPrice = parseFloat($('.pricebox .content table').eq(0).find('th:first-child').text().replace('.', '').replace(',', '.'));
            finanzennetId = null;
            finanzennetIdRegexp = /pkAktieNr=(\d+)/;
            _ref = $('.infobox a');
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              a = _ref[_i];
              matches = finanzennetIdRegexp.exec($(a).attr('href'));
              if (finanzennetId === null && matches) {
                finanzennetId = matches[1];
                break;
              }
            }
            if (finanzennetId === null) {
              cb(new Error('Problem while parsing equity page!'), null);
            }
            now = new Date;
            return _this.crawler.queue([
              {
                uri: url + '/Historisch',
                method: 'POST',
                form: {
                  dtTag1: 1,
                  dtMonat1: 1,
                  dtJahr1: now.getFullYear() - 2,
                  dtTag2: now.getDate(),
                  dtMonat2: now.getMonth(),
                  dtJahr2: now.getFullYear(),
                  strBoerse: stockMarket,
                  pkAktieNr: finanzennetId
                },
                callback: function(err, result, $) {
                  var dailyPrices, lastMonth, lastValue, month, monthlyPrices, row, rows, tds, value, _j, _k, _len1, _len2;
                  if (err) {
                    cb(new Error('Could not load finanzen.net!'), null);
                    return;
                  }
                  rows = $('.table_quotes tr:has(td)');
                  dailyPrices = [];
                  for (_j = 0, _len1 = rows.length; _j < _len1; _j++) {
                    row = rows[_j];
                    dailyPrices.push(parseFloat($(row).find('td').eq(1).text().replace('.', '').replace(',', '.')));
                    if (dailyPrices.length === 30) {
                      break;
                    }
                  }
                  equity.dailyPrices = dailyPrices;
                  monthlyPrices = [];
                  lastMonth = null;
                  lastValue = null;
                  for (_k = 0, _len2 = rows.length; _k < _len2; _k++) {
                    row = rows[_k];
                    tds = $(row).find('td');
                    month = parseInt(tds.eq(0).text().split('.')[1]);
                    value = parseFloat(tds.eq(1).text().replace('.', '').replace(',', '.'));
                    if (lastMonth !== null && lastMonth !== month) {
                      monthlyPrices.push(value);
                    }
                    lastMonth = month;
                    lastValue = value;
                    if (monthlyPrices.length === 12) {
                      break;
                    }
                  }
                  equity.monthlyPrices = monthlyPrices;
                  return cb(null, equity);
                }
              }
            ]);
          }
        }
      ]);
      return this;
    };

    /*
        Crawl an index by its URL on finanzen.net
    */


    FinanzennetEndpoint.prototype.crawlIndex = function(url, cb) {
      var _this = this;
      this.crawler.queue([
        {
          uri: url,
          callback: function(err, result, $) {
            var h2, index, matches, name, nameRegex, now, _i, _len, _ref;
            if (err) {
              cb(new Error('Could not load finanzen.net!'), null);
              return;
            }
            if (!_this._isValidIndexUrl(result.request.href)) {
              cb(new Error('Not a valid index URL!'), null);
            }
            name = null;
            nameRegex = /Marktberichte\szum\s(.+)/;
            _ref = $('.content_box h2');
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              h2 = _ref[_i];
              matches = nameRegex.exec($(h2).text());
              if (matches) {
                name = matches[1];
                break;
              }
            }
            index = {
              name: name,
              url: result.request.href
            };
            index.currentPrice = parseFloat($('.pricebox .content table').eq(0).find('th:first-child').text().replace('.', '').replace(',', '.'));
            now = new Date;
            return _this.crawler.queue([
              {
                uri: url + '/Historisch',
                method: 'POST',
                form: {
                  dtTag1: 1,
                  dtMonat1: 1,
                  dtJahr1: now.getFullYear() - 2,
                  dtTag2: now.getDate(),
                  dtMonat2: now.getMonth(),
                  dtJahr2: now.getFullYear()
                },
                callback: function(err, result, $) {
                  var dailyPrices, lastMonth, lastValue, month, monthlyPrices, row, rows, tds, value, _j, _k, _len1, _len2;
                  if (err) {
                    cb(new Error('Could not load finanzen.net!'), null);
                    return;
                  }
                  rows = $('.table_quotes tr:has(td)');
                  dailyPrices = [];
                  for (_j = 0, _len1 = rows.length; _j < _len1; _j++) {
                    row = rows[_j];
                    dailyPrices.push(parseFloat($(row).find('td').eq(1).text().replace('.', '').replace(',', '.')));
                    if (dailyPrices.length === 30) {
                      break;
                    }
                  }
                  index.dailyPrices = dailyPrices;
                  monthlyPrices = [];
                  lastMonth = null;
                  lastValue = null;
                  for (_k = 0, _len2 = rows.length; _k < _len2; _k++) {
                    row = rows[_k];
                    tds = $(row).find('td');
                    month = parseInt(tds.eq(0).text().split('.')[1]);
                    value = parseFloat(tds.eq(1).text().replace('.', '').replace(',', '.'));
                    if (lastMonth !== null && lastMonth !== month) {
                      monthlyPrices.push(value);
                    }
                    lastMonth = month;
                    lastValue = value;
                    if (monthlyPrices.length === 12) {
                      break;
                    }
                  }
                  index.monthlyPrices = monthlyPrices;
                  return cb(null, index);
                }
              }
            ]);
          }
        }
      ]);
      return this;
    };

    FinanzennetEndpoint.prototype._isValidEquityUrl = function(url) {
      return /http:\/\/www\.finanzen\.net\/aktien\/[^\/]+$/.test(url);
    };

    FinanzennetEndpoint.prototype._isValidIndexUrl = function(url) {
      return /http:\/\/www\.finanzen\.net\/index\/[^\/]+$/.test(url);
    };

    return FinanzennetEndpoint;

  })(Endpoint);

  module.exports = FinanzennetEndpoint;

}).call(this);
