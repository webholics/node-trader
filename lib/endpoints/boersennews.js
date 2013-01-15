(function() {
  var BoersennewsEndpoint, Crawler, Endpoint,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Endpoint = require('../endpoint.js');

  Crawler = require('crawler').Crawler;

  /*
  Fetch stock data from boersennews.de
  */


  BoersennewsEndpoint = (function(_super) {

    __extends(BoersennewsEndpoint, _super);

    function BoersennewsEndpoint() {
      this.baseUrl = 'http://www.boersennews.de';
      this.crawler = new Crawler({
        forceUTF8: true,
        maxConnections: 10,
        cache: true
      });
    }

    /*
        Retrieve a single equity by ISIN
    */


    BoersennewsEndpoint.prototype.getEquityByIsin = function(isin, cb) {
      var url,
        _this = this;
      isin = isin.toLowerCase();
      url = 'http://www.boersennews.de/markt/search/simple/key/' + encodeURIComponent(isin) + '/category/sto';
      this.crawler.queue([
        {
          uri: url,
          callback: function(error, result, $) {
            var row, tds, _i, _len, _ref;
            if (error) {
              cb(new Error('Could not load boersennews.de!'), null);
              return;
            }
            url = null;
            _ref = $('table.tabList.lastLine tr:has(td)');
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              row = _ref[_i];
              tds = $(row).find('td');
              if ($(tds[2]).text().toLowerCase() === isin) {
                url = _this.baseUrl + $(tds[0]).find('a').attr('href').replace("/profile", "/fundamental");
                break;
              }
            }
            if (!url) {
              cb(null, null);
              return;
            }
            return _this.crawlEquity(url, cb);
          }
        }
      ]);
      return this;
    };

    /*
        Crawl an equity by its URL on boersennews.de
        This methods crawls only stock facts page.
    
        @param {String} url URL of an equity "Fundamentale Daten" page on boersennews.de
        @param {Function} cb Callback is called with Error|null and Object, the crawled equity
    */


    BoersennewsEndpoint.prototype.crawlEquity = function(url, cb) {
      var _this = this;
      this.crawler.queue([
        {
          uri: url,
          callback: function(error, result, $) {
            var col, cols, colsMap, equity, facts, factsPerYear, fillFacts, i, matches, obj, row, year, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1;
            if (error) {
              cb(new Error('Could not load boersennews.de!'), null);
              return;
            }
            if (!_this._isValidEquityUrl(result.request.href)) {
              cb(new Error('Not a valid equity URL!'), null);
              return;
            }
            equity = {
              name: $('h2').text().replace(' Fundamentale Daten', '')
            };
            matches = /ISIN:\s([^\s]+)\s\|\sWKN:\s([^\s]+)/.exec($('.instrumentInfos h3').text());
            equity.isin = matches[1];
            equity.wkn = matches[2];
            colsMap = {};
            _ref = $('.tabList tr').eq(0).find('th');
            for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
              col = _ref[i];
              if (/^\d+$/.test($(col).text())) {
                colsMap[parseInt($(col).text())] = i;
              }
            }
            factsPerYear = {};
            for (i = _j = 0, _len1 = colsMap.length; _j < _len1; i = ++_j) {
              year = colsMap[i];
              factsPerYear[year] = {
                year: year,
                pbRatio: null,
                peRatio: null
              };
            }
            fillFacts = function(cols, key) {
              var colIndex, num, _k, _len2, _results;
              _results = [];
              for (colIndex = _k = 0, _len2 = colsMap.length; _k < _len2; colIndex = ++_k) {
                year = colsMap[colIndex];
                matches = /([0-9,\.-]+)/.exec(cols.eq(colIndex).text());
                if (matches && matches[1] !== '-') {
                  num = parseFloat(matches[1].replace('.', '').replace(',', '.'));
                  _results.push(factsPerYear[year][key] = num);
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
            };
            _ref1 = $('.tabList tr:has(td)');
            for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
              row = _ref1[_k];
              cols = $(row).find('td');
              if (/^KGV/.test(cols.eq(0).text())) {
                fillFacts(cols, 'peRatio');
                continue;
              }
            }
            facts = [];
            for (_l = 0, _len3 = factsPerYear.length; _l < _len3; _l++) {
              obj = factsPerYear[_l];
              facts.push(obj);
            }
            facts.sort(function(a, b) {
              return b.year - a.year;
            });
            equity.latestFacts = facts.shift();
            equity.historicFacts = facts;
            return cb(null, equity);
          }
        }
      ]);
      return this;
    };

    BoersennewsEndpoint.prototype._isValidEquityUrl = function(url) {
      return /^http:\/\/www\.boersennews\.de\/markt\/aktien\/[^\/]+\/[^\/]+\/fundamental$/.test(url);
    };

    return BoersennewsEndpoint;

  })(Endpoint);

  module.exports = BoersennewsEndpoint;

}).call(this);
