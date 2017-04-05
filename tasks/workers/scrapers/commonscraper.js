
const request = require('request');

var ScrapedProduct = require('../../../models/Scrapedprodcut');
var random = require('mongoose-random');

const cheerioReq = require("cheerio-req");
var unileverScraperObject  = require('./unileverproductsscraper');
var whatsInProductScraperObject  = require('./whatsinproductsscraper');
var smartLabelScraperObject  = require('./smartlabelscraper');
var houseHoldDBScraperObject  = require('./householddbscraper');
var skinDeepScraperObject  = require('./skindeepscraper');
var lorealUsaScraperObject  = require('./lorealusascraper');
var pngMainScraperObject  = require('./PnG/pngmainscraper');

exports.CommonScraper = class CommonScraper {
    constructor() {
    }

    scrapeProductsFromQueue(){
        var unileverScraper = new unileverScraperObject.UnileverScraper();
        var whatsInProductScraper = new whatsInProductScraperObject.whatsInProductScraper();
        var smartLabelScraper = new smartLabelScraperObject.SmartLabelScraper();
        var houseHoldDBScraper = new houseHoldDBScraperObject.HouseHoldDBScraper();
        var skinDeepScraper = new skinDeepScraperObject.SkinDeepScraper();
        var lorealUsaScraper = new lorealUsaScraperObject.LorealParisUsaScraper();
        var pngMainScraper = new pngMainScraperObject.PnGMainScraper();

        return setInterval(function() {
            ScrapedProduct.count({"ingredients": {$size: 0}}).exec(function(err, count) {
                // ScrapedProduct.findOne({$and:[{"scrape_result" : { $exists : false }}, { "ingredients":  {$size: 0}}]}, function(err, productToScrape) {
                let random = Math.floor(Math.random() * count);
                // ScrapedProduct.findOne({'product_url' : {$regex : ".*657622412782*"}}).skip(0).exec(function (err, productToScrape) {
                    ScrapedProduct.findOne({"ingredients": {$size: 0}}).skip(random).exec(function (err, productToScrape) {
                        try {
                            if (productToScrape) {
                                console.log('start scrape - ' + productToScrape.name + ' - strategy - ' + productToScrape.scraper_strategy);
                                if(productToScrape.scraper_strategy === unileverScraper.getScrapeStrategy()) {
                                    unileverScraper.handleProduct(productToScrape);
                                }else if (productToScrape.scraper_strategy ===whatsInProductScraper.getScrapeStrategy()) {
                                    whatsInProductScraper.handleProduct(productToScrape);
                                }else if (productToScrape.scraper_strategy === smartLabelScraper.getScrapeStrategy()) {
                                    smartLabelScraper.handleProduct(productToScrape);
                                }else if (productToScrape.scraper_strategy === houseHoldDBScraper.getScrapeStrategy()) {
                                    houseHoldDBScraper.handleProduct(productToScrape);
                                }else if (productToScrape.scraper_strategy === skinDeepScraper.getScrapeStrategy()) {
                                    skinDeepScraper.handleProduct(productToScrape);
                                }else if (productToScrape.scraper_strategy === lorealUsaScraper.getScrapeStrategy()) {
                                    lorealUsaScraper.handleProduct(productToScrape);
                                }

                                //Those brands are house of brands, therefore we have one scarper and there
                                //we have the logic relate to the relevant brand
                                else if (pngMainScraper.isPnGStrategy(productToScrape.scraper_strategy)) {
                                    pngMainScraper.handleProduct(productToScrape);
                                }else{
                                    console.log('Unknown strategy for ' + productToScrape.scraper_strategy);
                                }
                            } else {
                                console.log('no products');
                            }
                        }catch (err){
                            console.log('Error ' + err);
                        }
                });
            });
        }, 10000);
    }

};