_Trader_ is a command line tool build with [node](http://nodejs.org) to crawl equity data and to rate equities with arbitrary rating systems.

## Installation

    $ npm install trader

## How to use the CLI tool

    $ trader -h

      Usage: trader [options]

      Options:

        -h, --help               output usage information
        -V, --version            output the version number
        -p, --progress           show a progress bar if possible (do not use progress if you want to pipe the output)
        -i, --input <importer>   importer to use to fetch equities [dax]
        -o, --output <format>    choose output format [table]
        -r, --rating <type>      choose rating system [none]

### Importers

There are the following importers shipped with trader:

- __dax__: Import the 30 DAX equities from Frankfurt Stock Exchange
- __downjones__: Import Dow Jones from Frankfurt Stock Exchange
- __index__(indexName, stockMarket=FSE): Import all equities of an index
- __jsonfile__(filename): Import equities from a JSON file with the same format of the JSON output formatter

### Output Formatters

There are the following output formatters shipped with trader:

- __table__: Prints a text table (does not contain the full equity data though)
- __json__: Output JSON

### Rating Systems

There are the following rating systems shipped with trader:

- __orderby__(factName, descending=true): Order equities by a fact in the latestFact object.
- __levermann__(indexName): Rating system according to Susanne Levermann's book "Der entspannte Weg zum Reichtum"

## Data Format

An equity object should contain the following attributes:

    {
        isin: The ISIN unique equity id
        wkn: The WKN unique equity id
        name: The name of the equity
        currency: e.g. EUR or USD
        latestPrice: The current price (as realtime as possible)
        monthlyPrices: [...] Array of monthly prices of the first day in each month of the last 12 months starting with the price at the beginning of the current month.
        dailyPrices: [...] Array of daily prices at the beginning of each day in the last 30 trading(!) days starting with the price of the last ended trading day.
        latestFacts: {
            year: The year of the facts
            pbRatio: P/B ratio (german: KBV)
            peRatio: P/E ratio (german: KGV)
            dividendPerShare: (german: Dividende pro Aktie)
            returnOfEquity: (german: Eigenkapitalrendite)
            ebitMargin: (german: EBIT Marge)
            ebitdaMargin: (german: EBITDA Marge)
            equityRatio: (german: Eigenkapitalquote)
            marketCap: (german: Marktkapitalisierung)
            earningsPerShare: (german: Ergebnis je Aktie)
            dynamicPeRatio: (german: Dynamisches KGV)
            cashflowPerShare: (german: Cashflow je Aktie)
            pcfRatio: price / cashflow ratio (german: KCV)
            psRatio: price sales ratio (german: KUV)
            profitGrowth: (german: Gewinnwachstum)
            salesGrowth: (german: Umsatzwachstum)
            dividendYield: (german: Dividendenrendite)
            returnOnSales: (german: Brutto-Umsatzrendite)
            employees: number of employees
            sales: (german: Umsatz)
            cashfowMargin: (german: Cashflow-Marge)
            debtEquityRatio: (german: Verschuldungsgrad)
            dynamicDebtEquityRatio: (german: Dynamischer Verschuldungsgrad)
            cfroi: Cashflow Return-on-Investment
        }
        historicFacts: [{},...] Array containing the same objects as latestFacts but with facts of the last years, latestFacts is not included in this list
    }

If some values cannot be retrieved they will be null.

## Running Tests

    $ grunt simplemocha

## License

(The MIT License)

Copyright (c) 2013 Mario Volke &lt;info@mariovolke.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.