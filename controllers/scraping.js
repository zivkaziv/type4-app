/**
 * POST /component
 */

var scraperWhatsInProductsObject = require('../tasks/workers/scrapers/whatsinproductsscraper');
var scraperUnileverObject = require('../tasks/workers/scrapers/unileverproductsscraper');
var smartLabelObject = require('../tasks/workers/scrapers/smartlabelscraper');
var houseHoldDBObject = require('../tasks/workers/scrapers/householddbscraper');
var commonScraper = require('../tasks/workers/scrapers/commonscraper');

var scrapeInterval;

exports.whatsInProductScrapePost = function(req, res) {
    var scraper = new scraperWhatsInProductsObject.whatsInProductScraper();
    scraper.addProductsToQueue(req.param('letter'));
    res.status(200).send({ msg: 'started' });
};

exports.unileverScrapePost = function(req, res) {
    var scraper = new scraperUnileverObject.UnileverScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

exports.smartLabelScrapePost = function(req, res) {
    var scraper = new smartLabelObject.SmartLabelScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

exports.houseHoldDBScrapePost = function(req, res) {
    var scraper = new houseHoldDBObject.HouseHoldDBScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};



//Common
exports.ScrapeProductsStartPost = function(req, res) {
    if(!scrapeInterval){
        var scraper = new commonScraper.CommonScraper();
        scrapeInterval = scraper.scrapeProductsFromQueue();
        res.status(200).send({ msg: 'started' });
    }else{
        res.status(200).send({ msg: 'running' });
    }
};

exports.ScrapeProductsStopPost = function(req, res) {
    if(scrapeInterval){
        clearInterval(scrapeInterval);
        res.status(200).send({ msg: 'stopped' });
    }else{
        res.status(200).send({ msg: 'already stop' });
    }
};