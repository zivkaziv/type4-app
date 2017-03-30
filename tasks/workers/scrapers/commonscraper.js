
const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');
var random = require('mongoose-random');

const cheerioReq = require("cheerio-req");
var unileverScraperObject  = require('./unileverproductsscraper');
var whatsInProductScraperObject  = require('./whatsinproductsscraper');
var smartLabelScraperObject  = require('./smartlabelscraper');

exports.CommonScraper = class CommonScraper {
    constructor() {
    }

    scrapeProductsFromQueue(){
        var unileverScraper = new unileverScraperObject.UnileverScraper();
        var whatsInProductScraper = new whatsInProductScraperObject.whatsInProductScraper();
        var smartLabelScraper = new smartLabelScraperObject.SmartLabelScraper();

        return setInterval(function() {
            ScrapedProduct.count().exec(function(err, count) {
                // ScrapedProduct.findOne({$and:[{"scrape_result" : { $exists : false }}, { "ingredients":  {$size: 0}}]}, function(err, productToScrape) {
                let random = Math.floor(Math.random() * count);
                ScrapedProduct.findOne({"ingredients": {$size: 0}}).skip(random).exec(function (err, productToScrape) {
                    if (productToScrape) {
                        console.log('start scrape - ' + productToScrape.name + ' - strategy - ' + productToScrape.scraper_strategy);
                        switch (productToScrape.scraper_strategy) {
                            case unileverScraper.getScrapeStrategy():
                                unileverScraper.handleProduct(productToScrape);
                                break;
                            case whatsInProductScraper.getScrapeStrategy():
                                whatsInProductScraper.handleProduct(productToScrape);
                                break;
                            case smartLabelScraper.getScrapeStrategy():
                                smartLabelScraper.handleProduct(productToScrape);
                                break;
                            default:
                                console.log('Unknown strategy for ' + productToScrape.scraper_strategy);
                        }
                    } else {
                        console.log('no products');
                    }
                });
            });
        }, 10000);
    }

};