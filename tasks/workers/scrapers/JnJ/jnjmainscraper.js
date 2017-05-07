
const supportedStrategies = ['cleanandclear.com'];
var cleanAndClearObject  = require('./cleannclearscraper');
var johnsonBabyObject  = require('./johnsonbabyscraper');

exports.JnJMainScraper = class JnJMainScraper {
    constructor() {
        this.cleanAndClearScraper =  new cleanAndClearObject.CleanAndClearScraper();
        this.johnsonBabyScraper =  new johnsonBabyObject.JohnsonBabyScraper();
    }

    addProductsToQueue() {
        this.cleanAndClearScraper.addProductsToQueue();
    }

    isJnJStrategy(strategy){
        return supportedStrategies.indexOf(strategy) > -1 ? true:false;
    }

    handleProduct(productToScrape){
        if(productToScrape && productToScrape.scraper_strategy){
            switch (productToScrape.scraper_strategy) {
                case this.cleanAndClearScraper.getScrapeStrategy():
                    this.cleanAndClearScraper.handleProduct(productToScrape);
                    break;
                case this.johnsonBabyScraper.getScrapeStrategy():
                    this.johnsonBabyScraper.handleProduct(productToScrape);
                    break;
                default:
                    console.log('Unknown strategy for ' + productToScrape.scraper_strategy);
            }
        }

    }
};