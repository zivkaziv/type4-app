/**
 * POST /component
 */

var scraperWhatsInProductsObject = require('../tasks/workers/scrapers/whatsinproductsscraper');
var scrapeWhatsInProductInterval;
exports.whatsInProductScrapePost = function(req, res) {
    var scraper = new scraperWhatsInProductsObject.whatsInProductScraper();
    scraper.addProductsToQueue(req.param('letter'));
    res.status(200).send({ msg: 'started' });
};

exports.whatsInProductScrapePostStart = function(req, res) {
    if(!scrapeWhatsInProductInterval){
        var scraper = new scraperWhatsInProductsObject.whatsInProductScraper();
        scrapeWhatsInProductInterval = scraper.scrapeProductsFromQueue();
        res.status(200).send({ msg: 'started' });
    }else{
        res.status(200).send({ msg: 'running' });
    }
};

exports.whatsInProductScrapePostStop = function(req, res) {
    if(scrapeWhatsInProductInterval){
        clearInterval(scrapeWhatsInProductInterval);
        res.status(200).send({ msg: 'stopped' });
    }else{
        res.status(200).send({ msg: 'already stop' });
    }
};

var scraperUnileverObject = require('../tasks/workers/scrapers/uniliverproductsscraper');
var scrapeUnileverInterval;
exports.unileverScrapePost = function(req, res) {
    var scraper = new scraperUnileverObject.UniliverScraper();
    scraper.addProductsToQueue();
    res.status(200).send({ msg: 'started' });
};

exports.unileverScrapePostStart = function(req, res) {
    if(!scrapeUnileverInterval){
        var scraper = new scraperUnileverObject.UniliverScraper();
        scrapeUnileverInterval = scraper.scrapeProductsFromQueue();
        res.status(200).send({ msg: 'started' });
    }else{
        res.status(200).send({ msg: 'running' });
    }
};

exports.unileverScrapePostStop = function(req, res) {
    if(scrapeUnileverInterval){
        clearInterval(scrapeUnileverInterval);
        res.status(200).send({ msg: 'stopped' });
    }else{
        res.status(200).send({ msg: 'already stop' });
    }
};