(function() {
  var Crawler, Endpoint, FinanzennetEndpoint,
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
      this.baseUrl = 'http://www.finanzen.net';
      this.crawler = new Crawler({
        forceUTF8: true,
        maxConnections: 10,
        cache: true
      });
    }

    FinanzennetEndpoint.prototype.getIndices = function(cb) {
      var that,
        _this = this;
      that = this;
      this.crawler.queue([
        {
          uri: 'http://www.finanzen.net/indizes/Alle',
          callback: function(error, result, $) {
            var indices;
            if (error) {
              cb(new Error('Could not load finanzen.net!'), null);
              return;
            }
            indices = [];
            $("#idSortTable tr").each(function() {
              var a, cols, country, id, lastValue, parts, td;
              cols = $('td', this);
              if (cols.length > 0) {
                a = $('a', cols[0]);
                td = $(cols[0]).clone();
                td.children('a').remove();
                td.children('br').remove();
                country = td.text();
                lastValue = parseFloat($(cols[1]).text().replace(/<br>.*/, '').replace(/\./g, '').replace(/,/g, '.'));
                parts = a.attr('href').split('/');
                id = parts[parts.length - 1].toLowerCase();
                return indices.push({
                  id: id,
                  name: a.text(),
                  url: that.baseUrl + a.attr('href'),
                  country: td.text(),
                  lastValue: lastValue
                });
              }
            });
            return cb(null, indices);
          }
        }
      ]);
      return this;
    };

    /*
        Retrieve a single equity by ISIN
    */


    FinanzennetEndpoint.prototype.getEquityByIsin = function(isin, cb) {
      this.searchEquity(isin, cb);
      return this;
    };

    /*
        Retrieve a single equity by some search.
        This method always returns only one result. The one that fits the search term best.
    */


    FinanzennetEndpoint.prototype.searchEquity = function(name, cb) {
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
              return _this._crawlEquity(url, cb);
            } else {
              url = _this.baseUrl + $('.main').first().find('table tr').eq(1).find('a').attr('href');
              if (!url) {
                return cb(null, null);
              } else {
                return _this._crawlEquity(url, cb);
              }
            }
          }
        }
      ]);
      return this;
    };

    /*
        Retrieve all equities of an Index
    
        indexId has to exist in the result set of getIndices() of the same endpoint!
    */


    FinanzennetEndpoint.prototype.getEquitiesByIndex = function(indexId, cb, tick) {
      var getEquityUrls,
        _this = this;
      getEquityUrls = function(indexUrl, cb) {
        return _this.crawler.queue([
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
      this.getIndices(function(err, indices) {
        var i, index, _i, _len;
        if (err) {
          cb(err);
          return;
        }
        indexId = indexId.toLowerCase();
        index = null;
        for (_i = 0, _len = indices.length; _i < _len; _i++) {
          i = indices[_i];
          if (i.id === indexId) {
            index = i;
            break;
          }
        }
        if (!index) {
          cb(new Error('Given index not available!'));
          return;
        }
        return getEquityUrls(index.url + '/Werte', function(err, urls) {
          var callbackCounter, equities, url, _j, _len1, _results;
          if (err) {
            cb(err, null);
            return;
          }
          if (tick) {
            tick(0, urls.length);
          }
          equities = [];
          callbackCounter = 0;
          _results = [];
          for (_j = 0, _len1 = urls.length; _j < _len1; _j++) {
            url = urls[_j];
            _results.push(_this._crawlEquity(url, function(err, equity) {
              if (err) {
                if (callbackCounter < urls.length) {
                  callbackCounter = urls.length + 1;
                  cb(err, null);
                }
                return;
              }
              equities.push(equity);
              callbackCounter++;
              if (tick) {
                tick(callbackCounter, url.length);
              }
              if (callbackCounter === urls.length) {
                return cb(null, equities);
              }
            }));
          }
          return _results;
        });
      });
      return this;
    };

    FinanzennetEndpoint.prototype._crawlEquity = function(url, cb) {
      var _this = this;
      this.crawler.queue([
        {
          uri: url,
          callback: function(error, result, $) {
            var equity, matches;
            if (error) {
              cb(new Error('Could not load finanzen.net!'), null);
              return;
            }
            if (!_this._isValidEquityUrl(result.request.href)) {
              cb(new Error('Not a valid equity URL!'), null);
            }
            equity = {
              name: $('.pricebox h2').first().text().replace(/Aktienkurs\s/, '').replace(/\sin.*/, '')
            };
            matches = /WKN:\s([^\s]+)\s\/\sISIN:\s([^\]]+)/.exec($('h1').text());
            equity.wkn = matches[1];
            equity.isin = matches[2];
            return cb(null, equity);
          }
        }
      ]);
      return this;
    };

    FinanzennetEndpoint.prototype._isValidEquityUrl = function(url) {
      return /http:\/\/www\.finanzen\.net\/aktien\/[^\/]+/.test(url);
    };

    return FinanzennetEndpoint;

  })(Endpoint);

  module.exports = FinanzennetEndpoint;

}).call(this);
